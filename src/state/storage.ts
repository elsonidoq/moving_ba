import type { ClassListing, Content, ProfileId, SportId } from '../content/types';
import { validateLegacyEnvelope, type HistoryRecord, type Interest, type LegacyEnvelope } from './legacy';
export type { HistoryRecord, Interest, LegacyEnvelope } from './legacy';
export { activityDate } from './dates';
export { validateLegacyEnvelope } from './legacy';
export const storageKey = 'ba-en-movimiento:demo:v1';
export type StorageStatus = 'ready' | 'invalid' | 'unavailable';
export type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
export interface Envelope {
  schemaVersion: 1; layout: 'one-person';
  preference: null | { situationId: ProfileId; confirmed: true };
  journey: Record<string, HistoryRecord>;
  interests: Record<string, Interest>;
  intention: null | { classId: string; sportId: SportId; classSnapshot: ClassListing; chosenAt: string; origin: 'simulated-intention' };
  legacySource?: LegacyEnvelope;
}
const profileIds: ProfileId[] = ['first', 'returning', 'regular'];
const sportIds = ['calisthenics', 'yoga', 'swimming'];
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string' && !!v.trim();
const stamp = (v: unknown): v is string => text(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString() === v;
const logicalJSON = (v: unknown): string => JSON.stringify(v, (_key, item: unknown) => object(item) ? Object.fromEntries(Object.keys(item).sort().map(k => [k,item[k]])) : item);
const only = (v: Record<string, unknown>, keys: string[]) => Object.keys(v).every(k => keys.includes(k));
function fail(): never { throw new Error('No pudimos validar los datos guardados. Confirmá el reinicio de esta demo para continuar.'); }
export const sourceKey = (...tuple: string[]) => JSON.stringify(tuple);
/** New/reset actual state is deliberately independent of demo fixtures. */
export function materialize(_content?: Content): Envelope {
  return { schemaVersion: 1, layout: 'one-person', preference: null, journey: {}, interests: {}, intention: null };
}
export function normalizeLegacy(input: LegacyEnvelope): Envelope {
  const legacy = validateLegacyEnvelope(input);
  const e = materialize();
  for (const p of profileIds) {
    const data = legacy.profiles[p];
    for (const r of [...data.baselineHistory].sort((a,b) => a.id.localeCompare(b.id))) e.journey[sourceKey('legacy',p,'baseline',r.id)] = structuredClone(r);
    for (const id of Object.keys(data.completions).sort()) e.journey[sourceKey('legacy',p,'completion',id)] = structuredClone(data.completions[id]);
    for (const id of Object.keys(data.interests).sort()) e.interests[sourceKey('legacy',p,'interest',id)] = structuredClone(data.interests[id]);
  }
  e.legacySource = structuredClone(legacy);
  return e;
}
/** Compatibility projection for not-yet-migrated screens only; never serialized or counted as another ledger. */
export function legacyView(e: Envelope): LegacyEnvelope {
  const profiles = Object.fromEntries(profileIds.map(p => [p,{baselineHistory:[],completions:{},interests:{}}])) as unknown as LegacyEnvelope['profiles'];
  const p = e.preference?.situationId ?? 'first';
  for (const [key,r] of Object.entries(e.journey)) {
    if (r.origin === 'seed') profiles[p].baselineHistory.push(r);
    else profiles[p].completions[key === sourceKey('actual','completion',r.attemptId ?? '') ? r.id : key] = r;
  }
  for (const [key,r] of Object.entries(e.interests)) profiles[p].interests[key] = r;
  // Bare-ID aliases support the old detail screen; this view is never a selector input or durable state.
  for (const r of Object.values(e.interests)) if (!profiles[p].interests[r.classId]) profiles[p].interests[r.classId] = r;
  return {schemaVersion:1,selectedProfileId:p,scenarioReferenceDate:e.legacySource?.scenarioReferenceDate ?? '2026-10-14',profiles};
}
function recordValid(record: unknown, interest: boolean): void {
  if (!object(record) || !profileIds.includes(record.profileId as ProfileId)) fail();
  const skeleton: LegacyEnvelope = {schemaVersion:1,selectedProfileId:'first',scenarioReferenceDate:'9999-12-31',profiles:{first:{baselineHistory:[],completions:{},interests:{}},returning:{baselineHistory:[],completions:{},interests:{}},regular:{baselineHistory:[],completions:{},interests:{}}}};
  const data = skeleton.profiles[record.profileId as ProfileId];
  if (interest) data.interests[String(record.classId)] = record as unknown as Interest;
  else if (record.origin === 'seed') data.baselineHistory.push(record as unknown as HistoryRecord);
  else data.completions[String(record.attemptId)] = record as unknown as HistoryRecord;
  validateLegacyEnvelope(skeleton);
}
export function validateEnvelope(value: unknown, _content?: Content): Envelope {
  if (!object(value) || value.layout !== 'one-person' || value.schemaVersion !== 1 || !only(value,['schemaVersion','layout','preference','journey','interests','intention','legacySource']) || !object(value.journey) || !object(value.interests)) fail();
  if (value.preference !== null && (!object(value.preference) || !only(value.preference,['situationId','confirmed']) || value.preference.confirmed !== true || !profileIds.includes(value.preference.situationId as ProfileId))) fail();
  const imported = value.legacySource === undefined ? null : normalizeLegacy(validateLegacyEnvelope(value.legacySource));
  for (const [collection, kind] of [[value.journey,'completion'],[value.interests,'interest']] as const) {
    for (const [key,record] of Object.entries(collection)) {
      recordValid(record,kind === 'interest');
      if (!object(record)) fail();
      let tuple: unknown; try { tuple = JSON.parse(key); } catch { fail(); }
      if (!Array.isArray(tuple) || tuple.some(x => typeof x !== 'string') || JSON.stringify(tuple) !== key) fail();
      if (tuple[0] === 'legacy') {
        const original = kind === 'interest' ? imported?.interests[key] : imported?.journey[key];
        if (!original || logicalJSON(original) !== logicalJSON(record)) fail();
      } else if (tuple[0] !== 'actual' || tuple.length !== 3 || tuple[1] !== kind || tuple[2] !== record[kind === 'interest' ? 'classId' : 'attemptId'] || (kind === 'completion' && record.origin !== 'user-simulated')) fail();
    }
  }
  const journey = value.journey; const interests = value.interests;
  if (imported && (Object.keys(imported.journey).some(k => !(k in journey)) || Object.keys(imported.interests).some(k => !(k in interests)))) fail();
  if (value.intention !== null) {
    const i = value.intention;
    if (!object(i) || !only(i,['classId','sportId','classSnapshot','chosenAt','origin']) || !text(i.classId) || !sportIds.includes(String(i.sportId)) || !stamp(i.chosenAt) || i.origin !== 'simulated-intention' || !object(i.classSnapshot)) fail();
    const s = i.classSnapshot;
    if (!only(s,['id','sportId','title','schedule','venue','locality','level','requirements','description','receiver','contactCopy','price','fictional']) || s.id !== i.classId || s.sportId !== i.sportId || s.fictional !== true || !['title','schedule','venue','locality','level','description','receiver','contactCopy'].every(k => text(s[k]) && !/[<>]/.test(String(s[k]))) || !Array.isArray(s.requirements) || !s.requirements.length || !s.requirements.every(text) || !object(s.price) || !only(s.price,['kind','amount','currency']) || s.price.currency !== 'ARS' || typeof s.price.amount !== 'number' || !Number.isFinite(s.price.amount) || (s.price.kind === 'free' ? s.price.amount !== 0 : s.price.kind !== 'paid' || s.price.amount <= 0)) fail();
  }
  return value as unknown as Envelope;
}
export interface Loaded { envelope: Envelope; status: StorageStatus; readBlocked: boolean }
export function loadEnvelope(_content: Content, port: StoragePort): Loaded {
  let raw: string | null;
  try { raw = port.getItem(storageKey); } catch { return {envelope:materialize(),status:'unavailable',readBlocked:true}; }
  if (raw === null) return {envelope:materialize(),status:'ready',readBlocked:false};
  try {
    const value: unknown = JSON.parse(raw);
    const envelope = object(value) && 'layout' in value ? validateEnvelope(value) : normalizeLegacy(validateLegacyEnvelope(value));
    return {envelope,status:'ready',readBlocked:false};
  } catch { return {envelope:materialize(),status:'invalid',readBlocked:true}; }
}
/** Caller must supply custody from the last read; invalid/unknown durable bytes cannot be overwritten. */
export function saveEnvelope(envelope: Envelope, port: StoragePort, custody: {status: StorageStatus; readBlocked: boolean}): StorageStatus {
  if (custody.status === 'invalid') return 'invalid';
  if (custody.readBlocked) return 'unavailable';
  validateEnvelope(envelope);
  try { port.setItem(storageKey,JSON.stringify(envelope)); return 'ready'; } catch { return 'unavailable'; }
}
export function resetEnvelope(port: StoragePort, confirmed: boolean): Loaded | null {
  if (!confirmed) return null;
  const envelope = materialize();
  const status = saveEnvelope(envelope,port,{status:'ready',readBlocked:false});
  return {envelope,status,readBlocked:status !== 'ready'};
}
export function registerInterest(envelope: Envelope, content: Content, profileId: ProfileId, sportId: SportId, classId: string, now = new Date()): Envelope {
  const item = content.classes.find(c => c.id === classId && c.sportId === sportId);
  if (!item || Object.values(envelope.interests).some(i => i.classId === classId)) return envelope;
  const record: Interest = {classId,profileId,sportId,classTitle:item.title,sportTitle:content.sports.find(s => s.id === sportId)!.name,timestamp:now.toISOString(),origin:'simulated-interest'};
  return {...envelope,interests:{...envelope.interests,[sourceKey('actual','interest',classId)]:record}};
}
export function upsertCompletion(envelope: Envelope, record: HistoryRecord): Envelope {
  const key = sourceKey('actual','completion',record.attemptId!);
  if (envelope.journey[key]) return envelope;
  return {...envelope,journey:{...envelope.journey,[key]:record}};
}
export function setIntention(envelope: Envelope, content: Content, classId: string, now = new Date()): Envelope {
  const item = content.classes.find(c => c.id === classId);
  if (!item || envelope.intention?.classId === classId) return envelope;
  return {...envelope,intention:{classId,sportId:item.sportId,classSnapshot:structuredClone(item),chosenAt:now.toISOString(),origin:'simulated-intention'}};
}
