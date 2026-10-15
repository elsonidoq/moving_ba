import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { Content, ProfileId } from '../src/content/types';
import { validateContent } from '../src/content/validate';
import { startSession, completeStep, reviewStep, abandonSession } from '../src/state/session';
import { materialize, loadEnvelope, saveEnvelope, validateEnvelope, validateLegacyEnvelope, normalizeLegacy, sourceKey, resetEnvelope, storageKey, type Envelope, type LegacyEnvelope, type StoragePort } from '../src/state/storage';
import { createCommandOwner, type Command } from '../src/state/context';
import { guardHash } from '../src/state/navigation';
import { activityDate, weekKey, monthKey } from '../src/state/dates';
import { eligibleHistory, selectJourney, selectPreviewJourney } from '../src/state/selectors';
const content = validateContent(JSON.parse(readFileSync('public/config/app-content.json', 'utf8'))) as Content;
const now = new Date('2026-10-14T15:00:00.000Z');
const input = {profileId:'first',sportId:'calisthenics',planId:'cal-first',canSwim:false,safePool:false} as const;
const profiles: ProfileId[] = ['first','returning','regular'];
function storage(raw?: string) {
  const values = new Map<string,string>([['unrelated','sentinel']]); if (raw !== undefined) values.set(storageKey,raw);
  const calls: string[][] = []; let denyRead=false,denyWrite=false;
  const port:StoragePort = {
    getItem(k) {calls.push(['get',k]);if(denyRead)throw Error('denied read');return values.get(k)??null;},
    setItem(k,v) {calls.push(['set',k,v]);if(denyWrite)throw Error('denied write');values.set(k,v);},
  };
  return {values,calls,port,readsDenied:(v:boolean)=>{denyRead=v;},writesDenied:(v:boolean)=>{denyWrite=v;},writes:()=>calls.filter(c=>c[0]==='set')};
}
/** Deliberately independent of current fixtures and retired current-catalog membership. */
function legacyFixture():LegacyEnvelope {
  const e:LegacyEnvelope = {schemaVersion:1,selectedProfileId:'regular',scenarioReferenceDate:'2026-10-14',profiles:{} as LegacyEnvelope['profiles']};
  for (const [i,p] of profiles.entries()) e.profiles[p] = {
    baselineHistory: ['z-seed','same-seed','a-seed'].map((id,j)=>({id,profileId:p,sportId:'yoga',planId:`retired-${p}-${j}`,planTitle:`Práctica retirada ${p} ${j}`,sportTitle:`Yoga histórico ${p}`,medium:'dry-land',activityDate:`2026-10-0${i+j+1}`,origin:'seed'})),
    completions:{'same-attempt':{id:'same-attempt',attemptId:'same-attempt',profileId:p,sportId:'swimming',planId:`retired-water-${p}`,planTitle:`Agua histórica ${p}`,sportTitle:`Natación histórica ${p}`,medium:'water',activityDate:'2026-10-14',origin:'user-simulated',timestamp:now.toISOString(),completedStepIds:[`step-${p}`,'same-step']}},
    interests:{'retired-class':{classId:'retired-class',profileId:p,sportId:'calisthenics',classTitle:`Clase retirada ${p}`,sportTitle:`Calistenia histórica ${p}`,timestamp:now.toISOString(),origin:'simulated-interest'}},
  };
  return e;
}
test('one-person compatibility new actual initialization is empty and unchosen',()=>{
  const s=storage(); const loaded=loadEnvelope(content,s.port);
  expect(loaded).toEqual({envelope:materialize(),status:'ready',readBlocked:false});
  expect(loaded.envelope).toEqual({schemaVersion:1,layout:'one-person',preference:null,journey:{},interests:{},intention:null});
  expect(s.writes()).toEqual([]);console.log('new actual',JSON.stringify(loaded),'write calls',s.writes());
});
test('one-person compatibility colliding source tuples preserve every field, archive, stable order and no reimport/reseed',()=>{
  const legacy=legacyFixture();expect(validateLegacyEnvelope(legacy)).toEqual(legacy);
  const raw=JSON.stringify(legacy); const s=storage(raw);
  const loaded=loadEnvelope(content,s.port);expect(loaded.status).toBe('ready');const e=loaded.envelope;
  const tuples:string[]=[];
  for(const p of profiles) {
    const data=legacy.profiles[p];
    for(const r of [...data.baselineHistory].sort((a,b)=>a.id.localeCompare(b.id))) {
      const key=sourceKey('legacy',p,'baseline',r.id);tuples.push(key);expect(e.journey[key]).toEqual(r);console.log('every field equal',key,JSON.stringify(e.journey[key]));
    }
    for(const [id,r] of Object.entries(data.completions)) {const key=sourceKey('legacy',p,'completion',id);tuples.push(key);expect(e.journey[key]).toEqual(r);console.log('every field equal',key,JSON.stringify(r));}
    for(const [id,r] of Object.entries(data.interests)) {const key=sourceKey('legacy',p,'interest',id);expect(e.interests[key]).toEqual(r);console.log('every field equal',key,JSON.stringify(r));}
  }
  expect(Object.keys(e.journey)).toEqual(tuples);expect(e.legacySource).toEqual(legacy);expect(e.preference).toBeNull();expect(e.intention).toBeNull();
  expect(normalizeLegacy(legacy)).toEqual(e);expect(eligibleHistory(e)).toHaveLength(12);expect(Object.keys(e.interests)).toHaveLength(3);
  const reversed=structuredClone(legacy);for(const p of profiles)reversed.profiles[p].baselineHistory.reverse();
  expect(normalizeLegacy(reversed).journey).toEqual(e.journey);expect(Object.keys(normalizeLegacy(reversed).journey)).toEqual(tuples);
  const changed=structuredClone(content);changed.scenarios.profiles=[];changed.profiles=[];changed.sports=[];
  expect(loadEnvelope(changed,s.port).envelope).toEqual(e);expect(loadEnvelope(content,s.port).envelope).toEqual(e);
  expect(s.values.get(storageKey)).toBe(raw);expect(s.writes()).toEqual([]);
  expect(saveEnvelope(e,s.port,loaded)).toBe('ready');expect(s.writes()).toHaveLength(1);
  const canonical=s.values.get(storageKey);expect(loadEnvelope(changed,s.port).envelope).toEqual(e);expect(loadEnvelope(content,s.port).envelope).toEqual(e);expect(s.writes()).toHaveLength(1);expect(s.values.get(storageKey)).toBe(canonical);
  expect(selectJourney(content,e,'first',now)).toMatchObject({sessions:12,points:120,activeWeeks:3});
  console.log('ordered tuples',tuples,'archive profiles',Object.keys(e.legacySource!.profiles),'logical sessions/points',12,120,'raw reads wrote',0,'canonical save count',s.writes().length);
});
test('one-person compatibility frozen legacy rejects unknown fields and unsafe/malformed records without current content',()=>{
  const mutations:((e:LegacyEnvelope)=>void)[]=[e=>{(e as any).points=10;},e=>{e.selectedProfileId='unknown' as never;},e=>{e.scenarioReferenceDate='2026-02-30';},e=>{e.profiles.first.baselineHistory[0].sportId='unknown' as never;},e=>{e.profiles.first.baselineHistory[0].medium='water';},e=>{e.profiles.first.completions['same-attempt'].completedStepIds=['same','same'];},e=>{e.profiles.first.completions['same-attempt'].activityDate='2026-10-13';},e=>{e.profiles.first.completions['same-attempt'].attemptId='different';},e=>{(e.profiles.first.interests['retired-class'] as any).secret='bad';}];
  for(const mutate of mutations){const e=legacyFixture();mutate(e);expect(()=>validateLegacyEnvelope(e)).toThrow('datos guardados');}
});
test('one-person storage reset preserves invalid bytes and blocks ordinary saves, every cancel is full no-op',()=>{
  const invalids=['{',JSON.stringify({...materialize(),answers:['sensitive']}),JSON.stringify({...materialize(),preference:{situationId:'unknown',confirmed:true}}),JSON.stringify({...materialize(),layout:'unknown'})];
  for(const raw of invalids){
    const s=storage(raw);const loaded=loadEnvelope(content,s.port);expect(loaded.status).toBe('invalid');
    expect(saveEnvelope(materialize(),s.port,loaded)).toBe('invalid');expect(s.values.get(storageKey)).toBe(raw);expect(s.writes()).toHaveLength(0);
    const owner=createCommandOwner(content,s.port);for(const entry of ['profile','recovery'] as const){const before=owner.getState();const calls=s.calls.length;expect(owner.dispatch({type:'reset',confirmed:false,entry})).toBe(false);expect(owner.getState()).toBe(before);expect(s.calls).toHaveLength(calls);}
    expect(owner.dispatch({type:'chooseSituation',situationId:'first'})).toBe(false);expect(s.values.get(storageKey)).toBe(raw);
    console.log('invalid bytes preserved',JSON.stringify(raw),'status',loaded.status,'Spanish recovery',content.ui.storageRecovery,'set calls',s.writes());
  }
});
test('one-person storage reset confirmed scoped tombstone clears transients and archive without reseed; cancel in normal entries is no-op',()=>{
  const s=storage(JSON.stringify(legacyFixture()));const owner=createCommandOwner(content,s.port,'#/regular/yoga/solo/yoga-regular',()=>now);
  owner.dispatch({type:'chooseSituation',situationId:'returning'});owner.dispatch({type:'intention',classId:'yoga-free'});owner.dispatch({type:'affirm',key:'canSwim',value:true});owner.dispatch({type:'affirm',key:'safePool',value:true});owner.dispatch({type:'start',planId:'swim-water-returning'});
  for(const entry of ['profile','recovery'] as const){const before=owner.getState();const calls=structuredClone(s.calls);expect(owner.dispatch({type:'reset',confirmed:false,entry})).toBe(false);expect(owner.getState()).toBe(before);expect(s.calls).toEqual(calls);}
  expect(resetEnvelope(s.port,false)).toBeNull();const before=s.values.get(storageKey);
  expect(owner.dispatch({type:'reset',confirmed:true,entry:'profile'})).toBe(true);
  expect(owner.getState()).toMatchObject({envelope:materialize(),attempt:null,canSwim:false,safePool:false,mode:{kind:'actual'},route:{screen:'onboarding'},status:'ready',message:null});
  expect(s.values.get(storageKey)).toBe(JSON.stringify(materialize()));expect(s.values.get('unrelated')).toBe('sentinel');expect(new Set(s.writes().map(c=>c[1]))).toEqual(new Set([storageKey]));expect(loadEnvelope(content,s.port).envelope).toEqual(materialize());
  console.log('confirmed reset before',before,'after',s.values.get(storageKey),'calls',s.calls);
  const corrupt=storage('{');const recovery=createCommandOwner(content,corrupt.port);expect(recovery.dispatch({type:'reset',confirmed:true,entry:'recovery'})).toBe(true);expect(corrupt.values.get(storageKey)).toBe(JSON.stringify(materialize()));
});
test('one-person storage reset denied reads prevent overwrite until successful reconciliation; denied writes/reset are honestly tab-only',()=>{
  const raw=JSON.stringify(legacyFixture());const s=storage(raw);s.readsDenied(true);const owner=createCommandOwner(content,s.port);
  expect(owner.getState()).toMatchObject({status:'unavailable',readBlocked:true});s.readsDenied(false);
  expect(owner.dispatch({type:'chooseSituation',situationId:'first'})).toBe(true);expect(s.writes()).toHaveLength(0);expect(s.values.get(storageKey)).toBe(raw);expect(owner.getState().message).toContain('pestaña');expect(owner.getState().message).toContain('volver al recargar');
  owner.dispatch({type:'storageEvent',key:storageKey});expect(owner.getState().envelope).toEqual(normalizeLegacy(legacyFixture()));expect(owner.getState().readBlocked).toBe(false);
  s.writesDenied(true);owner.dispatch({type:'chooseSituation',situationId:'regular'});expect(owner.getState().status).toBe('unavailable');expect(owner.getState().message).toContain('volver al recargar');expect(s.values.get(storageKey)).toBe(raw);
  owner.dispatch({type:'reset',confirmed:true,entry:'profile'});expect(owner.getState()).toMatchObject({envelope:materialize(),status:'unavailable',readBlocked:true,message:content.ui.resetFailed});expect(owner.getState().message).toContain('Los datos anteriores pueden volver');expect(s.values.get(storageKey)).toBe(raw);expect(s.values.get('unrelated')).toBe('sentinel');
  s.writesDenied(false);expect(loadEnvelope(content,s.port).envelope).toEqual(normalizeLegacy(legacyFixture()));
  console.log('denied bytes remain',raw,'calls',s.calls,'reset Spanish',owner.getState().message);
});
test('actual command custody URLs and legacy selection never consent; edits only preference; interest/intention grant no credit',()=>{
  const s=storage(JSON.stringify(legacyFixture()));const owner=createCommandOwner(content,s.port,'#/regular/yoga/solo/yoga-regular',()=>now);
  expect(owner.getState().envelope.preference).toBeNull();expect(owner.getState().route.screen).toBe('onboarding');expect(s.writes()).toHaveLength(0);
  for(const hash of ['#/first/home','#/returning/yoga/classes/yoga-free','#/regular/swimming/session/swim-water-regular/forged'])owner.dispatch({type:'navigate',hash});
  expect(s.writes()).toHaveLength(0);expect(owner.dispatch({type:'start',planId:'cal-first'})).toBe(false);
  owner.dispatch({type:'chooseSituation',situationId:'first'});const baseline=owner.getState().envelope;
  const actions:Command[]=[{type:'interest',classId:'yoga-free'},{type:'interest',classId:'yoga-free'},{type:'intention',classId:'yoga-free'},{type:'intention',classId:'yoga-free'},{type:'intention',classId:'cal-paid'}];
  const results=actions.map(a=>owner.dispatch(a));expect(results).toEqual([true,false,true,false,true]);
  expect(Object.keys(owner.getState().envelope.interests)).toHaveLength(4);expect(owner.getState().envelope.intention?.classSnapshot).toEqual(content.classes.find(c=>c.id==='cal-paid'));
  const before=owner.getState().envelope;const records=JSON.stringify({...before,preference:null});owner.dispatch({type:'editSituation',situationId:'regular'});expect(JSON.stringify({...owner.getState().envelope,preference:null})).toBe(records);expect(owner.getState().envelope.journey).toEqual(baseline.journey);
  const bytes=s.values.get(storageKey);owner.dispatch({type:'navigate',hash:'#/first/home'});expect(owner.getState().envelope.preference?.situationId).toBe('regular');expect(s.values.get(storageKey)).toBe(bytes);
  console.log('actual actions',actions,'results',results,'actual bytes',bytes);
});
test('actual command custody preview rejects direct mutations, serializes no transients, exit has no pending replay',()=>{
  const s=storage();const owner=createCommandOwner(content,s.port,'',()=>now,()=> 'actual-uuid');owner.dispatch({type:'chooseSituation',situationId:'returning'});owner.dispatch({type:'intention',classId:'yoga-free'});
  const bytes=s.values.get(storageKey);owner.dispatch({type:'enterScenario',scenarioId:'missed-class'});owner.dispatch({type:'navigate',hash:'#/chat/missed-class-chat'});owner.dispatch({type:'answer',answerId:'interruption'});
  expect(owner.getState().mode).toEqual({kind:'preview',scenarioId:'missed-class',answerId:'interruption'});
  const blocked:Command[]=[{type:'editSituation',situationId:'regular'},{type:'chooseSituation',situationId:'first'},{type:'reset',confirmed:true,entry:'profile'},{type:'reset',confirmed:true,entry:'recovery'},{type:'interest',classId:'cal-free'},{type:'intention',classId:'cal-paid'},{type:'start',planId:'cal-returning'},{type:'accept',attemptId:'forged',stepId:'forged'},{type:'affirm',key:'canSwim',value:true}];
  for(const action of blocked){expect(owner.dispatch(action),JSON.stringify(action)).toBe(false);expect(s.values.get(storageKey)).toBe(bytes);console.log('preview rejected',JSON.stringify(action));}
  owner.dispatch({type:'navigate',hash:'#/first/yoga/classes/yoga-free'});expect(owner.getState().mode).toEqual({kind:'preview',scenarioId:'missed-class'});expect(s.values.get(storageKey)).toBe(bytes);expect(createCommandOwner(content,s.port,'#/chat/missed-class-chat').getState()).toMatchObject({mode:{kind:'actual'},route:{screen:'profile'},attempt:null});
  owner.dispatch({type:'exitPreview'});expect(owner.getState()).toMatchObject({mode:{kind:'actual'},attempt:null,canSwim:false,safePool:false});expect(s.values.get(storageKey)).toBe(bytes);
  owner.dispatch({type:'affirm',key:'canSwim',value:true});owner.dispatch({type:'affirm',key:'safePool',value:true});owner.dispatch({type:'start',planId:'swim-water-returning'});expect(owner.getState().attempt).not.toBeNull();expect(s.values.get(storageKey)).toBe(bytes);
  for(const key of ['mode','answerId','answers','canSwim','safePool','attempt','cursor','preview'])expect(Object.keys(JSON.parse(bytes!))).not.toContain(key);
  console.log('preview/affirmations/attempt all excluded, exact actual bytes',bytes);
});
test('actual command custody storage key and clear invalidate all transients before actual reread, unrelated key does nothing',()=>{
  for(const key of [storageKey,null]){
    const s=storage();let owner:ReturnType<typeof createCommandOwner>;let reading=false;
    const port:StoragePort={...s.port,getItem(k){if(reading)expect(owner.getState()).toMatchObject({attempt:null,mode:{kind:'actual'},canSwim:false,safePool:false});return s.port.getItem(k);}};
    owner=createCommandOwner(content,port,'',()=>now);owner.dispatch({type:'chooseSituation',situationId:'first'});owner.dispatch({type:'affirm',key:'canSwim',value:true});owner.dispatch({type:'start',planId:'cal-first'});
    const before=owner.getState();expect(owner.dispatch({type:'storageEvent',key:'unrelated'})).toBe(false);expect(owner.getState()).toBe(before);
    reading=true;owner.dispatch({type:'storageEvent',key});expect(owner.getState().attempt).toBeNull();
    owner.dispatch({type:'enterScenario',scenarioId:'inactive'});owner.dispatch({type:'answer',answerId:'skip'});s.values.set(storageKey,JSON.stringify(legacyFixture()));
    owner.dispatch({type:'storageEvent',key});expect(owner.getState()).toMatchObject({mode:{kind:'actual'},route:{screen:'onboarding'},envelope:{preference:null,intention:null}});
    console.log('event',key,'cleared before getItem; no inferred preference/scenario',JSON.stringify(owner.getState().mode));
  }
});
test('session integrity ordered explicit events, snapshots, replay, abandonment and atomic completion',()=>{
  let e=materialize();let a=startSession(content,input,()=> 'attempt-one')!;const original=structuredClone(a);
  for(const [id,step] of [['wrong',a.steps[0].id],[a.attemptId,'wrong'],[a.attemptId,a.steps.at(-1)!.id]])expect(completeStep(a,e,id,step,now)).toEqual({attempt:a,envelope:e});
  const edited=structuredClone(content);edited.exercises[0].title='Otro título';expect(a.steps).toEqual(original.steps);
  for(const step of original.steps){const r=completeStep(a,e,a.attemptId,step.id,now);a=r.attempt!;e=r.envelope;expect(completeStep(a,e,original.attemptId,step.id,now)).toEqual({attempt:a,envelope:e});console.log('accepted',step.id,a.acceptedCount,Object.keys(e.journey));}
  expect(a.status).toBe('completed');expect(Object.keys(e.journey)).toEqual([sourceKey('actual','completion','attempt-one')]);expect(Object.values(e.journey)[0].completedStepIds).toEqual(original.steps.map(s=>s.id));
  const s=storage();expect(saveEnvelope(e,s.port,{status:'ready',readBlocked:false})).toBe('ready');expect(loadEnvelope(content,s.port).envelope).toEqual(e);
  const partial=startSession(content,input,()=> 'partial')!;const advanced=completeStep(partial,e,partial.attemptId,partial.steps[0].id,now).attempt!;expect(completeStep(abandonSession(advanced),e,partial.attemptId,partial.steps[1].id,now).envelope).toBe(e);
  const chosen={...e,preference:{situationId:'first' as const,confirmed:true as const}};expect(guardHash('#/first/calisthenics/session/cal-first/partial',content,{attempt:null,envelope:chosen}).screen).toBe('plan');
});
test('swimming start guard every situation and four affirmations, production boundary rechecks and dry stays safe',()=>{
  for(const p of profiles)for(const canSwim of [false,true])for(const safePool of [false,true]){
    expect(!!startSession(content,{profileId:p,sportId:'swimming',planId:`swim-water-${p}`,canSwim,safePool})).toBe(canSwim&&safePool);
    const owner=createCommandOwner(content,storage().port);owner.dispatch({type:'chooseSituation',situationId:p});owner.dispatch({type:'affirm',key:'canSwim',value:canSwim});owner.dispatch({type:'affirm',key:'safePool',value:safePool});expect(owner.dispatch({type:'start',planId:`swim-water-${p}`})).toBe(canSwim&&safePool);
    owner.dispatch({type:'navigate',hash:`#/${p}/home`});expect(owner.getState()).toMatchObject({canSwim:false,safePool:false,attempt:null});expect(owner.dispatch({type:'start',planId:`swim-dry-${p}`})).toBe(true);
    console.log('swim',p,canSwim,safePool,'water allowed',canSwim&&safePool);
  }
  expect(startSession(content,{...input,planId:'swim-water-first',canSwim:true,safePool:true})).toBeNull();
});

