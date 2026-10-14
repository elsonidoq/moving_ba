import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { Content } from '../src/content/types';
import { startSession, completeStep, abandonSession } from '../src/state/session';
import { materialize, loadEnvelope, saveEnvelope, validateEnvelope, storageKey } from '../src/state/storage';
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
