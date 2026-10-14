import { test, expect } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import type { Content } from '../src/content/types';

const content = JSON.parse(readFileSync('public/config/app-content.json', 'utf8')) as Content;
const evidence = '/tmp/ba-batch-a';

for (const profile of content.profiles) {
  test(`configured navigation ${profile.id}: all three sports and both branches`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('combobox', { name: content.ui.profile }).selectOption(profile.id);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(profile.welcome);
    await expect(page.getByRole('heading', { level: 2, name: profile.hero, exact: true })).toBeVisible();
    await expect(page.locator('.hero')).toContainText(profile.nextPrompt);
    for (const sport of content.sports) {
      await page.getByRole('link', { name: sport.name, exact: true }).click();
      await expect(page.locator('main')).toHaveAttribute('data-sport-id', sport.id);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(sport.name);
      const plan = content.plans.find(p => p.profileId === profile.id && p.sportId === sport.id && p.medium === 'dry-land')!;
      await page.getByRole('link', { name: new RegExp(content.ui.solo) }).click();
      await expect(page.locator('[data-plan-id]')).toHaveAttribute('data-plan-id', plan.id);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(plan.name);
      await expect(page.locator('main')).toHaveAttribute('data-mode', 'solo');
      await expect(page.locator('[data-exercise-id]')).toHaveCount(plan.steps.length);
      for (const step of plan.steps) {
        const exercise = content.exercises.find(e => e.id === step.exerciseId)!;
        const row = page.locator(`[data-step-id="${step.id}"]`);
        await expect(row).toContainText(exercise.title);
        await expect(row).toContainText(exercise.quantity);
        await expect(row).toContainText(exercise.technique);
      }
      console.log(`${profile.id}/${sport.id}/solo -> ${plan.id}: ${plan.name}`);
      await page.getByRole('link', { name: content.ui.back, exact: true }).click();
      await page.getByRole('link', { name: new RegExp(content.ui.classes) }).click();
      await expect(page.locator('main')).toHaveAttribute('data-mode', 'classes');
      const classes = content.classes.filter(c => c.sportId === sport.id);
      await expect(page.locator('[data-class-id]')).toHaveCount(classes.length);
      for (const item of classes) {
        const card = page.locator(`[data-class-id="${item.id}"]`);
        await expect(card.getByRole('heading', { name: item.title })).toBeVisible();
        await expect(card).toContainText(item.schedule);
        await expect(card).toContainText(item.venue);
        await expect(card).toContainText(item.level);
        await expect(card).toContainText(item.receiver);
        console.log(`${profile.id}/${sport.id}/classes -> ${item.id}: ${item.title} / ${item.schedule}`);
      }
      await page.getByRole('link', { name: content.ui.home, exact: true }).click();
    }
    await expect(page.getByRole('button', { name: content.ui.start })).toHaveCount(0);
    await expect(page.getByRole('button', { name: content.ui.interest })).toHaveCount(0);
  });
}