test('one-person progress dates BA midnight, Monday week and month windows use independent exact numeric oracle; rest retains lifetime',()=>{
  expect(activityDate(new Date('2026-11-02T02:59:59Z'))).toBe('2026-11-01');expect(activityDate(new Date('2026-11-02T03:00:00Z'))).toBe('2026-11-02');expect(weekKey('2026-11-01')).toBe('2026-10-26');expect(weekKey('2026-11-02')).toBe('2026-11-02');expect(monthKey('2026-10-31')).toBe('2026-10');
  const legacy=legacyFixture();for(const p of profiles){legacy.profiles[p].baselineHistory=[];legacy.profiles[p].completions={};legacy.profiles[p].interests={};}legacy.scenarioReferenceDate='2026-11-03';
  const dates=['2026-10-25','2026-10-26','2026-10-31','2026-11-01','2026-11-02'];
  for(const p of profiles)legacy.profiles[p].baselineHistory=dates.map((d,i)=>({id:`same-${i}`,profileId:p,sportId:'yoga',planId:'retired',planTitle:`Histórica ${p}`,sportTitle:'Yoga',medium:'dry-land',activityDate:d,origin:'seed'}));
  const e=normalizeLegacy(legacy);const c=structuredClone(content);c.rules.challenges=[
    {id:'week-sessions',title:'Semana',description:'Ejemplo',metric:'sessions',period:'week',target:1},
    {id:'month-sessions',title:'Mes',description:'Ejemplo',metric:'sessions',period:'month',target:1},
    {id:'week-weeks',title:'Semanas',description:'Ejemplo',metric:'activeWeeks',period:'week',target:1},
    {id:'month-weeks',title:'Mes y semanas',description:'Ejemplo',metric:'activeWeeks',period:'month',target:1},
  ];
  const allIds=profiles.flatMap(p=>dates.map((_,i)=>sourceKey('legacy',p,'baseline',`same-${i}`))).sort();expect(Object.keys(e.journey).sort()).toEqual(allIds);
  for(const [instant,today,numerators,weeklyIds,monthlyIds] of [
    ['2026-11-01T02:59:59Z','2026-10-31',[6,9,1,2],[1,2],[0,1,2]],
    ['2026-11-01T03:00:00Z','2026-11-01',[9,3,1,1],[1,2,3],[3]],
    ['2026-11-02T02:59:59Z','2026-11-01',[9,3,1,1],[1,2,3],[3]],
    ['2026-11-02T03:00:00Z','2026-11-02',[3,6,1,2],[4],[3,4]],
    ['2026-12-01T15:00:00Z','2026-12-01',[0,0,0,0],[],[]],
  ] as const){
    const actual=selectJourney(c,e,'first',new Date(instant));expect(actual.today).toBe(today);expect(actual.sessions).toBe(15);expect(actual.points).toBe(150);expect(actual.activeWeeks).toBe(3);expect(actual.weeklySessions).toBe(numerators[0]);expect(actual.challenges.map(r=>r.value)).toEqual(numerators);expect(actual.badges.map(b=>b.earned)).toEqual([true,true]);expect(actual.benefits.map(b=>b.eligible)).toEqual([true]);
    const expectedWeek=profiles.flatMap(p=>weeklyIds.map(i=>sourceKey('legacy',p,'baseline',`same-${i}`))).sort();
    const expectedMonth=profiles.flatMap(p=>monthlyIds.map(i=>sourceKey('legacy',p,'baseline',`same-${i}`))).sort();
    expect(actual.history.filter(r=>r.activityDate<=today&&weekKey(r.activityDate)===weekKey(today)).map(r=>r.sourceKey).sort()).toEqual(expectedWeek);
    expect(actual.history.filter(r=>r.activityDate<=today&&monthKey(r.activityDate)===monthKey(today)).map(r=>r.sourceKey).sort()).toEqual(expectedMonth);
    expect(actual.weekKeys).toEqual(['2026-10-19','2026-10-26','2026-11-02']);
    console.log('instant',instant,'BA date',today,'eligible lifetime tuples',allIds,'week tuples',expectedWeek,'month tuples',expectedMonth,'exact metrics',{sessions:actual.sessions,points:actual.points,activeWeeks:actual.activeWeeks,challenges:actual.challenges.map(r=>r.value),badges:actual.badges.map(b=>b.earned)},'bar only',Math.min(actual.weeklySessions,actual.weeklyGoal));
  }
  const s=storage(JSON.stringify(e));const owner=createCommandOwner(c,s.port,'',()=>now);const before=selectJourney(c,e,'first',now);
  owner.dispatch({type:'chooseSituation',situationId:'regular'});owner.dispatch({type:'interest',classId:'yoga-free'});owner.dispatch({type:'intention',classId:'yoga-free'});owner.dispatch({type:'enterScenario',scenarioId:'inactive'});owner.dispatch({type:'answer',answerId:'skip'});owner.dispatch({type:'exitPreview'});
  const after=selectJourney(c,owner.getState().envelope,'first',now);expect(after.history).toEqual(before.history);expect(after.points).toBe(before.points);expect(after.badges).toEqual(before.badges);expect(after.weeklyGoal).toBe(c.profiles.find(p=>p.id==='regular')!.weeklyGoal);
  const actualBytes=s.values.get(storageKey);for(const scenario of c.previewScenarios){const preview=selectPreviewJourney(c,scenario.id)!;expect(preview.today).toBe(scenario.referenceDate);expect(preview.sessions).toBe(scenario.history.length);expect(s.values.get(storageKey)).toBe(actualBytes);}
  expect(selectPreviewJourney(c,'unknown')).toBeNull();expect(validateEnvelope(owner.getState().envelope)).toEqual(owner.getState().envelope);
});
test('actual command custody current-state start/accept cannot credit twice or use stale identity, intention retirement retains exact snapshot',()=>{
  const s=storage();let sequence=0;const owner=createCommandOwner(content,s.port,'',()=>now,()=>`uuid-${++sequence}`);owner.dispatch({type:'chooseSituation',situationId:'first'});
  owner.dispatch({type:'intention',classId:'yoga-free'});const saved=owner.getState().envelope.intention;const removed=structuredClone(content);removed.classes=removed.classes.filter(c=>c.id!=='yoga-free');expect(validateEnvelope(owner.getState().envelope,removed).intention).toEqual(saved);
  const before=s.values.get(storageKey);expect(owner.dispatch({type:'intention',classId:'unknown'})).toBe(false);expect(s.values.get(storageKey)).toBe(before);
  owner.dispatch({type:'start',planId:'cal-first'});const attempt=owner.getState().attempt!;
  for(const command of [{type:'accept',attemptId:'stale',stepId:attempt.steps[0].id},{type:'accept',attemptId:attempt.attemptId,stepId:attempt.steps.at(-1)!.id}] as Command[])expect(owner.dispatch(command)).toBe(false);
  expect(s.values.get(storageKey)).toBe(before);for(const step of attempt.steps){expect(owner.dispatch({type:'accept',attemptId:attempt.attemptId,stepId:step.id})).toBe(true);expect(owner.dispatch({type:'accept',attemptId:attempt.attemptId,stepId:step.id})).toBe(false);}
  expect(Object.keys(owner.getState().envelope.journey)).toEqual([sourceKey('actual','completion','uuid-1')]);expect(owner.getState().route.screen).toBe('success');
  const bytes=s.values.get(storageKey);owner.dispatch({type:'navigate',hash:'#/first/calisthenics/session/cal-first/uuid-1'});expect(owner.getState().attempt).toBeNull();expect(s.values.get(storageKey)).toBe(bytes);
  owner.dispatch({type:'start',planId:'cal-first'});expect(owner.getState().attempt?.attemptId).toBe('uuid-2');owner.dispatch({type:'navigate',hash:'#/first/home'});expect(Object.keys(owner.getState().envelope.journey)).toHaveLength(1);
  console.log('explicit IDs uuid-1 complete exactly once; uuid-2 abandoned, bytes',bytes);
});
test('one-person storage reset canonical validation rejects forged source tuples, archive loss, timestamps, unknown transients and intention snapshots',()=>{
  const base=normalizeLegacy(legacyFixture());
  const mutations:((e:Envelope)=>void)[]=[
    e=>{(e as any).canSwim=true;},e=>{delete (e as any).preference;},e=>{delete e.journey[Object.keys(e.journey)[0]];},
    e=>{e.journey[Object.keys(e.journey)[0]].planTitle='Reescrito';},e=>{delete e.legacySource;},
    e=>{e.journey['["actual","completion","forged"]']=Object.values(e.journey)[0];},
    e=>{e.interests['["actual","interest","wrong"]']=Object.values(e.interests)[0];},
  ];
  for(const mutate of mutations){const e=structuredClone(base);mutate(e);const raw=JSON.stringify(e);const s=storage(raw);expect(loadEnvelope(content,s.port).status).toBe('invalid');expect(s.values.get(storageKey)).toBe(raw);expect(s.writes()).toHaveLength(0);}
});

