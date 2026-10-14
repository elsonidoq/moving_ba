import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { Content } from '../src/content/types';
import { startSession, completeStep, abandonSession } from '../src/state/session';
import { materialize, loadEnvelope, saveEnvelope, validateEnvelope, storageKey, registerInterest } from '../src/state/storage';
import { guardHash } from '../src/state/navigation';
const content = JSON.parse(readFileSync('public/config/app-content.json', 'utf8')) as Content;
const now = new Date('2026-10-14T15:00:00.000Z');
const input = { profileId: 'first', sportId: 'calisthenics', planId: 'cal-first', canSwim: false, safePool: false } as const;

test('session integrity ordered explicit events, replay, abandonment and durable atomic upsert', () => {
  let envelope = materialize(content);
  let attempt = startSession(content, input, () => 'attempt-one')!;
  expect(Object.keys(envelope.profiles.first.completions)).toHaveLength(0);
  for (const [id, step] of [['wrong', attempt.steps[0].id], [attempt.attemptId, 'wrong'], [attempt.attemptId, attempt.steps.at(-1)!.id]]) {
    expect(completeStep(attempt, envelope, id, step, now)).toEqual({ attempt, envelope });
  }
  const original = structuredClone(attempt);
  for (const step of original.steps) {
    expect(attempt.steps[attempt.cursor].id).toBe(step.id);
    const previous = attempt;
    ({ attempt: attempt, envelope } = completeStep(attempt, envelope, attempt.attemptId, step.id, now) as {attempt: typeof attempt; envelope: typeof envelope});
    expect(completeStep(attempt, envelope, original.attemptId, step.id, now)).toEqual({ attempt, envelope });
    console.log('accepted', original.attemptId, step.id, 'cursor', previous.cursor, '->', attempt.cursor, 'stored', Object.keys(envelope.profiles.first.completions));
  }
  expect(attempt.status).toBe('completed');
  expect(envelope.profiles.first.completions['attempt-one'].completedStepIds).toEqual(original.steps.map(s => s.id));
  const store = new Map<string,string>(); const port = {getItem: (k: string) => store.get(k) ?? null, setItem: (k: string,v: string) => {store.set(k,v);}};
  expect(saveEnvelope(envelope, port)).toBe('ready');
  const refreshed = loadEnvelope(content, port).envelope;
  expect(Object.keys(refreshed.profiles.first.completions)).toEqual(['attempt-one']);
  for (const hash of ['#/first/calisthenics/choice', '#/first/calisthenics/success/attempt-one', '#/first/calisthenics/session/cal-first/attempt-one']) guardHash(hash, content, {attempt, envelope});
  expect(completeStep(attempt, refreshed, original.attemptId, original.steps.at(-1)!.id, now).envelope).toBe(refreshed);
  let second = startSession(content, input, () => 'attempt-two')!;
  for (const step of second.steps) { const result = completeStep(second, envelope, second.attemptId, step.id, now); second = result.attempt!; envelope = result.envelope; }
  expect(Object.keys(envelope.profiles.first.completions)).toEqual(['attempt-one','attempt-two']);
  expect(envelope.profiles.returning.completions).toEqual({});
  const partial = startSession(content, input, () => 'partial')!;
  const advanced = completeStep(partial, envelope, partial.attemptId, partial.steps[0].id, now).attempt!;
  expect(completeStep(abandonSession(advanced), envelope, partial.attemptId, partial.steps[1].id, now).envelope).toBe(envelope);
  expect(guardHash('#/first/calisthenics/session/cal-first/partial', content, {attempt: null, envelope}).screen).toBe('plan');
  console.log('final envelope', JSON.stringify(envelope));
});
test('swimming start guard forged/direct inputs and profile never grants ability', () => {
  for (const profile of content.profiles) for (const canSwim of [false,true]) for (const safePool of [false,true]) {
    const gate = { profileId: profile.id, sportId: 'swimming' as const, planId: `swim-water-${profile.id}`, canSwim, safePool };
    const result = startSession(content, gate, () => 'swim-attempt');
    expect(!!result).toBe(canSwim && safePool);
    console.log('START', gate, 'allowed', result?.planId ?? null);
  }
  expect(startSession(content, {...input, planId:'swim-water-first', canSwim:true,safePool:true})).toBeNull();
  expect(startSession(content, {...input, sportId:'swimming',planId:'swim-dry-first'})).not.toBeNull();
  expect(guardHash('#/regular/swimming/session/swim-water-regular/forged', content).screen).toBe('choice');
});
test('storage envelope validation, scoped writes, retired snapshots and unavailable memory', () => {
  const sentinel = 'untouched'; const values = new Map([['unrelated',sentinel]]);
  const writes: string[] = [];
  const port = {getItem: (k: string) => values.get(k) ?? null, setItem: (k: string,v: string) => {writes.push(k);values.set(k,v);}};
  const loaded = loadEnvelope(content,port); expect(loaded.status).toBe('ready');
  const edited = structuredClone(content); edited.scenarios.profiles[1].history = [];
  expect(loadEnvelope(edited,port).envelope).toEqual(loaded.envelope);
  const retired = structuredClone(loaded.envelope); retired.profiles.returning.baselineHistory[0].planId = 'retired-plan';
  expect(validateEnvelope(retired,content)).toEqual(retired);
  for (const mutation of [(e: any) => e.schemaVersion=2, (e: any) => e.selectedProfileId='unknown', (e: any) => e.profiles.returning.baselineHistory[0].sportId='unknown', (e: any) => e.profiles.returning.baselineHistory[0].profileId='unknown']) {
    const invalid = structuredClone(loaded.envelope); mutation(invalid); values.set(storageKey,JSON.stringify(invalid));
    expect(loadEnvelope(content,port).status).toBe('invalid');
    expect(() => validateEnvelope(invalid,content)).toThrow(content.ui.storageRecovery);
  }
  values.set(storageKey,'{'); expect(loadEnvelope(content,port).status).toBe('invalid');
  const denied = { getItem: () => {throw Error('denied');}, setItem: () => {throw Error('denied');} };
  expect(loadEnvelope(content,denied).status).toBe('unavailable');
  expect(saveEnvelope(loaded.envelope,denied)).toBe('unavailable');
  expect(values.get('unrelated')).toBe(sentinel); expect(new Set(writes)).toEqual(new Set([storageKey]));
  console.log('one-key writes', writes, 'sentinel',values.get('unrelated'),'invalid Spanish',content.ui.storageRecovery,'unavailable',content.ui.storageWarning);
});