test('configured navigation history, stale identity, incompatible switches and water deep links', async ({ page }) => {
  await page.goto('/#/first/calisthenics/solo/cal-first');
  await expect(page.locator('[data-plan-id]')).toHaveAttribute('data-plan-id', 'cal-first');
  await page.getByRole('link', { name: content.ui.back, exact: true }).click();
  await expect(page).toHaveURL(/calisthenics\/choice$/);
  await page.goBack();
  await expect(page.locator('[data-plan-id]')).toHaveAttribute('data-plan-id', 'cal-first');
  await page.goForward();
  await page.getByRole('link', { name: new RegExp(content.ui.classes) }).click();
  await expect(page.locator('[data-plan-id]')).toHaveCount(0);
  await page.getByRole('combobox').selectOption('returning');
  await expect(page).toHaveURL(/returning\/home$/);
  await expect(page.locator('[data-class-id], [data-plan-id]')).toHaveCount(0);
  await page.getByRole('link', { name: 'Yoga', exact: true }).click();
  await page.getByRole('link', { name: new RegExp(content.ui.solo) }).click();
  await expect(page.locator('[data-plan-id]')).toHaveAttribute('data-plan-id', 'yoga-returning');
  await expect(page.locator('main')).not.toContainText('Remo australiano');
  const cases = [
    ['#/first/yoga/solo/cal-first', '#/first/yoga/choice'],
    ['#/first/yoga/solo/yoga-returning', '#/first/yoga/choice'],
    ['#/first/yoga/solo/retired-plan', '#/first/yoga/choice'],
    ['#/first/yoga/solo', '#/first/yoga/choice'],
    ['#/regular/swimming/solo/swim-water-regular', '#/regular/swimming/choice'],
    ['#/first/swimming/session/swim-water-first', '#/first/swimming/choice'],
    ['#/first/yoga/classes/swim-paid', '#/first/yoga/classes'],
    ['#/first/yoga/classes/retired-class', '#/first/yoga/classes'],
    ['#/first/yoga/unknown-mode', '#/first/yoga/choice'],
    ['#/regular/retired-sport/classes', '#/regular/home'],
    ['#/retired-profile/yoga/solo/yoga-first', '#/first/home'],
  ];
  for (const [input, expected] of cases) {
    await page.goto('/' + input);
    await expect(page).toHaveURL(new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'));
    await expect(page.locator('[data-plan-id]')).toHaveCount(0);
    if (expected.endsWith('/classes')) {
      await expect(page.locator('[data-class-id]')).toHaveCount(2);
      await expect(page.locator('[data-class-id="swim-paid"]')).toHaveCount(0);
    }
    console.log(`guard ${input} -> ${expected}`);
  }
});

test('configured navigation static JSON, source bytes, assets, no-store and hash reload', async ({ page, request }) => {
  console.log('Chromium', page.context().browser()!.version());
  const json = await request.get('/config/app-content.json');
  expect(json.status()).toBe(200);
  expect(json.headers()['cache-control']).toBe('no-store');
  expect(await json.body()).toEqual(readFileSync('public/config/app-content.json'));
  expect(await json.body()).toEqual(readFileSync('dist/config/app-content.json'));
  for (const sport of content.sports) {
    const response = await request.get(sport.heroAsset);
    expect(response.status()).toBe(200);
    expect(await response.body()).toEqual(readFileSync('public' + sport.heroAsset));
    expect(await response.body()).toEqual(readFileSync('dist' + sport.heroAsset));
  }
  const absent = await request.get('/config/absent.json');
  expect(absent.status()).toBe(404);
  expect(await absent.text()).not.toBe(readFileSync('dist/index.html', 'utf8'));
  await page.addInitScript(() => {
    const original = window.fetch;
    window.fetch = (input, init) => {
      if (input === '/config/app-content.json') (window as unknown as { observedContentCache: RequestCache | undefined }).observedContentCache = init?.cache;
      return original(input, init);
    };
  });
  const fetched = page.waitForResponse(response => response.url().endsWith('/config/app-content.json'));
  await page.goto('/#/returning/yoga/solo/yoga-returning');
  const response = await fetched;
  expect(response.headers()['cache-control']).toBe('no-store');
  expect(await page.evaluate(() => (window as unknown as { observedContentCache: RequestCache }).observedContentCache)).toBe('no-store');
  await expect(page.locator('[data-plan-id]')).toHaveAttribute('data-plan-id', 'yoga-returning');
  await page.reload();
  await expect(page.locator('[data-plan-id]')).toHaveAttribute('data-plan-id', 'yoga-returning');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Yoga: volver con suavidad');
  console.log('/config/app-content.json source=dist=HTTP; SVGs source=dist=HTTP; no-store; missing404; returning/yoga/yoga-returning reload retained');
});

for (const width of [360, 1280]) {
  test(`configured navigation visual and keyboard ${width}px`, async ({ page }) => {
    mkdirSync(evidence, { recursive: true });
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(content.profiles[0].welcome);
    const inspect = async (screen: string) => {
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const targets = await page.locator('a:visible, button:visible, select:visible').evaluateAll(elements => elements.filter(element => element.className !== 'skip-link').map(element => ({ name: element.textContent, height: element.getBoundingClientRect().height })));
      for (const target of targets) expect(target.height, `${screen} target: ${target.name}`).toBeGreaterThanOrEqual(44);
      await page.screenshot({ path: `${evidence}/${width}-${screen}.png`, fullPage: true });
      console.log(`${width}px ${screen}: no horizontal overflow, targets >=44px, screenshot recorded`);
    };
    await inspect('home');
    const card = page.getByRole('link', { name: 'Calistenia', exact: true });
    await card.focus();
    expect(await card.evaluate(element => getComputedStyle(element).outlineStyle)).toBe('solid');
    expect(await card.evaluate(element => getComputedStyle(element).transitionDuration)).toBe('0s');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Calistenia');
    await inspect('choice');
    const solo = page.getByRole('link', { name: new RegExp(content.ui.solo) });
    await solo.focus();
    await page.screenshot({ path: `${evidence}/${width}-keyboard-focus.png`, fullPage: true });
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-plan-id]')).toHaveAttribute('data-plan-id', 'cal-first');
    await inspect('plan');
    await page.getByRole('link', { name: content.ui.back, exact: true }).click();
    await page.getByRole('link', { name: new RegExp(content.ui.classes) }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(content.ui.classCatalog);
    await inspect('catalog');
    await page.keyboard.press('Tab');
    for (const sportId of ['yoga', 'swimming']) {
      await page.goto(`/#/first/${sportId}/choice`);
      await expect(page.locator('main')).toHaveAttribute('data-sport-id', sportId);
      await inspect(`${sportId}-choice`);
    }
    console.log(`${width}px keyboard Enter opened actual choice/plan; solid focus outline; reduced-motion transition=0s; page scrolling exercised`);
  });
}