test('actual command custody exact class identity survives reorder and retirement; interest remains idempotent and noncrediting',()=>{
  const reordered={...content,classes:[...content.classes].reverse()};const s=storage();const owner=createCommandOwner(reordered,s.port,'',()=>now);owner.dispatch({type:'chooseSituation',situationId:'first'});
  for(const sport of content.sports)for(const kind of ['free','paid']){
    const item=content.classes.find(c=>c.sportId===sport.id&&c.price.kind===kind)!;expect(item.price.currency).toBe('ARS');expect(item.fictional).toBe(true);expect(item.price.amount).toBe(kind==='free'?0:item.price.amount);if(kind==='paid')expect(item.price.amount).toBeGreaterThan(0);
    for(const field of ['title','schedule','venue','locality','level','description','receiver','contactCopy'] as const)expect(item[field]).not.toBe('');expect(item.requirements.length).toBeGreaterThan(0);
    owner.dispatch({type:'navigate',hash:`#/first/${sport.id}/classes/${item.id}`});expect(owner.getState().route).toMatchObject({screen:'detail',classId:item.id,sportId:item.sportId});
    expect(owner.dispatch({type:'interest',classId:item.id})).toBe(true);expect(owner.dispatch({type:'interest',classId:item.id})).toBe(false);expect(owner.getState().envelope.journey).toEqual({});
  }
  expect(Object.keys(owner.getState().envelope.interests)).toHaveLength(6);
  const removed={...content,classes:content.classes.filter(c=>c.id!=='yoga-free')};expect(guardHash('#/first/yoga/classes/yoga-free',removed,{attempt:null,envelope:owner.getState().envelope}).screen).toBe('catalog');expect(guardHash('#/first/swimming/classes/yoga-free',content,{attempt:null,envelope:owner.getState().envelope}).screen).toBe('catalog');
  expect(Object.values(validateEnvelope(owner.getState().envelope,removed).interests).find(i=>i.classId==='yoga-free')?.classTitle).toBe(content.classes.find(c=>c.id==='yoga-free')!.title);
});

