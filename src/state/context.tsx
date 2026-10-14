import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Content } from '../content/types';
import { guardHash, routeHash, type Route } from './navigation';
import { abandonSession, completeStep, startSession, type Attempt } from './session';
import { loadEnvelope, materialize, registerInterest, saveEnvelope, storageKey, type Envelope, type StorageStatus } from './storage';

type Runtime = { route: Route; attempt: Attempt | null; envelope: Envelope; status: StorageStatus; canSwim: boolean; safePool: boolean };
type AppState = Runtime & { content: Content; navigate: (route: Route) => void; affirm: (key: 'canSwim' | 'safePool', value: boolean) => void; start: (water?: boolean) => void; complete: (attemptId: string, stepId: string) => void; recover: () => void; interest: () => void };
const AppContext = createContext<AppState | null>(null);
const browserStorage = { getItem: (key: string) => window.localStorage.getItem(key), setItem: (key: string, value: string) => window.localStorage.setItem(key, value) };
export function AppProvider({ content, children }: { content: Content; children: ReactNode }) {
  const [state, setState] = useState<Runtime>(() => {
    const loaded = loadEnvelope(content, browserStorage);
    const hash = window.location.hash || `#/${loaded.envelope.selectedProfileId}/home`;
    return { ...loaded, route: guardHash(hash, content, { attempt: null, envelope: loaded.envelope }), attempt: null, canSwim: false, safePool: false };
  });
  const current = useRef(state);
  const update = (next: Runtime) => { current.current = next; setState(next); };
  const persist = (s: Runtime, envelope: Envelope): Runtime => ({ ...s, envelope, status: s.status === 'invalid' ? 'invalid' : saveEnvelope(envelope, browserStorage) });
  const sync = () => {
    let s = current.current;
    const next = guardHash(window.location.hash, content, s);
    if (routeHash(next) !== routeHash(s.route)) s = { ...s, attempt: abandonSession(s.attempt), canSwim: false, safePool: false };
    if (s.envelope.selectedProfileId !== next.profileId) s = persist(s, { ...s.envelope, selectedProfileId: next.profileId });
    const canonical = routeHash(next);
    if (window.location.hash !== canonical) window.history.replaceState(null, '', canonical);
    update({ ...s, route: next });
  };
  useEffect(() => {
    if (!window.location.hash) window.history.replaceState(null, '', routeHash(current.current.route));
    sync();
    const reload = (event: StorageEvent) => {
      if (event.key !== storageKey && event.key !== null) return;
      const loaded = loadEnvelope(content, browserStorage);
      const next = { ...current.current, ...loaded, attempt: null, canSwim: false, safePool: false };
      next.route = { screen: 'home', profileId: loaded.envelope.selectedProfileId };
      update(next); window.history.replaceState(null, '', routeHash(next.route));
    };
    window.addEventListener('hashchange', sync); window.addEventListener('storage', reload);
    return () => { window.removeEventListener('hashchange', sync); window.removeEventListener('storage', reload); };
  }, [content]);
  const navigate = (route: Route) => { window.location.hash = routeHash(route); sync(); };
  const start = (water = false) => {
    let s = current.current;
    if (s.route.screen !== 'plan' || s.status === 'invalid') return;
    const planId = water ? content.plans.find(p => p.profileId === s.route.profileId && p.sportId === 'swimming' && p.medium === 'water')?.id : s.route.planId;
    if (!planId || (water && s.route.sportId !== 'swimming')) return;
    const attempt = startSession(content, { profileId: s.route.profileId, sportId: s.route.sportId, planId, canSwim: s.canSwim, safePool: s.safePool });
    if (!attempt) return;
    const route: Route = { screen: 'session', profileId: attempt.profileId, sportId: attempt.sportId, planId: attempt.planId, attemptId: attempt.attemptId };
    s = { ...s, attempt, route }; update(s); window.location.hash = routeHash(route);
  };
  const complete = (attemptId: string, stepId: string) => {
    const s = current.current;
    if (s.route.screen !== 'session' || s.status === 'invalid') return;
    const result = completeStep(s.attempt, s.envelope, attemptId, stepId);
    if (result.attempt === s.attempt) return;
    let next = { ...s, ...result };
    if (result.envelope !== s.envelope) next = persist(next, result.envelope);
    if (result.attempt?.status === 'completed') next.route = { screen: 'success', profileId: result.attempt.profileId, sportId: result.attempt.sportId, attemptId };
    update(next); window.location.hash = routeHash(next.route);
  };
  const interest = () => {
    const s = current.current;
    if (s.route.screen !== 'detail' || s.status === 'invalid') return;
    const envelope = registerInterest(s.envelope, content, s.route.profileId, s.route.sportId, s.route.classId);
    if (envelope !== s.envelope) update(persist(s, envelope));
  };
  const recover = () => {
    const envelope = materialize(content);
    const next: Runtime = { envelope, status: saveEnvelope(envelope, browserStorage), attempt: null, canSwim: false, safePool: false, route: { screen: 'home', profileId: envelope.selectedProfileId } };
    update(next); window.location.hash = routeHash(next.route);
  };
  return <AppContext.Provider value={{ ...state, content, navigate, start, complete, recover, interest, affirm: (key, value) => update({ ...current.current, [key]: value }) }}>{children}</AppContext.Provider>;
}
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('AppProvider is required');
  return context;
}
