import { test, expect } from '@playwright/test';
import { readFileSync, mkdirSync, writeFileSync, unlinkSync } from 'node:fs';
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

const bEvidence = '/tmp/ba-batch-b';
const demoKey = 'ba-en-movimiento:demo:v1';
async function envelope(page: import('@playwright/test').Page) {
  await expect(page.locator('main')).toBeVisible();
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)!), demoKey);
}
async function finish(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: content.ui.start, exact: true }).click();
  const attempt = await page.locator('[data-attempt-id]').getAttribute('data-attempt-id');
  const planId = (await page.url()).split('/session/')[1].split('/')[0];
  const plan = content.plans.find(p => p.id === planId)!;
  for (const step of plan.steps) {
    await expect(page.locator('[data-current-step-id]')).toHaveAttribute('data-current-step-id',step.id);
    await expect(page.locator('main')).toContainText(content.exercises.find(e => e.id === step.exerciseId)!.technique);
    const button = page.getByRole('button', { name: content.ui.completeStep, exact: true });
    if (step.id === plan.steps.at(-1)!.id) await button.evaluate(element => { (element as HTMLButtonElement).click(); (element as HTMLButtonElement).click(); });
    else await button.click();
  }
  await expect(page.locator('[data-completed-attempt-id]')).toHaveAttribute('data-completed-attempt-id',attempt!);
  return attempt!;
}
test('swimming safety separate affirmations, dry default, abandonment and stale routes', async ({ page }) => {
  for (const profile of content.profiles) {
    await page.goto(`/#/${profile.id}/swimming/solo/swim-dry-${profile.id}`);
    await expect(page.locator('.medium-label')).toHaveText(content.ui.dryLand);
    const water = page.getByRole('button',{name:content.ui.startWater,exact:true});
    await expect(water).toBeDisabled();
    await page.getByRole('checkbox',{name:content.ui.canSwim}).check(); await expect(water).toBeDisabled();
    await page.getByRole('checkbox',{name:content.ui.canSwim}).uncheck();
    await page.getByRole('checkbox',{name:content.ui.safePool}).check(); await expect(water).toBeDisabled();
    await page.getByRole('checkbox',{name:content.ui.canSwim}).check(); await expect(water).toBeEnabled();
    await water.click();
    await expect(page.locator('[data-current-step-id]')).toHaveAttribute('data-current-step-id',content.plans.find(p=>p.id===`swim-water-${profile.id}`)!.steps[0].id);
    await expect(page.locator('.medium-label')).toHaveText(content.ui.water);
    const stale = page.url();
    await page.getByRole('link',{name:content.ui.home,exact:true}).click();
    await page.evaluate(hash => { location.hash=hash; },stale.split('#')[1]);
    await expect(page.locator('[data-attempt-id]')).toHaveCount(0);
    await page.goto(`/#/${profile.id}/swimming/solo/swim-dry-${profile.id}`);
    await expect(page.getByRole('checkbox',{name:content.ui.canSwim})).not.toBeChecked();
    await expect(page.getByRole('checkbox',{name:content.ui.safePool})).not.toBeChecked();
    await page.getByRole('button',{name:content.ui.start,exact:true}).click();
    await expect(page.locator('.medium-label')).toHaveText(content.ui.dryLand);
    await page.getByRole('combobox').selectOption('first');
    await page.goto(`/#/first/swimming/solo/swim-dry-first`);
    await page.getByRole('link',{name:content.ui.classes,exact:true}).click();
    await expect(page.locator('[data-class-id]')).toHaveCount(2);
    console.log('swimming gate',profile.id,'none/ability-only/pool-only blocked; both water; dry available; stale abandoned');
  }
  expect(Object.values((await envelope(page)).profiles).every((p: any)=>Object.keys(p.completions).length===0)).toBe(true);
});
test('solo durable completion explicit order, replay navigation, refresh, new attempt and partial zero', async ({ page, browser }) => {
  await page.goto('/#/first/calisthenics/solo/cal-first');
  expect(Object.keys((await envelope(page)).profiles.first.completions)).toHaveLength(0);
  await page.goto('/#/first/calisthenics/session/cal-first/forged');
  await expect(page.locator('[data-attempt-id]')).toHaveCount(0);
  await page.getByRole('button',{name:content.ui.start,exact:true}).click();
  await page.getByRole('button',{name:content.ui.completeStep,exact:true}).click();
  await page.reload(); await expect(page.locator('[data-plan-id]')).toHaveAttribute('data-plan-id','cal-first');
  expect(Object.keys((await envelope(page)).profiles.first.completions)).toHaveLength(0);
  const id = await finish(page); const success = page.url();
  await page.reload(); await expect(page.locator('[data-completed-attempt-id]')).toHaveAttribute('data-completed-attempt-id',id);
  await page.getByRole('link',{name:content.ui.next,exact:true}).click();
  await page.goBack(); await page.goForward(); await page.goto(success);
  expect(Object.keys((await envelope(page)).profiles.first.completions)).toEqual([id]);
  await page.getByRole('link',{name:content.ui.next,exact:true}).click();
  const second = await finish(page); expect(second).not.toBe(id);
  expect(Object.keys((await envelope(page)).profiles.first.completions)).toEqual([id,second]);
  await page.getByRole('combobox').selectOption('returning'); await page.reload();
  await expect(page.getByRole('combobox')).toHaveValue('returning');
  const saved = await envelope(page); console.log('durable envelope',JSON.stringify(saved));
  const context = await browser.newContext({storageState:await page.context().storageState()});
  const other = await context.newPage(); await other.goto('/'); await expect(other.getByRole('combobox')).toHaveValue('returning'); await context.close();
  mkdirSync(bEvidence,{recursive:true}); await page.screenshot({path:`${bEvidence}/t003-success-profile.png`,fullPage:true});
});
for (const mode of ['denied','corrupt','version','sport','profile']) {
  test(`storage envelope browser ${mode} Spanish scoped recovery`,async ({page})=>{
    await page.addInitScript(({mode,key})=>{
      localStorage.setItem('unrelated','sentinel');
      if(mode==='denied') { Storage.prototype.getItem=()=>{throw Error('denied');};Storage.prototype.setItem=()=>{throw Error('denied');}; }
      else if(mode==='corrupt') localStorage.setItem(key,'{');
    },{mode,key:demoKey});
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
    if(!['denied','corrupt'].includes(mode)) {
      await page.evaluate(({mode,key})=>{const e=JSON.parse(localStorage.getItem(key)!);if(mode==='version')e.schemaVersion=2; if(mode==='sport')e.profiles.returning.baselineHistory[0].sportId='unknown';if(mode==='profile')e.selectedProfileId='unknown';localStorage.setItem(key,JSON.stringify(e));},{mode,key:demoKey});
      await page.reload();
    }
    const warning=mode==='denied'?content.ui.storageWarning:content.ui.storageRecovery;
    await expect(page.getByRole('alert')).toContainText(warning);
    if(mode==='denied') {
      await page.goto('/#/first/calisthenics/solo/cal-first'); await finish(page);
      await expect(page.locator('[data-completed-attempt-id]')).toHaveCount(1);
      await expect(page.getByRole('alert')).toContainText(warning);
    } else {
      await page.getByRole('button',{name:content.ui.storageReset,exact:true}).click();
      await expect(page.getByRole('alert')).toHaveCount(0);
      expect(Object.keys((await envelope(page)).profiles.first.completions)).toHaveLength(0);
      expect(await page.evaluate(()=>localStorage.getItem('unrelated'))).toBe('sentinel');
    }
    console.log(mode,'Spanish warning',warning,'scoped recovery/in-memory success');
  });
}
test('storage envelope browser external event abandons transient session',async({page})=>{
  await page.goto('/#/first/calisthenics/solo/cal-first');
  await page.getByRole('button',{name:content.ui.start,exact:true}).click();
  await page.evaluate(key=>window.dispatchEvent(new StorageEvent('storage',{key})),demoKey);
  await expect(page.locator('[data-attempt-id]')).toHaveCount(0);
  expect(Object.keys((await envelope(page)).profiles.first.completions)).toHaveLength(0);
});

