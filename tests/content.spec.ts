import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { validateContent } from '../src/content/validate';
import type { Content } from '../src/content/types';

const source = JSON.parse(readFileSync('public/config/app-content.json', 'utf8')) as Content;
const clone = () => structuredClone(source);

test.describe('content validation', () => {
  test('accepts actual populated file: nine safe plans, three water variants, empty first baseline', () => {
    const content = validateContent(clone());
    for (const profile of content.profiles) {
      for (const sport of content.sports) {
        const plan = content.plans.find(p => p.profileId === profile.id && p.sportId === sport.id && p.medium === 'dry-land');
        expect(plan).toBeTruthy();
        console.log(`${profile.id}/${sport.id} -> ${plan!.id}: ${plan!.name}`);
      }
      const water = content.plans.find(p => p.profileId === profile.id && p.medium === 'water');
      expect(water?.sportId).toBe('swimming');
      console.log(`${profile.id}/water -> ${water!.id}`);
    }
    expect(content.scenarios.profiles.find(s => s.profileId === 'first')?.history).toEqual([]);
    expect(content.classes.length).toBeGreaterThanOrEqual(6);
  });
  const cases: [string, (c: Content) => void, string][] = [
    ['missing branding field', c => { delete (c.branding as Partial<Content['branding']>).name; }, 'branding.name'],
    ['missing legal field', c => { delete (c.legal as Partial<Content['legal']>).professionalReview; }, 'legal.professionalReview'],
    ['missing UI label', c => { delete (c.ui as Partial<Content['ui']>).solo; }, 'ui.solo'],
    ['missing later UI label', c => { delete (c.ui as Partial<Content['ui']>).storageWarning; }, 'ui.storageWarning'],
    ['blank Spanish label', c => { c.ui.home = ' '; }, 'ui.home'],
    ['HTML text', c => { c.branding.name = '<script>bad</script>'; }, 'branding.name'],
    ['unsupported schema', c => { (c as {schemaVersion: number}).schemaVersion = 2; }, 'schemaVersion'],
    ['bad entity ID Bad_ID', c => { c.plans[0].id = 'Bad_ID'; }, 'Bad_ID'],
    ['duplicate entity cal-first', c => { c.plans.push(c.plans[0]); }, 'cal-first'],
    ['duplicate sport ID', c => { c.sports[1].id = c.sports[0].id; }, 'duplicado'],
    ['duplicate current step identity', c => { c.plans[0].steps.push(c.plans[0].steps[0]); }, String(source.plans[0].steps[0].id)],
    ['bad step ID 1-step', c => { c.plans[0].steps[0].id = '1-step'; }, '1-step'],
    ['unknown exercise missing-exercise', c => { c.plans[0].steps[0].exerciseId = 'missing-exercise'; }, 'missing-exercise'],
    ['wrong sport exercise yoga-first-breath', c => { c.plans[0].steps[0].exerciseId = 'yoga-first-breath'; }, 'otro deporte'],
    ['unknown class sport', c => { c.classes[0].sportId = 'unknown' as never; }, 'sportId'],
    ['unknown default sport', c => { c.profiles[0].defaultSportId = 'unknown' as never; }, 'defaultSportId'],
    ['unknown default plan retired-plan', c => { c.profiles[0].defaultPlanId = 'retired-plan'; }, 'retired-plan'],
    ['wrong sport default', c => { c.profiles[0].defaultPlanId = 'yoga-first'; }, 'predeterminado'],
    ['wrong profile default', c => { c.profiles[0].defaultPlanId = 'cal-regular'; }, 'predeterminado'],
    ['water default', c => { c.profiles[0].defaultSportId = 'swimming'; c.profiles[0].defaultPlanId = 'swim-water-first'; }, 'medio seguro'],
    ['empty steps', c => { c.plans[0].steps = []; }, 'steps'],
    ['empty classes', c => { c.classes = []; }, 'classes'],
    ['missing safe yoga-returning', c => { c.plans = c.plans.filter(p => p.id !== 'yoga-returning'); }, 'yoga'],
    ['missing water swim-water-returning', c => { c.plans = c.plans.filter(p => p.id !== 'swim-water-returning'); }, 'variante'],
    ['missing free yoga coverage', c => { c.classes = c.classes.filter(x => x.id !== 'yoga-free'); }, 'yoga'],
    ['missing paid swim coverage', c => { c.classes = c.classes.filter(x => x.id !== 'swim-paid'); }, 'swimming'],
    ['invalid calendar date', c => { c.scenarios.profiles[1].history[0].activityDate = '2026-02-30'; }, 'fecha'],
    ['future fixture', c => { c.scenarios.profiles[1].history[0].activityDate = '2027-01-01'; }, 'posterior'],
    ['invalid reference date', c => { c.scenarios.referenceDate = 'yesterday'; }, 'fecha'],
    ['first baseline nonempty', c => { c.scenarios.profiles[0].history = [c.scenarios.profiles[1].history[0]]; }, 'historial vacío'],
    ['returning baseline empty', c => { c.scenarios.profiles[1].history = []; }, 'antecedentes'],
    ['returning without pause', c => { c.scenarios.profiles[1].history[0].activityDate = '2026-10-14'; }, 'pausa'],
    ['regular without multiweek progression', c => { c.scenarios.profiles[2].history.forEach(h => { h.activityDate = '2026-10-14'; }); }, 'semanas diferentes'],
    ['scenario wrong profile', c => { c.scenarios.profiles[0].profileId = 'regular'; }, 'otro perfil'],
    ['unknown scenario', c => { c.profiles[0].scenarioId = 'missing-scenario'; }, 'missing-scenario'],
    ['fixture wrong plan profile', c => { c.scenarios.profiles[1].history[0].planId = 'cal-first'; }, 'antecedente'],
    ['fixture wrong sport', c => { c.scenarios.profiles[1].history[0].sportId = 'swimming'; }, 'antecedente'],
    ['fixture duplicate ID', c => { c.scenarios.profiles[1].history[1].id = c.scenarios.profiles[1].history[0].id; }, 'duplicado'],
    ['invalid points negative', c => { c.rules.pointsPerCompletion = -1; }, 'pointsPerCompletion'],
    ['invalid points noninteger', c => { c.rules.pointsPerCompletion = 0.5; }, 'pointsPerCompletion'],
    ['invalid goal zero', c => { c.profiles[0].weeklyGoal = 0; }, 'weeklyGoal'],
    ['invalid target zero', c => { c.rules.challenges[0].target = 0; }, 'target'],
    ['invalid target nonfinite', c => { c.rules.challenges[0].target = Infinity; }, 'target'],
    ['invalid badge threshold', c => { c.rules.badges[0].threshold = -1; }, 'threshold'],
    ['invalid benefit threshold', c => { c.rules.benefits[0].pointsThreshold = NaN; }, 'pointsThreshold'],
    ['invalid metric', c => { c.rules.challenges[0].metric = 'points' as never; }, 'metric'],
    ['invalid period', c => { c.rules.challenges[0].period = 'year' as never; }, 'period'],
    ['redeemable benefit', c => { c.rules.benefits[0].redeemable = true as never; }, 'canjeables'],
    ['free amount positive', c => { c.classes[0].price.amount = 100; }, 'price.amount'],
    ['paid amount zero', c => { c.classes[1].price.amount = 0; }, 'price.amount'],
    ['paid amount nonfinite', c => { c.classes[1].price.amount = Infinity; }, 'price.amount'],
    ['wrong currency', c => { c.classes[1].price.currency = 'USD' as never; }, 'currency'],
    ['class not fictional', c => { c.classes[0].fictional = false as never; }, 'ficticia'],
    ['remote asset', c => { c.sports[0].heroAsset = 'https://example.com/art.svg'; }, 'heroAsset'],
    ['missing class schedule', c => { c.classes[0].schedule = ''; }, 'schedule'],
    ['water exercise inside dry swimming plan', c => { c.plans.find(p => p.id === 'swim-dry-first')!.steps[0].exerciseId = 'swim-water-first-warmup'; }, 'medio'],
    ['water exercise non-swimming', c => { c.exercises[0].medium = 'water'; }, 'natación'],
    ['water plan non-swimming', c => { c.plans[0].medium = 'water'; }, 'natación'],
  ];
  for (const [name, mutate, hint] of cases) {
    test(`rejects ${name}`, () => {
      const c = clone(); mutate(c);
      expect(() => validateContent(c)).toThrow(hint);
      try { validateContent(c); } catch (error) { console.log(`${name}: ${(error as Error).message}`); }
    });
  }
  test('allows repeated exercise with distinct step identity and zero nonnegative rules', () => {
    const c = clone(); c.plans[0].steps.push({id: 'shoulders-again', exerciseId: c.plans[0].steps[0].exerciseId});
    c.rules.pointsPerCompletion = 0; c.rules.benefits[0].pointsThreshold = 0;
    expect(validateContent(c).plans[0].steps).toHaveLength(4);
  });
  test('permits a dry warmup inside a swimming water variant without weakening water classification', () => {
    const c = clone();
    c.plans.find(p => p.id === 'swim-water-first')!.steps.unshift({id: 'dry-warmup', exerciseId: 'swim-dry-first-shoulders'});
    expect(validateContent(c).plans.find(p => p.id === 'swim-water-first')!.medium).toBe('water');
  });
  test('all required text fields are checked, not just fields exercised by current previews', () => {
    for (const path of ['branding', 'ui', 'legal'] as const) {
      for (const key of Object.keys(source[path])) {
        const c = clone(); delete (c[path] as Record<string, unknown>)[key];
        expect(() => validateContent(c), `${path}.${key}`).toThrow(`${path}.${key}`);
      }
    }
  });
});

