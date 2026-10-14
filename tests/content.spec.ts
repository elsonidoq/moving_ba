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
    expect(content.classes).toHaveLength(6);
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
