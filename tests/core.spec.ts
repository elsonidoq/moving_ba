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
  for (const mutation of [(e: any) => e.schemaVersion=2, (e: any) => e.points=100, (e: any) => e.profiles.returning.baselineHistory[0].points=100, (e: any) => e.selectedProfileId='unknown', (e: any) => e.profiles.returning.baselineHistory[0].sportId='unknown', (e: any) => e.profiles.returning.baselineHistory[0].profileId='unknown']) {
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

import { activityDate, weekKey, monthKey } from '../src/state/dates';
import { eligibleHistory, selectJourney } from '../src/state/selectors';
import type { HistoryRecord, Envelope } from '../src/state/storage';
function independentWeek(date: string) {
  const days = Math.floor(Date.parse(date+'T00:00:00Z') / 86400000);
  return new Date((Math.floor((days+3)/7)*7-3)*86400000).toISOString().slice(0,10);
}
function independent(content: Content, e: Envelope, profileId: typeof input.profileId | 'returning' | 'regular', today: string) {
  const p=e.profiles[profileId];
  const records=[...new Map([...p.baselineHistory,...Object.values(p.completions)].map(r=>[r.id,r])).values()];
  const weeks=(list:HistoryRecord[])=>new Set(list.map(r=>independentWeek(r.activityDate))).size;
  const week=records.filter(r=>independentWeek(r.activityDate)===independentWeek(today)&&r.activityDate<=today);
  const month=records.filter(r=>r.activityDate.slice(0,7)===today.slice(0,7)&&r.activityDate<=today);
  return {ids:records.map(r=>r.id).sort(),points:records.length*content.rules.pointsPerCompletion,sessions:records.length,activeWeeks:weeks(records),weeklySessions:week.length,weeklyGoal:content.profiles.find(p=>p.id===profileId)!.weeklyGoal,
    challenges:content.rules.challenges.map(r=>({id:r.id,value:r.metric==='sessions'?(r.period==='week'?week:month).length:weeks(r.period==='week'?week:month)})),
    badges:content.rules.badges.map(r=>({id:r.id,earned:(r.metric==='sessions'?records.length:weeks(records))>=r.threshold})),weekKeys:[...new Set(records.map(r=>independentWeek(r.activityDate)))].sort()};
}
test('history rules dates baseline union unique completion, independent oracle, snapshots and rule/reset semantics',()=>{
  let e=materialize(content);
  for(const p of content.profiles) {
    const baseline=selectJourney(content,e,p.id,now);
    const baselineExpected=independent(content,e,p.id,'2026-10-14');
    expect(baseline.points).toBe(baselineExpected.points);expect(baseline.activeWeeks).toBe(baselineExpected.activeWeeks);expect(baseline.weeklySessions).toBe(baselineExpected.weeklySessions);expect(baseline.badges.map(r=>({id:r.id,earned:r.earned}))).toEqual(baselineExpected.badges);
    console.log('baseline oracle',p.id,JSON.stringify(baselineExpected));
    let attempt=startSession(content,{...input,profileId:p.id,planId:p.defaultPlanId},()=>`new-${p.id}`)!;
    for(const step of attempt.steps) { const next=completeStep(attempt,e,attempt.attemptId,step.id,now);attempt=next.attempt!;e=next.envelope; }
    const actual=selectJourney(content,e,p.id,now);const expected=independent(content,e,p.id,'2026-10-14');
    expect({ids:actual.history.map(r=>r.id).sort(),points:actual.points,sessions:actual.sessions,activeWeeks:actual.activeWeeks,weeklySessions:actual.weeklySessions,weeklyGoal:actual.weeklyGoal,challenges:actual.challenges.map(r=>({id:r.id,value:r.value})),badges:actual.badges.map(r=>({id:r.id,earned:r.earned})),weekKeys:actual.weekKeys}).toEqual(expected);
    const later=selectJourney(content,e,p.id,new Date('2026-11-02T15:00:00Z'));
    expect(later.weeklySessions).toBe(0); expect(later.points).toBe(actual.points); expect(later.badges).toEqual(actual.badges); expect(later.history).toEqual(actual.history);
    console.log('history oracle',p.id,'date',actual.today,'rule',content.rules.pointsPerCompletion,'expected',JSON.stringify(expected),'actual',JSON.stringify(actual));
  }
  const changed=structuredClone(content);changed.plans[0].name='Nombre nuevo';changed.plans=changed.plans.filter(p=>p.id!=='cal-first');changed.rules.pointsPerCompletion=3;
  changed.rules.badges[0].threshold=99;changed.rules.challenges[0].target=4;
  expect(selectJourney(changed,e,'first',now).badges[0].earned).toBe(false);expect(selectJourney(changed,e,'first',now).challenges[0]).toMatchObject({value:1,target:4});
  expect(selectJourney(changed,e,'first',now).points).toBe(3);expect(eligibleHistory(e,'first')[0].planTitle).toBe(content.plans[0].name);
  const duplicated=structuredClone(e);duplicated.profiles.first.completions.duplicate=duplicated.profiles.first.completions['new-first'];
  expect(eligibleHistory(duplicated,'first')).toHaveLength(1);
  const port={getItem:()=>JSON.stringify(e),setItem:()=>{}};const fixtureEdit=structuredClone(content);fixtureEdit.scenarios.profiles[1].history.pop();
  expect(loadEnvelope(fixtureEdit,port).envelope.profiles.returning.baselineHistory).toHaveLength(2);
  expect(materialize(fixtureEdit).profiles.returning.baselineHistory).toHaveLength(1);
  expect(materialize(content).profiles.first.baselineHistory).toHaveLength(0);
});
test('history rules dates BA local Monday/month boundaries, honest numerator and lifetime rest preservation',()=>{
  expect(activityDate(new Date('2026-11-02T01:30:00Z'))).toBe('2026-11-01');
  expect(activityDate(new Date('2026-11-02T03:00:00Z'))).toBe('2026-11-02');
  expect(activityDate(new Date('2026-11-01T02:30:00Z'))).toBe('2026-10-31');
  expect(weekKey('2026-11-01')).toBe('2026-10-26');expect(weekKey('2026-11-02')).toBe('2026-11-02');expect(monthKey('2026-10-31')).toBe('2026-10');
  const e=materialize(content);e.profiles.first.baselineHistory=['2026-10-25','2026-10-26','2026-10-31','2026-11-01','2026-11-02'].map((d,i)=>({id:`boundary-${i}`,profileId:'first',sportId:'calisthenics',planId:'retired',planTitle:'Práctica histórica',sportTitle:'Calistenia',medium:'dry-land',activityDate:d,origin:'seed'}));
  const c=structuredClone(content);c.rules.challenges=[{id:'week-sessions',title:'Semana',description:'Ejemplo',metric:'sessions',period:'week',target:1},{id:'month-sessions',title:'Mes',description:'Ejemplo',metric:'sessions',period:'month',target:1},{id:'week-weeks',title:'Semanas',description:'Ejemplo',metric:'activeWeeks',period:'week',target:1},{id:'month-weeks',title:'Mes y semanas',description:'Ejemplo',metric:'activeWeeks',period:'month',target:1}];
  for(const [instant,today,numerators] of [['2026-11-01T02:30:00Z','2026-10-31',[2,3,1,2]],['2026-11-02T01:30:00Z','2026-11-01',[3,1,1,1]],['2026-11-02T03:00:00Z','2026-11-02',[1,2,1,2]]] as const) {
    const actual=selectJourney(c,e,'first',new Date(instant));expect(actual.today).toBe(today);expect(actual.challenges.map(r=>r.value)).toEqual(numerators);expect(actual.challenges.map(r=>({id:r.id,value:r.value}))).toEqual(independent(c,e,'first',today).challenges);
    expect(actual.points).toBe(50);expect(actual.activeWeeks).toBe(3);expect(actual.badges.every(r=>r.earned)).toBe(true);console.log('BA boundary',instant,today,actual.weekKeys,'numerators',actual.challenges.map(r=>r.value),'lifetime',actual.points,actual.badges.map(r=>r.earned));
  }
});