test('content validation rejects missing onboarding contract before consumers mount', () => {
  const c = clone(); delete (c as unknown as Record<string, unknown>).onboarding;
  expect(() => validateContent(c)).toThrow('onboarding');
});

test.describe('content validation extended contract', () => {
  test('exact choices, four moments and nine supportive answer destinations', () => {
    const c = validateContent(clone());
    expect(c.onboarding.choices.map(x => x.label)).toEqual(['No estoy entrenando y quiero empezar.', 'Entrenaba antes y quiero volver.', 'Ya estoy entrenando.']);
    expect(c.previewScenarios.map(x => x.title)).toEqual(['Entrenamiento sostenido', 'Volver después de una pausa', 'Dejó de entrenar y de usar la app', 'Pensaba asistir a una clase, pero no fue']);
    expect(c.chats.find(x => x.id === 'missed-class-chat')!.answers.map(x => x.label)).toEqual(['Me surgió algo', 'El horario o el lugar no me sirven', 'No me gustó la actividad', 'No me sentí cómodo/a con el docente o la clase', 'Prefiero no responder']);
    expect(c.chats.find(x => x.id === 'inactive-chat')!.answers.map(x => x.label)).toEqual(['Volver con una clase', 'Entrenar algo corto por mi cuenta', 'Probar otra actividad', 'Prefiero no responder']);
    for (const chat of c.chats) for (const a of chat.answers) {
      const d = c.destinations.find(x => x.id === a.destinationId)!;
      expect(d).toBeTruthy();
      if (d.kind === 'plan') expect(c.plans.find(p => p.id === d.planId)).toMatchObject({ medium: 'dry-land', profileId: c.previewScenarios.find(s => s.id === chat.scenarioId)!.recommendationSituationId });
      console.log(`${chat.id}/${a.id}: ${a.response} -> ${JSON.stringify(d)}`);
    }
    expect(c.exercises.every(e => e.imageStatus === 'verified' && e.imageId !== null && e.imageAsset === '')).toBe(true);
    console.log('All 36 exercises have explicit reviewed local JPEG subjects; general SVG imageAsset remains empty.');
  });
  const cases: [string, (c: Content) => void, string][] = [
    ['missing onboarding copy', c => { c.onboarding.editTitle = ''; }, 'onboarding.editTitle'],
    ['extra choice', c => { c.onboarding.choices.push({id:'other' as never,label:'Otra cosa'}); }, 'onboarding.choices'],
    ['incorrect exact choice', c => { c.onboarding.choices[0].label = 'Otra cosa'; }, 'label'],
    ['duplicate scenario', c => { c.previewScenarios[1].id = 'sustained'; }, 'duplicado'],
    ['unknown scenario ID', c => { c.previewScenarios[0].id = 'unknown'; }, 'previewScenarios'],
    ['missing scenario copy', c => { c.previewScenarios[0].guidance = ''; }, 'guidance'],
    ['scenario malformed date', c => { c.previewScenarios[0].referenceDate = '2026-02-30'; }, 'referenceDate'],
    ['scenario wrong category', c => { c.previewScenarios[0].recommendationSituationId = 'first'; }, 'situación'],
    ['scenario wrong kind', c => { c.previewScenarios[0].kind = 'notice'; }, 'kind'],
    ['unknown chat', c => { c.previewScenarios[2].chatId = 'unknown'; }, 'chatId'],
    ['chat wrong owner', c => { c.chats[0].scenarioId = 'inactive'; }, 'otro escenario'],
    ['unknown chat ID', c => { c.chats[0].id = 'unknown'; }, 'chats'],
    ['duplicate answer', c => { c.chats[0].answers[1].id = c.chats[0].answers[0].id; }, 'duplicado'],
    ['Other answer', c => { c.chats[0].answers[0].id = 'other'; }, 'answers'],
    ['missing supportive response', c => { c.chats[0].answers[0].response = ''; }, 'response'],
    ['unknown destination', c => { c.chats[0].answers[0].destinationId = 'unknown'; }, 'destinationId'],
    ['duplicate destination', c => { c.destinations[1].id = c.destinations[0].id; }, 'duplicado'],
    ['contradictory destination', c => { (c.destinations[0] as unknown as Record<string,unknown>).planId = 'cal-returning'; }, 'contradictorios'],
    ['wrong sport target', c => { c.destinations[0].sportId = 'yoga'; }, 'deporte'],
    ['retired exact class', c => { (c.destinations[0] as {classId:string}).classId = 'retired'; }, 'retired'],
    ['wrong case kind', c => { c.destinations[0] = {id:c.destinations[0].id,kind:'sport',sportId:'yoga',label:'Explorar'}; }, 'kind'],
    ['wrong category plan', c => { (c.destinations.find(d => d.kind === 'plan') as {planId:string}).planId = 'yoga-first'; }, 'situación'],
    ['water destination', c => { const d = c.destinations.find(d => d.kind === 'plan')!; d.sportId = 'swimming'; (d as {planId:string}).planId = 'swim-water-returning'; }, 'medio seguro'],
    ['unknown image', c => { c.exercises[0].imageId = 'unknown'; }, 'imageId'],
    ['false verified missing image', c => { c.exercises[0].imageId = null; c.exercises[0].imageStatus = 'verified'; }, 'no disponible'],
    ['general SVG exact exercise', c => { c.exercises[0].imageAsset = '/assets/calisthenics.svg'; }, 'imageAsset'],
  ];
  for (const [name, mutate, hint] of cases) test(`rejects ${name}`, () => {
    const c = clone(); mutate(c); expect(() => validateContent(c)).toThrow(hint);
    try { validateContent(c); } catch(e) { console.log(`${name}: ${(e as Error).message}`); }
  });
  function withUnverifiedImage() {
    const c = clone(); const e = c.exercises[0];
    c.images.unshift({id:'pending',path:null,alt:'Imagen del ejercicio no disponible',subject:{kind:'exercise',id:e.id},sourceUrl:null,attribution:'Sin atribución verificada',provenance:'Sin permiso verificado',licenseStatus:'unverified',evidence:null});
    e.imageId = 'pending'; e.imageStatus = 'unavailable'; return c;
  }
  test('unverified exact assignment is honestly unavailable, not displayable', () => {
    const c = validateContent(withUnverifiedImage()); expect(c.exercises[0].imageStatus).toBe('unavailable'); expect(c.images[0].path).toBeNull();
    console.log('pending exact subject, path=null/license=unverified -> unavailable');
    const general = withUnverifiedImage(); general.images[0].subject = {kind:'sport',id:'calisthenics'};
    expect(() => validateContent(general)).toThrow('ejercicio exacto');
    const claimed = withUnverifiedImage(); claimed.exercises[0].imageStatus = 'verified';
    expect(() => validateContent(claimed)).toThrow('estado');
  });
  for (const path of ['http://example.com/a.jpg','https://example.com/a.jpg','//example.com/a.jpg','data:image/png;base64,AAAA','javascript:alert(1)','/assets\\photo.jpg','/assets/../photo.jpg','/assets/%2e%2e/photo.jpg','/assets/%252e%252e/photo.jpg','/assets/photo.jpg?x=1','/assets/photo.jpg#x','/assets/unapproved.jpg','/assets/calisthenics.svg']) {
    test(`rejects image path ${path}`, () => {
      const c = withUnverifiedImage(); c.images[0].path = path;
      expect(() => validateContent(c)).toThrow('images.pending.path');
      try { validateContent(c); } catch(e) { console.log(`${JSON.stringify(path)} -> ${(e as Error).message}`); }
    });
  }
});

