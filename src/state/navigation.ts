import type { Content, ProfileId, SportId } from '../content/types';
import type { Attempt } from './session';
import { sourceKey, type Envelope, type LegacyEnvelope } from './storage';

export type Route =
  | { screen: 'onboarding'; profileId: ProfileId }
  | { screen: 'recovery'; profileId: ProfileId }
  | { screen: 'profile' | 'sports' | 'classes'; profileId: ProfileId }
  | { screen: 'home'; profileId: ProfileId }
  | { screen: 'journey'; profileId: ProfileId }
  | { screen: 'challenges'; profileId: ProfileId }
  | { screen: 'choice'; profileId: ProfileId; sportId: SportId }
  | { screen: 'plan'; profileId: ProfileId; sportId: SportId; mode: 'solo'; planId: string }
  | { screen: 'catalog'; profileId: ProfileId; sportId: SportId; mode: 'classes' }
  | { screen: 'detail'; profileId: ProfileId; sportId: SportId; mode: 'classes'; classId: string }
  | { screen: 'session'; profileId: ProfileId; sportId: SportId; planId: string; attemptId: string }
  | { screen: 'success'; profileId: ProfileId; sportId: SportId; attemptId: string };

export function safePlan(content: Content, profileId: ProfileId, sportId: SportId) {
  const profile = content.profiles.find(p => p.id === profileId)!;
  return content.plans.find(p => p.id === profile.defaultPlanId && p.sportId === sportId)
    ?? content.plans.find(p => p.profileId === profileId && p.sportId === sportId && p.medium === 'dry-land')!;
}

/** URL identity is navigation only, never session or swimming eligibility. */
export function guardHash(hash: string, content: Content, runtime?: { attempt: Attempt | null; envelope: Envelope | LegacyEnvelope }): Route {
  let parts: string[];
  try { parts = hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent); } catch { parts = []; }
  const actual = runtime?.envelope && 'layout' in runtime.envelope ? runtime.envelope : null;
  const profileId = actual?.preference?.situationId ?? content.profiles.find(p => p.id === parts[0])?.id ?? 'first';
  if (actual && !actual.preference) return {screen:'onboarding',profileId:'first'};
  if (['home','onboarding','recovery','sports','classes','profile','session','success'].includes(parts[0])) {
    if (parts[0] === 'profile') return {screen:parts[1] === 'journey' || parts[1] === 'challenges' ? parts[1] : 'profile',profileId};
    if (parts[0] === 'sports' && parts.length === 1) return {screen:'sports',profileId};
    if (parts[0] === 'classes' && parts.length === 1) return {screen:'classes',profileId};
    if (parts[0] === 'session') {
      const a = runtime?.attempt;
      return a?.status === 'active' && a.attemptId === parts[1] ? {screen:'session',profileId,sportId:a.sportId,planId:a.planId,attemptId:a.attemptId} : {screen:'home',profileId};
    }
    if (parts[0] === 'success') {
      const r = actual?.journey[parts[1]];
      return r?.origin === 'user-simulated' ? {screen:'success',profileId,sportId:r.sportId,attemptId:r.id} : {screen:'home',profileId};
    }
    if (parts[0] === 'sports' && parts.length > 1) parts = [profileId,...parts.slice(1)];
    else return {screen:'home',profileId};
  }
  if (!content.profiles.some(p => p.id === parts[0])) return { screen: 'home', profileId };
  if ((parts[1] === 'journey' || parts[1] === 'challenges') && parts.length === 2) return {screen:parts[1],profileId};
  const sportId = content.sports.find(s => s.id === parts[1])?.id;
  if (!sportId) return { screen: 'home', profileId };
  if (parts[2] === 'session') {
    const a = runtime?.attempt;
    if (a?.status === 'active' && a.profileId === profileId && a.sportId === sportId && a.planId === parts[3] && a.attemptId === parts[4] && parts.length === 5) return { screen: 'session', profileId, sportId, planId: a.planId, attemptId: a.attemptId };
    const plan = content.plans.find(p => p.id === parts[3] && p.profileId === profileId && p.sportId === sportId && p.medium === 'dry-land');
    if (plan && parts.length === 5) return { screen: 'plan', profileId, sportId, mode: 'solo', planId: plan.id };
  }
  if (parts[2] === 'success' && parts.length === 4) {
    const e = runtime?.envelope;
    const r = e && ('layout' in e ? e.journey[sourceKey('actual','completion',parts[3])] : e.profiles[profileId].completions[parts[3]]);
    if (r?.sportId === sportId) return { screen: 'success', profileId, sportId, attemptId: r.id };
  }
  if (parts[2] === 'classes') {
    const item = content.classes.find(c => c.id === parts[3] && c.sportId === sportId);
    if (item && parts.length === 4) return { screen: 'detail', profileId, sportId, mode: 'classes', classId: item.id };
    return { screen: 'catalog', profileId, sportId, mode: 'classes' };
  }
  if (parts[2] === 'solo' && parts.length === 4) {
    const plan = content.plans.find(p => p.id === parts[3] && p.profileId === profileId && p.sportId === sportId && p.medium === 'dry-land');
    if (plan) return { screen: 'plan', profileId, sportId, mode: 'solo', planId: plan.id };
  }
  return { screen: 'choice', profileId, sportId };
}

export function routeHash(route: Route): string {
  if (['home','onboarding','recovery','profile','sports','classes'].includes(route.screen)) return `#/${route.screen}`;
  if (route.screen === 'journey' || route.screen === 'challenges') return `#/profile/${route.screen}`;
  if (route.screen === 'session') return `#/session/${encodeURIComponent(route.attemptId)}`;
  if (route.screen === 'success') return `#/success/${encodeURIComponent(sourceKey('actual','completion',route.attemptId))}`;
  if (!('sportId' in route)) return '#/home';
  const sport = `#/sports/${route.sportId}`;
  if (route.screen === 'detail') return `${sport}/classes/${route.classId}`;
  if (route.screen === 'plan') return `${sport}/solo/${route.planId}`;
  return route.screen === 'catalog' ? `${sport}/classes` : sport;
}