test('actual command custody intention same/different/retired exact snapshots preserve all source-scoped history and interests',()=>{
 const s=storage(JSON.stringify(legacyFixture()));const owner=createCommandOwner(content,s.port,'',()=>now);owner.dispatch({type:'chooseSituation',situationId:'returning'});
 const baseline=owner.getState().envelope;expect(owner.dispatch({type:'intention',classId:'yoga-paid'})).toBe(true);const first=owner.getState().envelope;expect(first.intention?.classSnapshot).toEqual(content.classes.find(c=>c.id==='yoga-paid'));
 const calls=s.writes().length;expect(owner.dispatch({type:'intention',classId:'yoga-paid'})).toBe(false);expect(s.writes()).toHaveLength(calls);
 expect(owner.dispatch({type:'intention',classId:'cal-free'})).toBe(true);const second=owner.getState().envelope;expect({...second,intention:null}).toEqual({...first,intention:null});expect(second.journey).toEqual(baseline.journey);expect(second.interests).toEqual(baseline.interests);
 const removed={...content,classes:content.classes.filter(c=>c.id!=='cal-free')};const loaded=createCommandOwner(removed,s.port,'',()=>now);const before=loaded.getState().envelope;expect(loaded.dispatch({type:'intention',classId:'cal-free'})).toBe(false);expect(loaded.getState().envelope.intention?.classSnapshot).toEqual(content.classes.find(c=>c.id==='cal-free'));expect(loaded.getState().envelope).toBe(before);
 console.log('intention same no write/different replacement/retired snapshot',JSON.stringify(second),'counts unchanged',selectJourney(content,second,'returning',now).sessions);
});

