import type { Content, Medium, ProfileId, SportId } from '../content/types';
import { activityDate } from './dates';
export { activityDate } from './dates';

export const storageKey = 'ba-en-movimiento:demo:v1';
export interface HistoryRecord {
  id: string; profileId: ProfileId; sportId: SportId; planId: string;
  planTitle: string; sportTitle: string; medium: Medium; activityDate: string;
  origin: 'seed' | 'user-simulated'; attemptId?: string; completedStepIds?: string[]; timestamp?: string;
}
export interface Interest {
  classId: string; profileId: ProfileId; sportId: SportId; classTitle: string; sportTitle: string;
  timestamp: string; origin: 'simulated-interest';
}
export interface Envelope {
  schemaVersion: 1; selectedProfileId: ProfileId; scenarioReferenceDate: string;
  profiles: Record<ProfileId, { baselineHistory: HistoryRecord[]; completions: Record<string, HistoryRecord>; interests: Record<string, Interest> }>;
}
export type StorageStatus = 'ready' | 'invalid' | 'unavailable';
export type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
export function materialize(content: Content): Envelope {
  const profiles = Object.fromEntries(content.profiles.map(profile => [profile.id, {
    baselineHistory: content.scenarios.profiles.find(s => s.profileId === profile.id)!.history.map(seed => {
      const plan = content.plans.find(p => p.id === seed.planId)!;
      return { ...seed, profileId: profile.id, planTitle: plan.name, sportTitle: content.sports.find(s => s.id === seed.sportId)!.name, medium: plan.medium, origin: 'seed' };
    }), completions: {}, interests: {},
  }])) as Envelope['profiles'];
  return { schemaVersion: 1, selectedProfileId: content.scenarios.defaultProfileId, scenarioReferenceDate: content.scenarios.referenceDate, profiles };
}
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const date = (v: unknown): v is string => text(v) && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
const timestamp = (v: unknown) => text(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString() === v;
/** Retired plan/class IDs are valid history; unknown profile/sport identities are not. */
export function validateEnvelope(value: unknown, content: Content): Envelope {
  const fail = (): never => { throw new Error(content.ui.storageRecovery); };
  if (!object(value) || value.schemaVersion !== 1 || !content.profiles.some(p => p.id === value.selectedProfileId) || !date(value.scenarioReferenceDate) || !object(value.profiles)) return fail();
  if (Object.keys(value).some(k => !['schemaVersion', 'selectedProfileId', 'scenarioReferenceDate', 'profiles'].includes(k)) || Object.keys(value.profiles).length !== content.profiles.length) return fail();
  for (const profile of content.profiles) {
    const data = value.profiles[profile.id];
    if (!object(data) || !Array.isArray(data.baselineHistory) || !object(data.completions) || !object(data.interests) || Object.keys(data).some(k => !['baselineHistory', 'completions', 'interests'].includes(k))) return fail();
    const ids = new Set<string>();
    const record = (r: unknown, origin: HistoryRecord['origin'], key?: string) => {
      if (!object(r) || !text(r.id) || ids.has(r.id) || r.profileId !== profile.id || !content.sports.some(s => s.id === r.sportId) || !text(r.planId) || !text(r.planTitle) || !text(r.sportTitle) || !['dry-land', 'water'].includes(String(r.medium)) || (r.medium === 'water' && r.sportId !== 'swimming') || !date(r.activityDate) || r.origin !== origin) return fail();
      const fields = ['id', 'profileId', 'sportId', 'planId', 'planTitle', 'sportTitle', 'medium', 'activityDate', 'origin', ...(origin === 'user-simulated' ? ['attemptId', 'completedStepIds', 'timestamp'] : [])];
      if (Object.keys(r).some(k => !fields.includes(k))) return fail();
      if (origin === 'seed' && r.activityDate > String(value.scenarioReferenceDate)) return fail();
      if (origin === 'user-simulated' && (r.attemptId !== key || r.id !== key || !timestamp(r.timestamp) || activityDate(new Date(String(r.timestamp))) !== r.activityDate || !Array.isArray(r.completedStepIds) || !r.completedStepIds.length || !r.completedStepIds.every(text) || new Set(r.completedStepIds).size !== r.completedStepIds.length)) return fail();
      ids.add(r.id);
    };
    data.baselineHistory.forEach(r => record(r, 'seed'));
    Object.entries(data.completions).forEach(([key, r]) => record(r, 'user-simulated', key));
    for (const [key, r] of Object.entries(data.interests)) {
      if (!object(r) || Object.keys(r).some(k => !['classId', 'profileId', 'sportId', 'classTitle', 'sportTitle', 'timestamp', 'origin'].includes(k)) || r.classId !== key || !text(key) || r.profileId !== profile.id || !content.sports.some(s => s.id === r.sportId) || !text(r.classTitle) || !text(r.sportTitle) || !timestamp(r.timestamp) || r.origin !== 'simulated-interest') return fail();
    }
  }
  return value as unknown as Envelope;
}
export function saveEnvelope(envelope: Envelope, port: StoragePort): StorageStatus {
  try { port.setItem(storageKey, JSON.stringify(envelope)); return 'ready'; } catch { return 'unavailable'; }
}
export function loadEnvelope(content: Content, port: StoragePort): { envelope: Envelope; status: StorageStatus } {
  let raw: string | null;
  try { raw = port.getItem(storageKey); } catch { return { envelope: materialize(content), status: 'unavailable' }; }
  if (raw === null) { const envelope = materialize(content); return { envelope, status: saveEnvelope(envelope, port) }; }
  try { return { envelope: validateEnvelope(JSON.parse(raw), content), status: 'ready' }; }
  catch { return { envelope: materialize(content), status: 'invalid' }; }
}
export function registerInterest(envelope: Envelope, content: Content, profileId: ProfileId, sportId: SportId, classId: string, now = new Date()): Envelope {
  const item = content.classes.find(c => c.id === classId && c.sportId === sportId);
  const data = envelope.profiles[profileId];
  if (!item || !data || data.interests[classId]) return envelope;
  const interest: Interest = { classId, profileId, sportId, classTitle: item.title, sportTitle: content.sports.find(s => s.id === sportId)!.name, timestamp: now.toISOString(), origin: 'simulated-interest' };
  return { ...envelope, profiles: { ...envelope.profiles, [profileId]: { ...data, interests: { ...data.interests, [classId]: interest } } } };
}
export function upsertCompletion(envelope: Envelope, record: HistoryRecord): Envelope {
  const data = envelope.profiles[record.profileId];
  if (data.completions[record.id]) return envelope;
  return { ...envelope, profiles: { ...envelope.profiles, [record.profileId]: { ...data, completions: { ...data.completions, [record.id]: record } } } };
}
