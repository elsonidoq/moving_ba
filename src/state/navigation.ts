import type { Content, ProfileId, SportId } from '../content/types';
import type { Attempt } from './session';
import type { Envelope } from './storage';

export type Route =
  | { screen: 'home'; profileId: ProfileId }
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
export function guardHash(hash: string, content: Content, runtime?: { attempt: Attempt | null; envelope: Envelope }): Route {
  const parts = hash.replace(/^#\/?/, '').split('/');
  const profileId = content.profiles.find(p => p.id === parts[0])?.id ?? content.scenarios.defaultProfileId;
  if (!content.profiles.some(p => p.id === parts[0])) return { screen: 'home', profileId };
  const sportId = content.sports.find(s => s.id === parts[1])?.id;
  if (!sportId) return { screen: 'home', profileId };
  if (parts[2] === 'session') {
    const a = runtime?.attempt;
    if (a?.status === 'active' && a.profileId === profileId && a.sportId === sportId && a.planId === parts[3] && a.attemptId === parts[4] && parts.length === 5) return { screen: 'session', profileId, sportId, planId: a.planId, attemptId: a.attemptId };
    const plan = content.plans.find(p => p.id === parts[3] && p.profileId === profileId && p.sportId === sportId && p.medium === 'dry-land');
    if (plan && parts.length === 5) return { screen: 'plan', profileId, sportId, mode: 'solo', planId: plan.id };
  }
  if (parts[2] === 'success' && parts.length === 4) {
    const r = runtime?.envelope.profiles[profileId].completions[parts[3]];
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
  const base = `#/${route.profileId}`;
  if (route.screen === 'home') return `${base}/home`;
  const sport = `${base}/${route.sportId}`;
  if (route.screen === 'detail') return `${sport}/classes/${route.classId}`;
  if (route.screen === 'session') return `${sport}/session/${route.planId}/${route.attemptId}`;
  if (route.screen === 'success') return `${sport}/success/${route.attemptId}`;
  if (route.screen === 'plan') return `${sport}/solo/${route.planId}`;
  return `${sport}/${route.screen === 'catalog' ? 'classes' : 'choice'}`;
}