test('session integrity review separates accepted prefix from viewed exercise',()=>{
 const a=startSession(content,input,()=> 'review-red')!;
 expect(a).toMatchObject({acceptedCount:0,viewIndex:0});expect(reviewStep(a,a.attemptId,'previous')).toBe(a);expect(reviewStep(a,a.attemptId,'next')).toBe(a);
});

test('session integrity ordered review/next cannot skip or reaccept; immutable snapshots, stale UUID, partial and forged success give no extra credit',()=>{
 let e=materialize();let a=startSession(content,input,()=> 'review-uuid')!;const snapshot=structuredClone(a.steps);expect(reviewStep(a,a.attemptId,'next')).toBe(a);expect(reviewStep(a,'stale','previous')).toBe(a);
 ({attempt:a,envelope:e}=completeStep(a,e,a.attemptId,a.steps[0].id,now) as {attempt:typeof a;envelope:typeof e});expect(a).toMatchObject({acceptedCount:1,viewIndex:1});
 a=reviewStep(a,a.attemptId,'previous')!;expect(a).toMatchObject({acceptedCount:1,viewIndex:0});expect(completeStep(a,e,a.attemptId,a.steps[0].id,now)).toEqual({attempt:a,envelope:e});expect(completeStep(a,e,a.attemptId,a.steps[1].id,now)).toEqual({attempt:a,envelope:e});
 a=reviewStep(a,a.attemptId,'next')!;expect(a.viewIndex).toBe(1);expect(reviewStep(a,a.attemptId,'next')).toBe(a);expect(e.journey).toEqual({});
 const exercise=content.exercises.find(e=>e.id===a.steps[0].exercise.id)!;const image=content.images.find(i=>i.id===exercise.imageId)!;const title=exercise.title,alt=image.alt;const sourcePlan=content.plans.find(p=>p.id===a.planId)!;
 try{exercise.title='Editado';image.alt='Otra imagen';sourcePlan.steps.reverse();expect(a.steps).toEqual(snapshot);}finally{exercise.title=title;image.alt=alt;sourcePlan.steps.reverse();}
 for(const step of snapshot.slice(1)){const old=a;({attempt:a,envelope:e}=completeStep(a,e,a.attemptId,step.id,now) as {attempt:typeof a;envelope:typeof e});console.log('review prefix/view',old.acceptedCount,old.viewIndex,'accept',step.id,'->',a.acceptedCount,a.viewIndex,'status',a.status);}
 expect(a.status).toBe('completed');expect(a.acceptedCount).toBe(snapshot.length);expect(Object.keys(e.journey)).toEqual([sourceKey('actual','completion','review-uuid')]);expect(completeStep(a,e,a.attemptId,snapshot.at(-1)!.id,now).envelope).toBe(e);expect(reviewStep(a,a.attemptId,'previous')).toBe(a);
 const next=startSession(content,input,()=> 'fresh-uuid')!;expect(next.attemptId).not.toBe(a.attemptId);expect(completeStep(abandonSession(next),e,next.attemptId,next.steps[0].id,now).envelope).toBe(e);
 const chosen={...e,preference:{situationId:'first' as const,confirmed:true as const}};expect(guardHash('#/success/forged',content,{attempt:null,envelope:chosen}).screen).toBe('home');expect(guardHash('#/session/fresh-uuid',content,{attempt:null,envelope:chosen}).screen).toBe('home');
});
test('swimming start guard actual owner clears both affirmations on every leave reload reset and storage event',()=>{
 for(const action of ['navigate','reload','reset','storageEvent'] as const){const s=storage();const owner=createCommandOwner(content,s.port,'',()=>now);owner.dispatch({type:'chooseSituation',situationId:'regular'});owner.dispatch({type:'affirm',key:'canSwim',value:true});owner.dispatch({type:'affirm',key:'safePool',value:true});expect(owner.dispatch({type:'start',planId:'swim-water-regular'})).toBe(true);
 if(action==='navigate')owner.dispatch({type:'navigate',hash:'#/home'});if(action==='reset')owner.dispatch({type:'reset',confirmed:true,entry:'profile'});if(action==='storageEvent')owner.dispatch({type:'storageEvent',key:storageKey});const result=action==='reload'?createCommandOwner(content,s.port).getState():owner.getState();expect(result).toMatchObject({canSwim:false,safePool:false,attempt:null});expect(result.envelope.journey).toEqual({});console.log('water affirmation clearing',action,JSON.stringify(result.envelope));}
});
test('actual command custody all four explicit scenarios use projection dates and guarded notice identity without writes',()=>{
 const s=storage();const owner=createCommandOwner(content,s.port,'',()=>now);owner.dispatch({type:'chooseSituation',situationId:'first'});owner.dispatch({type:'intention',classId:'yoga-free'});const bytes=s.values.get(storageKey);const actual=owner.getState().envelope;
 for(const scenario of content.previewScenarios){
  expect(owner.dispatch({type:'enterScenario',scenarioId:scenario.id})).toBe(true);
  expect(owner.getState().route.screen).toBe(scenario.kind==='notice'?'notice':'home');
  const projection=selectPreviewJourney(content,scenario.id)!;expect(projection.today).toBe(scenario.referenceDate);expect(projection.sessions).toBe(scenario.history.length);expect(projection.points).toBe(scenario.history.length*content.rules.pointsPerCompletion);
  for(const hash of ['#/profile/journey','#/profile/challenges','#/session/forged','#/success/forged']){owner.dispatch({type:'navigate',hash});expect(owner.getState().route.profileId).toBe(scenario.recommendationSituationId);expect(owner.dispatch({type:'start',planId:'cal-first'})).toBe(false);}
  expect(owner.getState().envelope).toBe(actual);expect(s.values.get(storageKey)).toBe(bytes);owner.dispatch({type:'exitPreview'});expect(owner.getState().envelope).toBe(actual);expect(owner.getState().route.screen).toBe('home');
  console.log(scenario.id,projection.today,projection.sessions,projection.points,projection.activeWeeks,'actual identical',bytes);
 }
 expect(guardHash('#/notice/missed-class',content,owner.getState()).screen).toBe('profile');
});