test('class identity exact six fields, order independence, interest never credit', () => {
  let envelope = materialize(content);
  const before = JSON.stringify(content.profiles.map(p => [envelope.profiles[p.id].baselineHistory,envelope.profiles[p.id].completions]));
  const reordered = {...content, classes:[...content.classes].reverse()};
  for (const sport of content.sports) for (const kind of ['free','paid']) {
    const item = content.classes.find(c=>c.sportId===sport.id && c.price.kind===kind)!;
    expect(item).toBeTruthy(); expect(item.price.amount).toBe(kind==='free'?0:item.price.amount);
    if(kind==='paid')expect(item.price.amount).toBeGreaterThan(0);
    expect(item.price.currency).toBe('ARS');expect(item.fictional).toBe(true);expect(item.receiver).toBe('A confirmar');
    for(const field of ['title','schedule','venue','locality','level','description','receiver','contactCopy'] as const)expect(item[field]).not.toBe('');
    expect(item.requirements.length).toBeGreaterThan(0);
    const hash=`#/first/${sport.id}/classes/${item.id}`;
    expect(guardHash(hash,reordered)).toEqual({screen:'detail',profileId:'first',sportId:sport.id,mode:'classes',classId:item.id});
    envelope=registerInterest(envelope,reordered,'first',sport.id,item.id,now);
    expect(registerInterest(envelope,reordered,'first',sport.id,item.id,now)).toBe(envelope);
    expect(envelope.profiles.first.interests[item.id].classTitle).toBe(item.title);
    console.log('class',JSON.stringify(item),'interest key',item.id);
  }
  expect(JSON.stringify(content.profiles.map(p => [envelope.profiles[p.id].baselineHistory,envelope.profiles[p.id].completions]))).toBe(before);
  expect(Object.keys(envelope.profiles.first)).toEqual(['baselineHistory','completions','interests']);
  const removed={...content,classes:content.classes.filter(c=>c.id!=='yoga-free')};
  expect(guardHash('#/first/yoga/classes/yoga-free',removed).screen).toBe('catalog');
  expect(validateEnvelope(envelope,removed).profiles.first.interests['yoga-free'].classTitle).toBe(content.classes.find(c=>c.id==='yoga-free')!.title);
  expect(registerInterest(envelope,content,'first','swimming','yoga-free',now)).toBe(envelope);
});