test('class identity rendered exact six fictional details',async({page})=>{
  for(const item of content.classes) {
    await page.goto(`/#/first/${item.sportId}/classes`);
    await page.locator(`[data-class-id="${item.id}"]`).getByRole('link',{name:content.ui.viewClass}).click();
    const detail=page.locator('[data-detail-class-id]');
    await expect(detail).toHaveAttribute('data-detail-class-id',item.id);
    await expect(page.getByRole('heading',{level:1})).toHaveText(item.title);
    for(const field of ['schedule','venue','locality','level','description','receiver','contactCopy'] as const)await expect(detail).toContainText(item[field]);
    for(const requirement of item.requirements) await expect(detail).toContainText(requirement);
    await expect(detail).toContainText(content.ui[item.price.kind]);
    if(item.price.kind==='paid') await expect(detail).toContainText(`${new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(item.price.amount)} ARS`);
    await expect(detail).toContainText(content.legal.fictionalClasses);
    console.log('rendered class',item.id,item.title,item.schedule,item.price.amount,item.receiver);
  }
});
test('yoga interest both exact free/paid persist without training credit',async({page})=>{
  await page.clock.setFixedTime(new Date('2026-10-14T15:00:00Z'));
  await page.route('**/config/app-content.json',async route=>{ const response=await route.fetch(); const json=await response.json();json.classes.reverse();await route.fulfill({response,json}); });
  await page.goto('/#/first/yoga/classes'); await expect(page.locator('main')).toBeVisible();
  const before=JSON.stringify((await envelope(page)).profiles.first.completions);
  const beforeRewards=await assertDerived(page,'first');
  for(const id of ['yoga-free','yoga-paid']) {
    await page.goto('/#/first/yoga/classes');
    await page.locator(`[data-class-id="${id}"]`).getByRole('link',{name:content.ui.viewClass}).click();
    const item=content.classes.find(c=>c.id===id)!;
    await expect(page.getByRole('heading',{level:1})).toHaveText(item.title);
    await expect(page.locator('main')).toContainText(item.schedule);
    await expect(page.locator('main')).toContainText(item.venue);
    await expect(page.locator('main')).toContainText(content.legal.fictionalClasses);
    await page.getByRole('button',{name:content.ui.interest,exact:true}).click();
    await expect(page.getByRole('status')).toHaveText(content.ui.interestSuccess);
    await page.reload(); await expect(page.locator('[data-detail-class-id]')).toHaveAttribute('data-detail-class-id',id);
    await expect(page.getByRole('status')).toHaveText(content.ui.interestSuccess);
    expect(JSON.stringify((await envelope(page)).profiles.first.completions)).toBe(before);
    expect(await assertDerived(page,'first')).toEqual(beforeRewards);
  }
  expect(Object.keys((await envelope(page)).profiles.first.interests)).toEqual(['yoga-free','yoga-paid']);
  console.log('Yoga IDs',JSON.stringify((await envelope(page)).profiles.first),'training unchanged',before);
});
test('profile reset all three isolated refresh, fixtures restored, unrelated sentinel retained',async({page})=>{
  await page.clock.setFixedTime(new Date('2026-10-14T15:00:00Z'));
  await page.goto('/#/first/calisthenics/solo/cal-first');
  await finish(page);
  await page.goto('/#/first/yoga/classes/yoga-free'); await page.getByRole('button',{name:content.ui.interest,exact:true}).click();
  await page.evaluate(()=>localStorage.setItem('unrelated','sentinel'));
  for(const profile of content.profiles) {
    await page.getByRole('combobox').selectOption(profile.id);
    await expect(page).toHaveURL(new RegExp(`${profile.id}/home$`));
    await page.reload(); await expect(page.getByRole('combobox')).toHaveValue(profile.id);
    await page.getByRole('link',{name:'Yoga',exact:true}).click();
    await page.getByRole('link',{name:new RegExp(content.ui.solo)}).click();
    await expect(page.locator('[data-plan-id]')).toHaveAttribute('data-plan-id',`yoga-${profile.id}`);
    const e=await envelope(page);
    expect(Object.keys(e.profiles[profile.id].completions)).toHaveLength(profile.id==='first'?1:0);
    expect(Object.keys(e.profiles[profile.id].interests)).toHaveLength(profile.id==='first'?1:0);
    console.log('profile',profile.id,JSON.stringify(e.profiles[profile.id]));
    await assertDerived(page,profile.id);
  }
  page.once('dialog',dialog=>dialog.accept()); await page.getByRole('button',{name:content.ui.reset,exact:true}).click();
  await expect(page.getByRole('combobox')).toHaveValue('first');
  const reset=await envelope(page);
  for(const profile of content.profiles) {
    expect(reset.profiles[profile.id].completions).toEqual({}); expect(reset.profiles[profile.id].interests).toEqual({});
    expect(reset.profiles[profile.id].baselineHistory.map((r:any)=>r.id)).toEqual(content.scenarios.profiles.find(s=>s.profileId===profile.id)!.history.map(r=>r.id));
  }
  expect(await page.evaluate(()=>localStorage.getItem('unrelated'))).toBe('sentinel');
  await page.reload(); await expect(page.getByRole('combobox')).toHaveValue('first');
  for(const profile of content.profiles) { await assertDerived(page,profile.id); }
  await page.getByRole('combobox').selectOption('first');
  console.log('reset envelope',JSON.stringify(reset),'sentinel retained');
});
test('profile reset denied write preserves unrelated and Spanish limitation',async({page})=>{
  await page.goto('/#/first/calisthenics/solo/cal-first'); await finish(page);
  await page.evaluate(()=>{localStorage.setItem('unrelated','sentinel');Storage.prototype.setItem=()=>{throw Error('denied');};});
  page.once('dialog',dialog=>dialog.accept()); await page.getByRole('button',{name:content.ui.reset,exact:true}).click();
  await expect(page.getByRole('alert')).toContainText(content.ui.storageWarning);
  await expect(page.getByRole('combobox')).toHaveValue('first');
  expect(await page.evaluate(()=>localStorage.getItem('unrelated'))).toBe('sentinel');
  expect(Object.keys((await envelope(page)).profiles.first.completions)).toHaveLength(1);
  console.log('reset write failed: memory reset, durable original retained, Spanish limitation, sentinel retained');
});

