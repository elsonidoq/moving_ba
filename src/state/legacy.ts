import type { Medium, ProfileId, SportId } from '../content/types';
import { activityDate } from './dates';
const profileIds = ['first', 'returning', 'regular'] as const;
const sportIds = ['calisthenics', 'yoga', 'swimming'];
export interface HistoryRecord {
  id: string; profileId: ProfileId; sportId: SportId; planId: string;
  planTitle: string; sportTitle: string; medium: Medium; activityDate: string;
  origin: 'seed' | 'user-simulated'; attemptId?: string; completedStepIds?: string[]; timestamp?: string;
}
export interface Interest {
  classId: string; profileId: ProfileId; sportId: SportId; classTitle: string; sportTitle: string;
  timestamp: string; origin: 'simulated-interest';
}
export interface LegacyEnvelope {
  schemaVersion: 1; selectedProfileId: ProfileId; scenarioReferenceDate: string;
  profiles: Record<ProfileId, { baselineHistory: HistoryRecord[]; completions: Record<string, HistoryRecord>; interests: Record<string, Interest> }>;
}
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const date = (v: unknown): v is string => text(v) && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
const timestamp = (v: unknown) => text(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString() === v;
/** Retired plan/class IDs are valid history; unknown profile/sport identities are not. */
export function validateLegacyEnvelope(value: unknown): LegacyEnvelope {
  const fail = (): never => { throw new Error('No pudimos validar los datos guardados. Confirmá el reinicio de tus datos para continuar.'); };
  if (!object(value) || value.schemaVersion !== 1 || !profileIds.includes(value.selectedProfileId as ProfileId) || !date(value.scenarioReferenceDate) || !object(value.profiles)) return fail();
  if (Object.keys(value).some(k => !['schemaVersion', 'selectedProfileId', 'scenarioReferenceDate', 'profiles'].includes(k)) || Object.keys(value.profiles).length !== profileIds.length) return fail();
  for (const id of profileIds) {
    const data = value.profiles[id];
    if (!object(data) || !Array.isArray(data.baselineHistory) || !object(data.completions) || !object(data.interests) || Object.keys(data).some(k => !['baselineHistory', 'completions', 'interests'].includes(k))) return fail();
    const ids = new Set<string>();
    const record = (r: unknown, origin: HistoryRecord['origin'], key?: string) => {
      if (!object(r) || !text(r.id) || ids.has(r.id) || r.profileId !== id || !sportIds.includes(String(r.sportId)) || !text(r.planId) || !text(r.planTitle) || !text(r.sportTitle) || !['dry-land', 'water'].includes(String(r.medium)) || (r.medium === 'water' && r.sportId !== 'swimming') || !date(r.activityDate) || r.origin !== origin) return fail();
      const fields = ['id', 'profileId', 'sportId', 'planId', 'planTitle', 'sportTitle', 'medium', 'activityDate', 'origin', ...(origin === 'user-simulated' ? ['attemptId', 'completedStepIds', 'timestamp'] : [])];
      if (Object.keys(r).some(k => !fields.includes(k))) return fail();
      if (origin === 'seed' && r.activityDate > String(value.scenarioReferenceDate)) return fail();
      if (origin === 'user-simulated' && (r.attemptId !== key || r.id !== key || !timestamp(r.timestamp) || activityDate(new Date(String(r.timestamp))) !== r.activityDate || !Array.isArray(r.completedStepIds) || !r.completedStepIds.length || !r.completedStepIds.every(text) || new Set(r.completedStepIds).size !== r.completedStepIds.length)) return fail();
      ids.add(r.id);
    };
    data.baselineHistory.forEach(r => record(r, 'seed'));
    Object.entries(data.completions).forEach(([key, r]) => record(r, 'user-simulated', key));
    for (const [key, r] of Object.entries(data.interests)) {
      if (!object(r) || Object.keys(r).some(k => !['classId', 'profileId', 'sportId', 'classTitle', 'sportTitle', 'timestamp', 'origin'].includes(k)) || r.classId !== key || !text(key) || r.profileId !== id || !sportIds.includes(String(r.sportId)) || !text(r.classTitle) || !text(r.sportTitle) || !timestamp(r.timestamp) || r.origin !== 'simulated-interest') return fail();
    }
  }
  return value as unknown as LegacyEnvelope;
}