import { verifiedImages, validateImageRegistry, type ImageRegistry } from '../src/content/images';
test('content validation shared JPEG admits only enumerated equivalent exercise subjects',()=>{
 const c=validateContent(clone());const first=c.exercises.find(e=>e.id==='cal-first-shoulders')!;const returning=c.exercises.find(e=>e.id==='cal-returning-shoulders')!;
 const image=c.images.find(i=>i.id===first.imageId)!;const other=c.images.find(i=>i.id===returning.imageId)!;expect(image.path).toBe(other.path);expect(verifiedImages[image.path!].subjectIds).toContain(first.id);expect(verifiedImages[image.path!].subjectIds).toContain(returning.id);
 const mismatch=clone();mismatch.images.find(i=>i.id===first.imageId)!.path='/assets/photos/swim_warmup.jpg';expect(()=>validateContent(mismatch)).toThrow('sujeto exacto');
 const missing=clone();missing.images.find(i=>i.id===first.imageId)!.subject.id='cal-first-row';expect(()=>validateContent(missing)).toThrow('sujeto exacto');
 for(const ids of [undefined,[],['cal-first-shoulders','cal-first-shoulders'],['unknown'],['first'],['*']]){
  const registry:ImageRegistry={'/assets/photos/cali_warmup.jpg':{subjectKind:'exercise',subjectIds:ids as string[],evidence:'review'}};
  expect(()=>validateImageRegistry(c.exercises.map(e=>e.id),c.sports.map(s=>s.id),registry)).toThrow('subjectIds');console.log('registry rejects exact subject set',JSON.stringify(ids));
 }
 console.log('shared JPEG permitted explicit subjects',image.path,verifiedImages[image.path!].subjectIds);
});

test('content validation editor handoff documents one-person empty reset and transient scenario custody',()=>{
 const architecture=readFileSync('docs/architecture.md','utf8');const guide=readFileSync('docs/CONTENT_CONFIGURATION.md','utf8');const readme=readFileSync('README.md','utf8');
 for(const field of ['one-person','legacySource','intention','preference'])expect(architecture).toContain(field);
 for(const field of ['previewScenarios','destinations','imageStatus','imageId','licenseStatus'])expect(guide).toContain(field);
 expect(readme).toContain('empty');expect(guide).toContain('empty');expect(readme).not.toContain('restore all three\nfixtures');
});