function oracleWeek(date:string) {
  const n=Math.floor(Date.parse(date+'T00:00:00Z')/86400000);
  return new Date((Math.floor((n+3)/7)*7-3)*86400000).toISOString().slice(0,10);
}
async function assertDerived(page:import('@playwright/test').Page,profileId:string,today='2026-10-14') {
  const e=await envelope(page);const data=e.profiles[profileId];
  const history=[...data.baselineHistory,...Object.values(data.completions)] as any[];
  const weeks=[...new Set(history.map(r=>oracleWeek(r.activityDate)))].sort();
  const week=history.filter(r=>oracleWeek(r.activityDate)===oracleWeek(today)&&r.activityDate<=today);
  const month=history.filter(r=>r.activityDate.slice(0,7)===today.slice(0,7)&&r.activityDate<=today);
  const points=history.length*content.rules.pointsPerCompletion;
  const goal=content.profiles.find(p=>p.id===profileId)!.weeklyGoal;
  await page.evaluate(p=>{location.hash=`#/${p}/journey`;},profileId);
  await expect(page.getByRole('heading',{level:1})).toHaveText(content.ui.journey);
  await expect(page.locator('[data-stat="sessions"]')).toHaveText(String(history.length));
  await expect(page.locator('[data-stat="points"]')).toHaveText(String(points));
  await expect(page.locator('[data-stat="activeWeeks"]')).toHaveText(String(weeks.length));
  await expect(page.locator('[data-stat="weeklyGoal"]')).toHaveText(`${week.length} / ${goal}`);
  await expect(page.locator('[data-history-id]')).toHaveCount(history.length);
  for(const r of history) {
    const row=page.locator(`[data-history-id="${r.id}"]`);await expect(row).toContainText(r.planTitle);await expect(row).toContainText(r.origin==='seed'?content.ui.seedOrigin:content.ui.simulatedOrigin);
    await expect(row.locator('time')).toHaveAttribute('datetime',r.activityDate);
  }
  expect(await page.locator('[data-week-key]').evaluateAll(rows=>rows.map(r=>r.getAttribute('data-week-key')))).toEqual(weeks);
  await expect(page.locator('main')).toContainText(content.ui.rest);
  const next=content.plans.find(p=>p.id===content.profiles.find(p=>p.id===profileId)!.defaultPlanId)!;
  await expect(page.locator('main').getByRole('link',{name:next.name,exact:true})).toHaveAttribute('href',`#/${profileId}/${next.sportId}/solo/${next.id}`);
  await page.locator('main').getByRole('link',{name:content.ui.challenges,exact:true}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText(content.ui.challenges);
  await expect(page.locator('[data-stat="points"]')).toHaveText(String(points));
  const challenges=[];
  for(const rule of content.rules.challenges) {
    const list=rule.period==='week'?week:month;
    const value=rule.metric==='sessions'?list.length:new Set(list.map(r=>oracleWeek(r.activityDate))).size;
    const row=page.locator(`[data-challenge-id="${rule.id}"]`);
    await expect(row.locator('[data-challenge-value]')).toHaveText(`${value} / ${rule.target}`);
    await expect(row.locator('progress')).toHaveAttribute('value',String(Math.min(value,rule.target)));
    challenges.push([rule.id,value,rule.target]);
  }
  const badges=[];
  for(const rule of content.rules.badges) {
    const earned=(rule.metric==='sessions'?history.length:weeks.length)>=rule.threshold;
    await expect(page.locator(`[data-badge-id="${rule.id}"]`)).toHaveAttribute('data-earned',String(earned));badges.push([rule.id,earned]);
  }
  await expect(page.locator('main')).toContainText(content.legal.noAgreement);
  await expect(page.locator('main')).toContainText(content.legal.nonredeemable);
  for(const benefit of content.rules.benefits)await expect(page.locator(`[data-benefit-id="${benefit.id}"]`)).toContainText(benefit.disclaimer);
  const observed={profileId,ids:history.map(r=>r.id).sort(),points,activeWeeks:weeks.length,weeklyGoal:`${week.length} / ${goal}`,challenges,badges};console.log('rendered oracle',JSON.stringify(observed));return observed;
}
test('calisthenics journey rewards exactly once at composed boundaries, humane profiles and rest',async({page})=>{
  await page.clock.setFixedTime(new Date('2026-10-14T15:00:00Z'));
  await page.goto('/#/first/journey');
  await expect(page.locator('main')).toContainText(content.ui.historyEmpty);
  const empty=await assertDerived(page,'first');expect(empty.points).toBe(0);expect(empty.ids).toEqual([]);
  await page.goto('/#/first/calisthenics/session/cal-first/forged');
  await expect(page.locator('[data-plan-id]')).toHaveAttribute('data-plan-id','cal-first');
  await page.getByRole('button',{name:content.ui.start,exact:true}).click();
  await page.getByRole('button',{name:content.ui.completeStep,exact:true}).click();
  await page.getByRole('link',{name:content.ui.journey,exact:true}).click();
  expect(await assertDerived(page,'first')).toEqual(empty);
  await page.goto('/#/first/calisthenics/solo/cal-first');
  const first=await finish(page);const success=page.url();
  const once=await assertDerived(page,'first');expect(once.ids).toEqual([first]);expect(once.points).toBe(content.rules.pointsPerCompletion);
  await page.reload();expect(await assertDerived(page,'first')).toEqual(once);
  await page.goto(success);await expect(page.locator('[data-completed-attempt-id]')).toHaveAttribute('data-completed-attempt-id',first);
  await page.getByRole('link',{name:content.ui.next,exact:true}).click();await page.goBack();await page.goForward();
  expect(await assertDerived(page,'first')).toEqual(once);
  await page.goto('/#/first/calisthenics/solo/cal-first');const second=await finish(page);
  const twice=await assertDerived(page,'first');expect(twice.ids).toEqual([first,second].sort());expect(twice.points).toBe(2*content.rules.pointsPerCompletion);
  await page.reload();expect(await assertDerived(page,'first')).toEqual(twice);
  mkdirSync(bEvidence,{recursive:true});await page.screenshot({path:`${bEvidence}/t005-first-challenges.png`,fullPage:true});
  for(const id of ['returning','regular']) {
    await page.getByRole('combobox').selectOption(id);await page.evaluate(p=>{location.hash=`#/${p}/journey`;},id);
    await expect(page.getByRole('heading',{level:1})).toHaveText(content.ui.journey);
    await expect(page.locator('main')).toContainText(content.profiles.find(p=>p.id===id)!.subtitle);
    if(id==='returning')await expect(page.locator('main')).toContainText(content.ui.pause);
    await assertDerived(page,id);
  }
  await page.clock.setFixedTime(new Date('2026-11-02T15:00:00Z'));
  const rested=await assertDerived(page,'first','2026-11-02');expect(rested.points).toBe(twice.points);expect(rested.badges).toEqual(twice.badges);expect(rested.ids).toEqual(twice.ids);expect(rested.weeklyGoal).toBe('0 / 1');
});

// This file runs serially: mutations affect the actual dist file owned by this server.
const servedConfig = 'dist/config/app-content.json';
const cEvidence = '/tmp/ba-batch-c';
test('content edits real served file, immutable selections and historical snapshots', async ({page, request}) => {
  mkdirSync(cEvidence,{recursive:true});
  const original = readFileSync(servedConfig);
  try {
    await page.goto('/#/first/calisthenics/solo/cal-first');
    const attemptId = await finish(page);
    await page.goto('/#/first/yoga/classes/yoga-free');
    await page.getByRole('button',{name:content.ui.interest,exact:true}).click();
    const saved = await envelope(page);
    const edited = structuredClone(content);
    const item = edited.classes.find(c=>c.id==='yoga-free')!;
    item.title = 'Yoga: encuentro editorial de ejemplo'; item.schedule = 'Viernes 16:45 · horario ficticio';
    const plan = edited.plans.find(p=>p.id==='cal-first')!;
    plan.steps.reverse(); plan.name = 'Calistenia: versión editorial';
    edited.exercises.find(e=>e.id===plan.steps[0].exerciseId)!.technique = 'Ejemplo editorial: usá un apoyo estable y un recorrido cómodo.';
    edited.rules.benefits[0].description = 'Una pausa editorial de demostración, sin oferta real.';
    const bytes = JSON.stringify(edited,null,2)+'\n';
    writeFileSync(servedConfig,bytes); writeFileSync(cEvidence+'/edited-content.json',bytes);
    const response = await request.get('/config/app-content.json');
    expect(response.status()).toBe(200); expect(await response.text()).toBe(bytes);
    await page.reload();
    await expect(page.locator('[data-detail-class-id]')).toHaveAttribute('data-detail-class-id','yoga-free');
    await expect(page.getByRole('heading',{level:1})).toHaveText(item.title);
    await expect(page.locator('main')).toContainText(item.schedule);
    await page.goto('/#/first/calisthenics/solo/cal-first'); await page.reload();
    expect(await page.locator('[data-step-id]').evaluateAll(rows=>rows.map(r=>r.getAttribute('data-step-id')))).toEqual(plan.steps.map(s=>s.id));
    expect(await page.locator('[data-exercise-id]').evaluateAll(rows=>rows.map(r=>r.getAttribute('data-exercise-id')))).toEqual(plan.steps.map(s=>s.exerciseId));
    await expect(page.locator('main')).toContainText(edited.exercises.find(e=>e.id===plan.steps[0].exerciseId)!.technique);
    await page.goto('/#/first/challenges'); await page.reload();
    await expect(page.locator('[data-benefit-id]')).toContainText(edited.rules.benefits[0].description);
    expect((await envelope(page)).profiles.first).toEqual(saved.profiles.first);
    await page.goto('/#/first/journey');
    await expect(page.locator(`[data-history-id="${attemptId}"]`)).toContainText(content.plans.find(p=>p.id==='cal-first')!.name);
    // Retire identities while keeping required coverage and references valid.
    item.id='yoga-editorial'; plan.id='cal-editorial'; edited.profiles[0].defaultPlanId=plan.id;
    writeFileSync(servedConfig,JSON.stringify(edited));
    await page.goto('/#/first/yoga/classes/yoga-free'); await page.reload();
    await expect(page).toHaveURL(/first\/yoga\/classes$/);
    await expect(page.locator('[data-detail-class-id]')).toHaveCount(0);
    await expect(page.locator('[data-class-id="yoga-editorial"]')).toHaveCount(1);
    await page.goto('/#/first/calisthenics/solo/cal-first'); await page.reload();
    await expect(page).toHaveURL(/calisthenics\/choice$/);
    expect((await envelope(page)).profiles.first).toEqual(saved.profiles.first);
    console.log('REAL HTTP200 edits yoga-free title+schedule; cal-first reversed stable steps',plan.steps,'benefit description+exercise technique; retired routes -> catalog/choice; snapshots retained',attemptId);
  } finally { writeFileSync(servedConfig,original); }
  expect(await (await request.get('/config/app-content.json')).body()).toEqual(original);
  await page.goto('/'); await page.reload();
  await expect(page.getByRole('heading',{level:1})).toHaveText(content.profiles[0].welcome);
  await page.goto('/#/first/yoga/classes/yoga-free');
  await expect(page.getByRole('heading',{level:1})).toHaveText(content.classes.find(c=>c.id==='yoga-free')!.title);
  console.log('Baseline restored: actual HTTP bytes and original Yoga detail');
});
test('content failures real missing malformed reference-invalid files recover on retry',async({page,request})=>{
  const original=readFileSync(servedConfig);
  try {
    for(const kind of ['missing','malformed','reference-invalid']) {
      try {
        if(kind==='missing') unlinkSync(servedConfig);
        else if(kind==='malformed') writeFileSync(servedConfig,'{"schemaVersion":');
        else {const invalid=structuredClone(content);invalid.plans[0].steps[0].exerciseId='missing-editor-exercise';writeFileSync(servedConfig,JSON.stringify(invalid));}
        const response=await request.get('/config/app-content.json');
        expect(response.status()).toBe(kind==='missing'?404:200);
        await page.goto('/#/first/challenges'); await page.reload();
        const alert=page.getByRole('alert');
        await expect(alert).toContainText('No pudimos cargar el contenido.');
        await expect(alert).toContainText('Revisá la configuración e intentá de nuevo.');
        await expect(alert).toContainText(kind==='missing'?'404':kind==='malformed'?'formato JSON válido':'missing-editor-exercise');
        await expect(page.locator('[data-stat], [data-benefit-id]')).toHaveCount(0);
        await page.screenshot({path:`${cEvidence}/content-error-${kind}.png`,fullPage:true});
        console.log('REAL failure',kind,'HTTP',response.status(),'Spanish blocking hint',await alert.innerText());
      } finally {writeFileSync(servedConfig,original);}
      expect(await (await request.get('/config/app-content.json')).body()).toEqual(original);
      await page.getByRole('button',{name:'Intentar de nuevo',exact:true}).click();
      await expect(page.getByRole('heading',{level:1})).toHaveText(content.ui.challenges);
      await expect(page.getByRole('alert')).toHaveCount(0);
      await expect(page.locator('[data-benefit-id]')).toHaveCount(content.rules.benefits.length);
      console.log(kind,'restored HTTP exact baseline and retry rendered challenges successfully');
    }
  } finally {writeFileSync(servedConfig,original);}
});

test('inspection guards reject invented detail, session, success and skipped credit',async({page})=>{
  await page.goto('/#/first/home');
  const before=(await envelope(page)).profiles.first;
  for(const route of ['first/yoga/classes/imaginary','first/yoga/classes/swim-paid','first/calisthenics/session/cal-first/skipped','first/calisthenics/success/skipped','regular/swimming/session/swim-water-regular/skipped','regular/swimming/solo/swim-water-regular']) {
    await page.goto('/#/'+route);
    await expect(page.locator('[data-attempt-id], [data-completed-attempt-id], [data-detail-class-id]')).toHaveCount(0);
    console.log('inspection guard',route,'->',page.url());
  }
  expect((await envelope(page)).profiles.first).toEqual(before);
  expect(Object.keys((await envelope(page)).profiles.regular.completions)).toHaveLength(0);
  await page.goto('/#/first/swimming/solo/swim-dry-first');
  await expect(page.getByRole('button',{name:content.ui.startWater,exact:true})).toBeDisabled();
  await page.getByRole('link',{name:content.ui.classes,exact:true}).click();
  await page.locator('[data-class-id="swim-free"]').getByRole('link',{name:content.ui.viewClass}).click();
  await page.locator('main').getByRole('link',{name:content.ui.solo,exact:true}).click();
  await expect(page.locator('[data-plan-id]')).toHaveAttribute('data-plan-id','swim-dry-first');
  await page.getByRole('link',{name:content.ui.journey,exact:true}).click();
  await page.locator('main').getByRole('link',{name:content.plans.find(p=>p.id==='cal-first')!.name,exact:true}).click();
  await expect(page.locator('[data-plan-id]')).toHaveAttribute('data-plan-id','cal-first');
  await page.getByRole('button',{name:content.ui.start,exact:true}).click();
  await page.getByRole('link',{name:content.ui.back,exact:true}).click();
  expect((await envelope(page)).profiles.first).toEqual(before);
  await page.goto('/#/first/challenges');
  await page.locator('main').getByRole('link',{name:content.ui.journey,exact:true}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText(content.ui.journey);
  console.log('retained instructor, detail-to-solo, next-practice, active back and challenges-to-journey links work without credit');
});
for(const width of [360,1280]) {
  test(`presenter visual six concepts both branches ${width}px`,async({page})=>{
    mkdirSync(cEvidence,{recursive:true});
    await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});
    const inspect=async(name:string)=>{
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      const targets=await page.locator('a:visible,button:visible,select:visible,label.affirmation:visible').evaluateAll(rows=>rows.filter(r=>r.className!=='skip-link').map(r=>({name:r.textContent,height:r.getBoundingClientRect().height})));
      for(const t of targets)expect(t.height,`${name}: ${t.name}`).toBeGreaterThanOrEqual(44);
      await page.evaluate(()=>scrollTo(0,0));
      await page.screenshot({path:`${cEvidence}/${width}-${name}.png`,fullPage:true});
      console.log('visual',width,name,'no overflow; targets >=44px; screenshot');
    };
    await page.goto('/');await expect(page.getByRole('heading',{level:1})).toHaveText(content.profiles[0].welcome);await inspect('home');
    const cal=page.getByRole('link',{name:'Calistenia',exact:true});await cal.focus();
    expect(await cal.evaluate(e=>getComputedStyle(e).outlineStyle)).toBe('solid');
    expect(await cal.evaluate(e=>getComputedStyle(e).transitionDuration)).toBe('0s');
    await page.keyboard.press('Enter');await expect(page.getByRole('heading',{level:1})).toHaveText('Calistenia');await inspect('choice');
    await page.getByRole('link',{name:new RegExp(content.ui.solo)}).click();await inspect('plan');
    await page.getByRole('button',{name:content.ui.start,exact:true}).click();await expect(page.locator('[data-attempt-id]')).toHaveCount(1);await inspect('session');
    for(const step of content.plans.find(p=>p.id==='cal-first')!.steps) {await expect(page.locator('[data-current-step-id]')).toHaveAttribute('data-current-step-id',step.id);await page.getByRole('button',{name:content.ui.completeStep,exact:true}).click();}
    await expect(page.getByRole('heading',{level:1})).toHaveText(content.ui.success);await inspect('success');
    await page.goto('/#/first/yoga/classes');await expect(page.locator('[data-class-id]')).toHaveCount(2);await inspect('catalog');
    await page.locator('[data-class-id="yoga-free"]').getByRole('link',{name:content.ui.viewClass}).click();await inspect('detail');
    await page.getByRole('button',{name:content.ui.interest,exact:true}).click();await expect(page.getByRole('status')).toHaveText(content.ui.interestSuccess);await inspect('interest');
    await page.goto('/#/first/journey');await expect(page.getByRole('heading',{level:1})).toHaveText(content.ui.journey);await inspect('journey');
    await page.goto('/#/first/challenges');await expect(page.getByRole('heading',{level:1})).toHaveText(content.ui.challenges);await inspect('challenges');
    await page.goto('/#/first/swimming/solo/swim-dry-first');
    const checkbox=page.getByRole('checkbox',{name:content.ui.canSwim});await page.keyboard.press('Tab');await checkbox.focus();expect(await checkbox.evaluate(e=>getComputedStyle(e).outlineStyle)).toBe('solid');await inspect('swimming');
    await page.evaluate(key=>localStorage.setItem(key,'{'),demoKey);await page.reload();await expect(page.getByRole('alert')).toContainText(content.ui.storageRecovery);await inspect('storage-error');
    await page.getByRole('button',{name:content.ui.storageReset,exact:true}).click();await page.goto('/#/first/journey');await expect(page.locator('main')).toContainText(content.ui.historyEmpty);await inspect('empty');
  });
}

test('presenter bootstrap and storage language with useful Spanish feedback',async({page})=>{
  await page.setViewportSize({width:360,height:900});
  let release!:()=>void;
  const pending=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/config/app-content.json',async route=>{await pending;await route.continue();});
  await page.goto('/');await expect(page.getByRole('status')).toHaveText('Estamos cargando el contenido…');
  await page.screenshot({path:`${cEvidence}/360-loader.png`,fullPage:true});release();
  await expect(page.getByRole('heading',{level:1})).toHaveText(content.profiles[0].welcome);
  await page.unroute('**/config/app-content.json');
  await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw Error('denied');};});
  await page.reload();await page.getByRole('combobox').selectOption('returning');
  await expect(page.getByRole('alert')).toContainText(content.ui.storageWarning);
  await page.screenshot({path:`${cEvidence}/360-storage-warning.png`,fullPage:true});
  await page.keyboard.press('Tab');const skip=page.getByRole('button',{name:content.ui.skipToContent});await skip.focus();await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.locator('.brand').click();await expect(page).toHaveURL(/returning\/home$/);
  console.log('Spanish loader, persistence limitation, keyboard skip-to-main and brand navigation observed');
});