test('actual command custody preview route isolation rejects genuine actual completion through canonical and legacy hashes',()=>{
 const id='941932b5-dcf7-4ec1-bb02-3b32e318c682';const s=storage();const owner=createCommandOwner(content,s.port,'',()=>now,()=>id);
 owner.dispatch({type:'chooseSituation',situationId:'first'});owner.dispatch({type:'start',planId:'cal-first'});
 for(const step of content.plans.find(p=>p.id==='cal-first')!.steps)expect(owner.dispatch({type:'accept',attemptId:id,stepId:step.id})).toBe(true);
 const canonical=`#/success/${encodeURIComponent(sourceKey('actual','completion',id))}`;const legacy=`#/first/calisthenics/success/${id}`;
 const bytes=s.values.get(storageKey);const envelope=owner.getState().envelope;expect(envelope.journey[sourceKey('actual','completion',id)].attemptId).toBe(id);
 for(const hash of [canonical,legacy]){owner.dispatch({type:'navigate',hash});expect(owner.getState().route).toMatchObject({screen:'success',attemptId:id});}
 owner.dispatch({type:'enterScenario',scenarioId:'sustained'});
 for(const hash of [legacy,canonical,`#/session/${id}`,`#/first/calisthenics/session/cal-first/${id}`,`#/sports/calisthenics/success/${id}`]){
  owner.dispatch({type:'navigate',hash});const state=owner.getState();console.log('genuine completion preview route',hash,JSON.stringify({route:state.route,mode:state.mode,unchanged:s.values.get(storageKey)===bytes}));
  expect(state.route).toEqual({screen:'home',profileId:'regular'});expect(state.mode).toEqual({kind:'preview',scenarioId:'sustained'});expect(state.envelope).toBe(envelope);expect(s.values.get(storageKey)).toBe(bytes);expect(owner.dispatch({type:'start',planId:'cal-regular'})).toBe(false);
 }
 owner.dispatch({type:'exitPreview'});owner.dispatch({type:'navigate',hash:canonical});expect(owner.getState().route).toMatchObject({screen:'success',attemptId:id});expect(s.values.get(storageKey)).toBe(bytes);
});
