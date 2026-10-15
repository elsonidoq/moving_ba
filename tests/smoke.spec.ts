import { createHash } from 'node:crypto';
import { test, expect, type Page } from '@playwright/test';
import { readFileSync, mkdirSync, writeFileSync, renameSync } from 'node:fs';
import type { Content } from '../src/content/types';
import { normalizeLegacy, type LegacyEnvelope } from '../src/state/storage';
const content=JSON.parse(readFileSync('public/config/app-content.json','utf8')) as Content;
const key='ba-en-movimiento:demo:v1';
const evidence='/tmp/ba-batch2';mkdirSync(evidence,{recursive:true});
const raw=(page:Page)=>page.evaluate(k=>localStorage.getItem(k),key);
async function choose(page:Page,id='first') {await expect(page.getByRole('heading',{level:1})).toBeVisible();const start=page.getByRole('button',{name:content.onboarding.startLabel,exact:true});if(await start.count())await start.click();await page.getByRole('radio',{name:content.onboarding.choices.find(c=>c.id===id)!.label,exact:true}).check();await page.getByRole('button',{name:content.onboarding.continueLabel,exact:true}).click();}
function legacy():LegacyEnvelope {
 const profiles=Object.fromEntries(['first','returning','regular'].map(p=>[p,{baselineHistory:[{id:'collision',profileId:p,sportId:'yoga',planId:'retired',planTitle:`Histórica ${p}`,sportTitle:'Yoga',medium:'dry-land',activityDate:'2026-10-01',origin:'seed'}],completions:{'shared-attempt':{id:'shared-attempt',attemptId:'shared-attempt',profileId:p,sportId:'yoga',planId:'retired-completed',planTitle:`Terminada ${p}`,sportTitle:'Yoga',medium:'dry-land',activityDate:'2026-10-02',origin:'user-simulated',timestamp:'2026-10-02T15:00:00.000Z',completedStepIds:['step-one']}},interests:{'retired-class':{classId:'retired-class',profileId:p,sportId:'yoga',classTitle:`Clase ${p}`,sportTitle:'Yoga',timestamp:'2026-10-02T15:00:00.000Z',origin:'simulated-interest'}}}]));
 return {schemaVersion:1,selectedProfileId:'regular',scenarioReferenceDate:'2026-10-14',profiles} as LegacyEnvelope;
}
test('one-person onboarding profile exact unselected choices and no identity inference',async({page})=>{
 await page.goto('/#/regular/yoga/solo/yoga-regular');
 await expect(page.getByRole('heading',{level:1})).toHaveText(content.branding.name);
 await expect(page.getByRole('radio')).toHaveCount(0);await expect(page.getByRole('navigation',{name:'Principal'})).toHaveCount(0);
 await expect(page.locator('.city-hero')).toHaveAttribute('alt','Obelisco y avenida 9 de Julio en Buenos Aires');
 const before=await raw(page);expect(before).toBeNull();await page.evaluate(()=>localStorage.setItem('unrelated','sentinel'));
 for(const action of ['back','reload','reentry']){
  await page.getByRole('button',{name:content.onboarding.startLabel,exact:true}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Contanos sobre vos');
  await expect(page.getByRole('group',{name:content.onboarding.instructions})).toBeVisible();
  await expect(page.getByRole('radio')).toHaveCount(3);await expect(page.getByRole('radio',{checked:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:content.onboarding.continueLabel,exact:true})).toBeDisabled();
  await page.getByRole('radio').nth(1).check();expect(await raw(page)).toBe(before);
  if(action==='back'){await page.getByRole('button',{name:content.ui.back,exact:true}).focus();await page.keyboard.press('Enter');}
  else if(action==='reload')await page.reload();else await page.evaluate(()=>location.hash='#/sports/yoga');
  await expect(page.getByRole('heading',{level:1})).toHaveText(content.branding.name);
  await expect(page.getByRole('radio')).toHaveCount(0);expect(await raw(page)).toBe(before);expect(await page.evaluate(()=>localStorage.getItem('unrelated'))).toBe('sentinel');
  console.log('T002/V1 selection-only',action,'before',before,'after',await raw(page),'sentinel unchanged');
 }
});
for(const choice of content.onboarding.choices) test(`one-person onboarding profile ${choice.id} explicit recommendation survives reload`,async({page})=>{
 await page.goto('/');await choose(page,choice.id);const profile=content.profiles.find(p=>p.id===choice.id)!;
 await expect(page.locator('.hero')).toContainText(profile.hero);await homePhoto(page);expect(JSON.parse((await raw(page))!).preference).toEqual({situationId:choice.id,confirmed:true});
 await page.reload();await expect(page.locator('.hero')).toContainText(profile.hero);await homePhoto(page);await expect(page.getByRole('button',{name:content.onboarding.startLabel,exact:true})).toHaveCount(0);await expect(page.getByRole('radio')).toHaveCount(0);const saved=await raw(page);await page.goto('/#/regular/home');await expect(page.locator('.hero')).toContainText(profile.hero);expect(await raw(page)).toBe(saved);console.log('choice',choice.id,'route',page.url(),'bytes',await raw(page));
});
test('one-person onboarding profile legacy collision choose reload edit preserves canonical history and lifetime',async({page})=>{
 const source=legacy();await page.addInitScript(({key,source})=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem(key,JSON.stringify(source));sessionStorage.setItem('seeded','yes');}},{key,source});
 await page.goto('/#/regular/home');await expect(page.getByRole('button',{name:content.onboarding.startLabel,exact:true})).toBeVisible();await expect(page.getByRole('radio')).toHaveCount(0);expect(await raw(page)).toBe(JSON.stringify(source));
 await choose(page,'first');let before=JSON.parse((await raw(page))!);expect(before.journey).toEqual(normalizeLegacy(source).journey);before.intention={classId:'yoga-free',sportId:'yoga',classSnapshot:content.classes.find(c=>c.id==='yoga-free'),chosenAt:'2026-10-14T15:00:00.000Z',origin:'simulated-intention'};await page.evaluate(({key,before})=>localStorage.setItem(key,JSON.stringify(before)),{key,before});
 await page.reload();await page.getByRole('link',{name:content.ui.profileAccessibleName}).click();await expect(page.locator('[data-stat="sessions"]')).toHaveText('6');await expect(page.locator('[data-stat="points"]')).toHaveText('60');
 await page.getByRole('link',{name:content.ui.journey,exact:true}).click();await expect(page.locator('[data-history-id]')).toHaveCount(6);
 for(const p of ['first','returning','regular'])await expect(page.locator('main')).toContainText(`Histórica ${p}`);
 await page.getByRole('link',{name:content.ui.back,exact:true}).click();await page.getByRole('button',{name:content.ui.editSituation}).click();await choose(page,'returning');
 const after=JSON.parse((await raw(page))!);expect({...after,preference:null}).toEqual({...before,preference:null});expect(after.preference.situationId).toBe('returning');
 for(const hash of ['#/regular/home','#/profile/journey','#/first/home']){await page.evaluate(h=>location.hash=h,hash);await expect.poll(()=>page.url()).not.toContain('onboarding');expect(await raw(page)).toBe(JSON.stringify(after));}
 await page.goBack();await page.goForward();expect(await raw(page)).toBe(JSON.stringify(after));
 console.log('canonical before/after preference only',JSON.stringify(before),JSON.stringify(after),'rendered 6 sessions/60 points, source tuples',Object.keys(after.journey));
});
test('one-person reset recovery normal and invalid cancel exact no-op, confirmed empty scoped reset never reseeds',async({page})=>{
 await page.goto('/');await choose(page);await page.evaluate(()=>localStorage.setItem('unrelated','sentinel'));await page.getByRole('link',{name:content.ui.profileAccessibleName}).click();
 const before=await raw(page);const url=page.url();page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:content.ui.reset,exact:true}).click();expect(await raw(page)).toBe(before);expect(page.url()).toBe(url);await expect(page.getByRole('button',{name:content.ui.reset,exact:true})).toBeFocused();
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:content.ui.reset,exact:true}).click();await expect(page.getByRole('radio',{checked:true})).toHaveCount(0);expect(JSON.parse((await raw(page))!)).toEqual({schemaVersion:1,layout:'one-person',preference:null,journey:{},interests:{},intention:null});
 await page.reload();await expect(page.getByRole('button',{name:content.onboarding.startLabel,exact:true})).toBeVisible();await expect(page.getByRole('radio')).toHaveCount(0);expect(await page.evaluate(()=>localStorage.getItem('unrelated'))).toBe('sentinel');
 await page.evaluate(k=>localStorage.setItem(k,'{invalid-exact-bytes'),key);await page.reload();await expect(page.getByRole('heading',{level:1})).toHaveText(content.ui.storageRecovery);const broken=await raw(page);const brokenURL=page.url();
 page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:content.ui.storageReset}).click();expect(await raw(page)).toBe(broken);expect(page.url()).toBe(brokenURL);
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:content.ui.storageReset}).click();await expect(page.getByRole('button',{name:content.onboarding.startLabel,exact:true})).toBeVisible();await expect(page.getByRole('radio')).toHaveCount(0);expect(JSON.parse((await raw(page))!).journey).toEqual({});
 console.log('normal cancel bytes',before,'corrupt cancel bytes',broken,'confirmed bytes',await raw(page),'sentinel',await page.evaluate(()=>localStorage.getItem('unrelated')));
});
test('one-person reset recovery denied read write and reset show tab-only failure then retained data returns on reload',async({page})=>{
 const actual=normalizeLegacy(legacy());actual.preference={situationId:'first',confirmed:true};const old=JSON.stringify(actual);
 await page.addInitScript(({key,old})=>{
 const get=Storage.prototype.getItem,set=Storage.prototype.setItem;
 if(!sessionStorage.getItem('seeded')){set.call(localStorage,key,old);sessionStorage.setItem('seeded','yes');sessionStorage.setItem('denyRead','yes');}
 (window as any).__nativeRaw=()=>get.call(localStorage,key);
 Storage.prototype.getItem=function(k){if(this===localStorage&&k===key&&sessionStorage.getItem('denyRead'))throw Error('denied read');return get.call(this,k);};
 Storage.prototype.setItem=function(k,v){if(this===localStorage&&k===key&&sessionStorage.getItem('denyWrite'))throw Error('denied write');return set.call(this,k,v);};
 },{key,old});
 await page.goto('/');await expect(page.getByRole('alert')).toContainText('pestaña');await choose(page,'regular');expect(await page.evaluate(()=>(window as any).__nativeRaw())).toBe(old);
 await page.evaluate(()=>sessionStorage.removeItem('denyRead'));await page.reload();await expect(page.locator('.hero')).toContainText(content.profiles[0].hero);
 await page.evaluate(()=>sessionStorage.setItem('denyWrite','yes'));await page.getByRole('link',{name:content.ui.profileAccessibleName}).click();await page.getByRole('button',{name:content.ui.editSituation}).click();await choose(page,'returning');await expect(page.getByRole('alert')).toContainText('volver al recargar');
 await page.getByRole('link',{name:content.ui.profileAccessibleName}).click();page.once('dialog',d=>d.accept());await page.getByRole('button',{name:content.ui.reset,exact:true}).click();await expect(page.getByRole('alert')).toHaveText(content.ui.resetFailed);await expect(page.getByRole('radio',{checked:true})).toHaveCount(0);expect(await page.evaluate(()=>(window as any).__nativeRaw())).toBe(old);
 await page.evaluate(()=>sessionStorage.removeItem('denyWrite'));await page.reload();await expect(page.locator('.hero')).toContainText(content.profiles[0].hero);console.log('denied read/write/reset exact preserved bytes',old,'Spanish reset',content.ui.resetFailed,'reload restores old first preference and 6 records');
});
for(const width of [360,1280]) test(`one-person onboarding profile keyboard visual ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/');await expect(page.getByRole('heading',{level:1})).toBeFocused();
 await page.screenshot({path:`/tmp/ba-refresh-t002/${width}-welcome.png`,fullPage:true});await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:content.onboarding.startLabel,exact:true})).toBeFocused();await page.keyboard.press('Enter');await expect(page.getByRole('heading',{level:1})).toHaveText(content.onboarding.title);await expect(page.getByRole('heading',{level:1})).toBeFocused();
 await shellCopy(page);for(const label of content.onboarding.choices.map(c=>c.label))await expect(page.getByRole('radio',{name:label,exact:true})).toBeVisible();
 for(const control of await page.locator('.situation-option,button:not(.skip-link)').all()){const box=await control.boundingBox();expect(box!.height).toBeGreaterThanOrEqual(44);}
 const entryGeometry=await page.locator('h1').evaluate(el=>({headingTop:el.getBoundingClientRect().top,headerBottom:document.querySelector('.app-header')!.getBoundingClientRect().bottom,overflow:document.documentElement.scrollWidth>innerWidth}));expect(entryGeometry.headingTop).toBeGreaterThanOrEqual(entryGeometry.headerBottom);expect(entryGeometry.overflow).toBe(false);console.log('T002/V2 entry geometry',width,entryGeometry);
 await page.screenshot({path:`/tmp/ba-refresh-t002/${width}-selection.png`,fullPage:true});
 await page.keyboard.press('Tab');await expect(page.getByRole('radio').first()).toBeFocused();await page.keyboard.press('Space');await page.keyboard.press('ArrowDown');await expect(page.getByRole('radio').nth(1)).toBeChecked();
 await page.screenshot({path:`${evidence}/t003-${width}-onboarding.png`,fullPage:true});await page.screenshot({path:`/tmp/ba-refresh-t002/${width}-radio-keyboard.png`});await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:content.onboarding.continueLabel,exact:true})).toBeFocused();await page.keyboard.press('Enter');
 await expect(page.getByRole('heading',{level:1})).toBeFocused();await page.screenshot({path:`${evidence}/t003-${width}-home.png`,fullPage:true});
 await page.getByRole('link',{name:content.ui.profileAccessibleName}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('heading',{level:1})).toBeFocused();
 const reset=page.getByRole('button',{name:content.ui.reset,exact:true});await reset.focus();page.once('dialog',d=>d.dismiss());await page.keyboard.press('Enter');await expect(reset).toBeFocused();await page.screenshot({path:`${evidence}/t003-${width}-profile.png`,fullPage:true});
 for(const selector of ['.profile-button','.bottom-tabs a','button:not(.skip-link)','.situation-option'])for(const box of await page.locator(selector).all()){const b=await box.boundingBox();if(b)expect(b.height).toBeGreaterThanOrEqual(44);}
 const sizes=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,appBottom:document.querySelector('.app')!.getBoundingClientRect().bottom,tabHeight:document.querySelector('.bottom-tabs')!.getBoundingClientRect().height,padding:getComputedStyle(document.querySelector('.app')!).paddingBottom}));expect(sizes.scroll).toBeLessThanOrEqual(sizes.client);expect(parseInt(sizes.padding)).toBeGreaterThan(sizes.tabHeight);
 const editBytes=await raw(page);await page.getByRole('button',{name:content.ui.editSituation,exact:true}).click();await expect(page.getByRole('heading',{level:1})).toHaveText(content.onboarding.editTitle);await expect(page.getByRole('group',{name:content.onboarding.editInstructions})).toBeVisible();await shellCopy(page);await expect(page.locator('main')).not.toContainText(/cómo estás hoy/i);await page.screenshot({path:`/tmp/ba-refresh-t002/${width}-profile-edit.png`,fullPage:true});await page.getByRole('radio').first().check();await page.getByRole('button',{name:content.ui.cancel,exact:true}).click();expect(await raw(page)).toBe(editBytes);
 await page.getByRole('button',{name:content.ui.skipToContent}).focus();await page.keyboard.press('Enter');await expect(page.locator('main')).toBeFocused();console.log('keyboard radio ArrowDown/profile/reset cancel/skip focus passed',width,sizes,'screenshots',`${evidence}/t003-${width}-*.png`);
});

test('one-person class intention cross-sport catalog exposes every exact class',async({page})=>{
 await page.goto('/');await choose(page);await page.getByRole('navigation',{name:'Principal'}).getByRole('link',{name:'Clases',exact:true}).click();
 await expect(page.locator('[data-class-id]')).toHaveCount(content.classes.length);
});

test('one-person class intention all sport branches, exact fields, contextual keyboard back and distinct durable intention',async({page})=>{
 const geoCalls:string[]=[];await page.addInitScript(()=>{navigator.geolocation.getCurrentPosition=()=>{throw Error('unexpected geolocation');};navigator.geolocation.watchPosition=()=>{throw Error('unexpected geolocation');};});page.on('pageerror',e=>geoCalls.push(e.message));
 await page.goto('/');await choose(page);const initial=JSON.parse((await raw(page))!);
 for(const sport of content.sports){
   await page.getByRole('navigation',{name:'Principal'}).getByRole('link',{name:content.ui.sports,exact:true}).click();await page.getByRole('link',{name:new RegExp(sport.name)}).filter({has:page.locator('strong')}).click();
   await expect(page.getByRole('heading',{level:1})).toHaveText(sport.name);await page.getByRole('link',{name:new RegExp(content.ui.solo)}).click();
   const plan=content.plans.find(p=>p.profileId==='first'&&p.sportId===sport.id&&p.medium==='dry-land')!;await expect(page.locator('[data-plan-id]')).toHaveAttribute('data-plan-id',plan.id);
   await page.getByRole('link',{name:content.ui.back,exact:true}).click();await page.locator('main').getByRole('link',{name:new RegExp('^'+content.ui.classes)}).click();await expect(page.locator('[data-class-id]')).toHaveCount(2);
   for(const item of content.classes.filter(c=>c.sportId===sport.id)){
     const card=page.locator(`[data-class-id="${item.id}"]`);await card.getByRole('link',{name:content.ui.viewClass}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('heading',{level:1})).toBeFocused();
     const detail=page.locator(`[data-detail-class-id="${item.id}"]`);for(const field of ['title','schedule','venue','locality','level','description','receiver','contactCopy'] as const)await expect(detail).toContainText(item[field]);for(const r of item.requirements)await expect(detail).toContainText(r);
     await expect(detail).toContainText('ARS');await expect(detail).toContainText(content.ui[item.price.kind]);await expect(detail).toContainText(content.legal.fictionalClasses);await expect(detail).toContainText(content.ui.locationIllustration);await expect(detail).toContainText(content.ui.intentionNotice);
     await page.getByRole('link',{name:content.ui.back,exact:true}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('heading',{level:1})).toBeFocused();await expect(page.locator('main')).toHaveAttribute('data-sport-id',sport.id);console.log('exact class fields / keyboard detail back',JSON.stringify(item));
   }
 }
 await page.getByRole('navigation',{name:'Principal'}).getByRole('link',{name:content.ui.classes,exact:true}).click();await page.locator('.class-filters').getByRole('link',{name:'Yoga',exact:true}).click();
 await page.locator('[data-class-id="yoga-paid"]').getByRole('link',{name:content.ui.viewClass}).click();await page.getByRole('link',{name:content.ui.back,exact:true}).click();await expect(page).toHaveURL(/#\/classes\/yoga$/);await expect(page.locator('[data-class-id]')).toHaveCount(2);
 await page.locator('[data-class-id="yoga-paid"]').getByRole('link',{name:content.ui.viewClass}).click();await page.getByRole('button',{name:content.ui.interest,exact:true}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('status').filter({hasText:content.ui.interestSuccess})).toBeVisible();
 const interested=JSON.parse((await raw(page))!);expect(Object.keys(interested.interests)).toHaveLength(1);expect(interested.intention).toBeNull();
 const intend=page.getByRole('button',{name:content.ui.intention,exact:true});await intend.focus();await page.keyboard.press('Enter');const first=await raw(page);await intend.click();expect(await raw(page)).toBe(first);expect(JSON.parse(first!).intention.classSnapshot).toEqual(content.classes.find(c=>c.id==='yoga-paid'));
 await page.reload();await page.getByRole('navigation',{name:'Principal'}).getByRole('link',{name:content.ui.home,exact:true}).click();await expect(page.locator('[data-intended-class-id]')).toHaveCount(1);await expect(page.locator('[data-intended-class-id="yoga-paid"]')).toContainText(content.classes.find(c=>c.id==='yoga-paid')!.schedule);
 await page.goto('/#/sports/calisthenics/classes/cal-free');await page.getByRole('button',{name:content.ui.intention,exact:true}).click();const second=JSON.parse((await raw(page))!);expect(second.intention.classId).toBe('cal-free');expect(second.interests).toEqual(interested.interests);expect(second.journey).toEqual(initial.journey);
 await page.getByRole('link',{name:content.ui.profileAccessibleName}).click();await expect(page.locator('[data-stat="sessions"]')).toHaveText('0');await expect(page.locator('[data-stat="points"]')).toHaveText('0');expect(geoCalls).toEqual([]);
 console.log('interest separate',JSON.stringify(interested),'first intention bytes',first,'replacement bytes',JSON.stringify(second),'no geolocation calls or credit');
});
test('one-person class intention reorder, retirement and wrong/unknown hashes never substitute array positions',async({page})=>{
 await page.goto('/');await choose(page);await page.goto('/#/sports/yoga/classes/yoga-paid');await page.getByRole('button',{name:content.ui.intention,exact:true}).click();const bytes=await raw(page);
 const reordered=structuredClone(content);reordered.classes.reverse();await page.route('**/config/app-content.json',r=>r.fulfill({json:reordered}));await page.reload();await expect(page.getByRole('heading',{level:1})).toHaveText(content.classes.find(c=>c.id==='yoga-paid')!.title);
 const retired=structuredClone(reordered);const replacement=retired.classes.find(c=>c.id==='yoga-paid')!;replacement.id='yoga-replacement';replacement.title='Otra clase ilustrativa';await page.unroute('**/config/app-content.json');await page.route('**/config/app-content.json',r=>r.fulfill({json:retired}));
 await page.goto('/?retired#/home');await expect(page.locator('[data-intended-class-id="yoga-paid"]')).toContainText(content.ui.notAvailable);await expect(page.locator('[data-intended-class-id]')).not.toContainText('Otra clase ilustrativa');expect(await raw(page)).toBe(bytes);
 await page.goto('/#/sports/swimming/classes/yoga-free');await expect(page.locator('[data-detail-class-id]')).toHaveCount(0);await expect(page.locator('[data-class-id]')).toHaveCount(2);
 await page.goto('/#/sports/yoga/classes/unknown');await expect(page.locator('[data-detail-class-id]')).toHaveCount(0);await expect(page.locator('[data-class-id]')).toHaveCount(2);await expect(page.locator('[data-class-id="yoga-replacement"]')).toContainText(content.ui.imageUnavailable);await expect(page.locator('[data-class-id="yoga-replacement"] img')).toHaveCount(0);await page.goto('/#/sports/yoga/classes/yoga-replacement');await expect(page.locator('[data-detail-class-id="yoga-replacement"]')).toContainText(content.ui.imageUnavailable);await expect(page.locator('.sport-hero img')).toHaveCount(0);await page.goto('/#/sports/unknown');await expect(page.getByRole('heading',{level:1})).toBeVisible();expect(await raw(page)).toBe(bytes);
 console.log('reorder/retirement snapshot bytes unchanged',bytes,'unknown/wrong-sport no arbitrary detail');
});
for(const width of [360,1280])test(`one-person class intention visual and keyboard ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/');await choose(page);const nav=page.getByRole('navigation',{name:'Principal'});await nav.getByRole('link',{name:content.ui.classes,exact:true}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('heading',{level:1})).toBeFocused();
 await page.locator('[data-class-id="cal-free"]').getByRole('link',{name:content.ui.viewClass}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('heading',{level:1})).toBeFocused();await page.getByRole('button',{name:content.ui.interest,exact:true}).focus();await page.keyboard.press('Enter');await page.getByRole('button',{name:content.ui.intention,exact:true}).focus();await page.keyboard.press('Enter');
 await page.screenshot({path:`${evidence}/t004-${width}-detail.png`,fullPage:true});await nav.getByRole('link',{name:content.ui.home,exact:true}).click();await page.screenshot({path:`${evidence}/t004-${width}-home.png`,fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);console.log('class nav/detail/back/interest/intention keyboard, heading focus and no overflow',width);
});

test('ordered practice review explicit ordered acceptance, previous/next review and final double activation store one UUID only',async({page})=>{
 await page.setViewportSize({width:360,height:900});await page.goto('/');await choose(page);await page.goto('/#/sports/calisthenics/solo/cal-first');await page.getByRole('button',{name:content.ui.start,exact:true}).click();
 const plan=content.plans.find(p=>p.id==='cal-first')!;const uuid=await page.locator('[data-attempt-id]').getAttribute('data-attempt-id');expect(uuid).toMatch(/^[0-9a-f-]{36}$/);
 const before=await raw(page);await expect(page.getByRole('button',{name:content.ui.reviewNext,exact:true})).toBeDisabled();
 for(const [index,step]of plan.steps.entries()){
  const exercise=content.exercises.find(e=>e.id===step.exerciseId)!;const image=content.images.find(i=>i.id===exercise.imageId)!;await expect(page.getByRole('heading',{level:1})).toHaveText(exercise.title);await expect(page.getByRole('heading',{level:1})).toBeFocused();await expect(page.locator('main')).toContainText(exercise.quantity);await expect(page.locator('main')).toContainText(exercise.technique);await expect(page.locator('.exercise-photo img')).toHaveAttribute('src',image.path!);await expect(page.locator('.exercise-photo img')).toHaveAttribute('alt',image.alt);
  await expect(page.locator('[data-attempt-id]')).toHaveAttribute('data-accepted-count',String(index));
  if(index===1){await page.getByRole('button',{name:content.ui.previous,exact:true}).focus();await page.keyboard.press('Enter');await expect(page.locator('[data-attempt-id]')).toHaveAttribute('data-view-index','0');await expect(page.locator('[data-attempt-id]')).toHaveAttribute('data-accepted-count','1');await expect(page.getByRole('button',{name:content.ui.completeStep,exact:true})).toBeDisabled();expect(await raw(page)).toBe(before);await page.getByRole('button',{name:content.ui.reviewNext,exact:true}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('heading',{level:1})).toBeFocused();await expect(page.getByRole('button',{name:content.ui.reviewNext,exact:true})).toBeDisabled();}
  await page.screenshot({path:`${evidence}/t005-practice-${index}.png`,fullPage:true});
  const button=page.getByRole('button',{name:content.ui.completeStep,exact:true});if(index===plan.steps.length-1)await button.evaluate((b:HTMLButtonElement)=>{b.click();b.click();});else await button.click();console.log('ordered explicit',uuid,index,step.id,exercise.id,image.path);
 }
 await expect(page.locator('[data-completed-attempt-id]')).toHaveAttribute('data-completed-attempt-id',uuid!);const successURL=page.url();const completed=JSON.parse((await raw(page))!);expect(Object.keys(completed.journey)).toEqual([JSON.stringify(['actual','completion',uuid])]);expect(Object.values(completed.journey)[0]).toMatchObject({attemptId:uuid,completedStepIds:plan.steps.map(s=>s.id),origin:'user-simulated'});
 await page.goBack();await expect(page.locator('[data-attempt-id]')).toHaveCount(0);await page.goto(successURL);await page.reload();await expect(page.locator('[data-completed-attempt-id]')).toHaveAttribute('data-completed-attempt-id',uuid!);expect(JSON.parse((await raw(page))!).journey).toEqual(completed.journey);
 await page.goto(`/#/session/${uuid}`);await expect(page.locator('[data-attempt-id]')).toHaveCount(0);await page.goto('/#/profile');await expect(page.locator('[data-stat="sessions"]')).toHaveText('1');await expect(page.locator('[data-stat="points"]')).toHaveText('10');
 await page.goto('/#/sports/calisthenics/solo/cal-first');await page.getByRole('button',{name:content.ui.start,exact:true}).click();const second=await page.locator('[data-attempt-id]').getAttribute('data-attempt-id');expect(second).not.toBe(uuid);await page.getByRole('button',{name:content.ui.completeStep,exact:true}).click();await page.reload();await expect(page.locator('[data-attempt-id]')).toHaveCount(0);expect(JSON.parse((await raw(page))!).journey).toEqual(completed.journey);
 await page.goto('/#/success/forged');await expect(page.locator('[data-completed-attempt-id]')).toHaveCount(0);console.log('completed once',uuid,'new partial abandoned',second,'bytes',JSON.stringify(completed));
});
for(const canSwim of [false,true])for(const safePool of [false,true])test(`swimming safety ability=${canSwim} pool=${safePool} start and transient clearing`,async({page})=>{
 await page.goto('/');await choose(page);await page.goto('/#/sports/swimming/solo/swim-dry-first');await expect(page.locator('[data-plan-id]')).toHaveAttribute('data-plan-id','swim-dry-first');await expect(page.locator('main')).toContainText(content.ui.swimRedirect);
 await page.getByRole('checkbox',{name:content.ui.canSwim,exact:true}).setChecked(canSwim);await page.getByRole('checkbox',{name:content.ui.safePool,exact:true}).setChecked(safePool);const water=page.getByRole('button',{name:content.ui.startWater,exact:true});
 if(canSwim&&safePool){await expect(water).toBeEnabled();await water.focus();await page.keyboard.press('Enter');await expect(page.locator('.medium-label')).toHaveText(content.ui.water);await expect(page.getByRole('heading',{level:1})).toBeFocused();await page.getByRole('link',{name:content.ui.back,exact:true}).click();await page.goto('/#/sports/swimming/solo/swim-dry-first');await expect(page.getByRole('checkbox',{checked:true})).toHaveCount(0);}
 else await expect(water).toBeDisabled();
 await page.getByRole('button',{name:content.ui.start,exact:true}).click();await expect(page.locator('.medium-label')).toHaveText(content.ui.dryLand);await page.reload();await expect(page.locator('[data-attempt-id]')).toHaveCount(0);await page.goto('/#/sports/swimming/solo/swim-dry-first');await expect(page.getByRole('checkbox',{checked:true})).toHaveCount(0);
 await page.locator('main').getByRole('link',{name:content.ui.classes,exact:true}).click();await expect(page.locator('[data-class-id]')).toHaveCount(2);expect(JSON.parse((await raw(page))!).journey).toEqual({});console.log('water actual start boundary',canSwim,safePool,'allowed',canSwim&&safePool,'dry/instructor routes accessible, leave/reload cleared');
});
test('swimming safety reset and demo-key storage event discard both transient affirmations',async({page})=>{
 await page.goto('/');await choose(page);await page.goto('/#/sports/swimming/solo/swim-dry-first');for(const box of await page.getByRole('checkbox').all())await box.check();
 await page.evaluate(k=>window.dispatchEvent(new StorageEvent('storage',{key:k})),key);await page.goto('/#/sports/swimming/solo/swim-dry-first');await expect(page.getByRole('checkbox',{checked:true})).toHaveCount(0);
 for(const box of await page.getByRole('checkbox').all())await box.check();await page.getByRole('link',{name:content.ui.profileAccessibleName}).click();page.once('dialog',d=>d.accept());await page.getByRole('button',{name:content.ui.reset,exact:true}).click();await choose(page);await page.goto('/#/sports/swimming/solo/swim-dry-first');await expect(page.getByRole('checkbox',{checked:true})).toHaveCount(0);expect(JSON.parse((await raw(page))!).journey).toEqual({});
});
test('ordered practice review matching JPEG delivery for all configured snapshots and no remote runtime requests',async({page,request})=>{
 test.setTimeout(60000);const remote:string[]=[];page.on('request',r=>{if(r.resourceType()==='image'&&!r.url().startsWith('http://127.0.0.1:4173/'))remote.push(r.url());});
 const observations:any[]=[];const paths=[...new Set(content.images.map(i=>i.path!))];
 for(const path of paths){const response=await request.get(path);expect(response.status()).toBe(200);expect(response.headers()['content-type']).toContain('image/jpeg');const body=await response.body(),local=readFileSync('public'+path);expect(body.equals(local)).toBe(true);expect(body.subarray(0,3).toString('hex')).toBe('ffd8ff');observations.push({path,status:response.status(),mime:response.headers()['content-type'],byteLength:body.length,sha256:createHash('sha256').update(body).digest('hex'),magicHex:body.subarray(0,12).toString('hex')});}
 await page.goto('/');await choose(page);const captured=new Set<string>();
 for(const profile of content.profiles){if(profile.id!=='first'){await page.goto('/#/profile');await page.getByRole('button',{name:content.ui.editSituation}).click();await choose(page,profile.id);}
  for(const plan of content.plans.filter(p=>p.profileId===profile.id)){
   const dry=content.plans.find(p=>p.profileId===profile.id&&p.sportId===plan.sportId&&p.medium==='dry-land')!;await page.goto(`/#/sports/${plan.sportId}/solo/${dry.id}`);
   if(plan.medium==='water'){for(const box of await page.getByRole('checkbox').all())await box.check();await page.getByRole('button',{name:content.ui.startWater,exact:true}).click();}else await page.getByRole('button',{name:content.ui.start,exact:true}).click();
   for(const step of plan.steps){const e=content.exercises.find(e=>e.id===step.exerciseId)!;const i=content.images.find(i=>i.id===e.imageId)!;await expect(page.getByRole('heading',{level:1})).toHaveText(e.title);await expect(page.locator('main')).toContainText(e.quantity);await expect(page.locator('main')).toContainText(e.technique);const img=page.locator('.exercise-photo img');await expect(img).toHaveAttribute('src',i.path!);await expect(img).toHaveAttribute('alt',i.alt);const decoded=await img.evaluate(async(img:HTMLImageElement)=>{await img.decode();return{width:img.naturalWidth,height:img.naturalHeight};});expect(decoded.width).toBeGreaterThan(0);expect(decoded.height).toBeGreaterThan(0);
    const record=observations.find(o=>o.path===i.path);record.decodeStatus='pass';record.dimensions=decoded;record.exerciseIds??=[];record.exerciseIds.push(e.id);
    if(!captured.has(i.path!)){const name=i.path!.split('/').at(-1)!.replace('.jpg','');await page.screenshot({path:`${evidence}/t005-mapping-${name}.png`,fullPage:true});record.renderedScreenshot=`${evidence}/t005-mapping-${name}.png`;captured.add(i.path!);}
    await page.getByRole('button',{name:content.ui.completeStep,exact:true}).click();
   }
  }
 }
 expect(remote).toEqual([]);expect(observations.every(o=>o.decodeStatus==='pass')).toBe(true);writeFileSync(`${evidence}/t005-photo-http.json`,JSON.stringify(observations,null,2));console.log('every mapping decoded/rendered + local HTTP exact bytes',JSON.stringify(observations),'remote images',remote);
});
test('ordered practice review failed local photo remains honestly unavailable with instructions and no fallback',async({page})=>{
 await page.route('**/assets/photos/cali_warmup.jpg',r=>r.abort());await page.goto('/');await choose(page);await page.goto('/#/sports/calisthenics/solo/cal-first');await page.getByRole('button',{name:content.ui.start,exact:true}).click();await expect(page.getByRole('status')).toHaveText(content.ui.imageUnavailable);await expect(page.locator('main')).toContainText(content.exercises.find(e=>e.id==='cal-first-shoulders')!.technique);await expect(page.locator('.exercise-photo img')).toHaveCount(0);
});

async function previewExitEvidence(page:Page,id:string,width:number) {
 mkdirSync('/tmp/ba-refresh-t004',{recursive:true});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`/tmp/ba-refresh-t004/${width}-${id}.png`,fullPage:true});
 const exit=page.getByRole('button',{name:content.ui.exitPreview,exact:true});
 if(await page.locator('[data-notice-id]').count())await expect(page.locator('[data-preview-badge]')).toHaveCount(0);
 else await expect(page.locator('[data-preview-badge]')).toBeVisible();
 expect(await page.locator('main').evaluate(m=>m.lastElementChild?.hasAttribute('data-preview-exit'))).toBe(true);
 const preceding=page.locator('[data-preview-content] a[href], [data-preview-content] button:not(:disabled), [data-preview-content] input:not(:disabled), [data-preview-content] select:not(:disabled)');
 if(await preceding.count())await preceding.last().focus();else await page.locator('main h1').focus();
 await page.keyboard.press('Tab');await expect(exit).toBeFocused();await exit.evaluate(el=>el.scrollIntoView({block:'center'}));
 const measurement=await exit.evaluate(el=>{const r=el.getBoundingClientRect();const tabs=document.querySelector('.bottom-tabs')?.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,viewport:innerHeight,tabTop:tabs?.top??innerHeight,outline:getComputedStyle(el).outlineStyle,position:getComputedStyle(el).position,overflow:document.documentElement.scrollWidth>innerWidth};});
 expect(measurement.height).toBeGreaterThanOrEqual(44);expect(measurement.bottom+4).toBeLessThanOrEqual(measurement.tabTop);expect(measurement.top).toBeGreaterThanOrEqual(0);expect(measurement.outline).not.toBe('none');expect(measurement.position).toBe('static');expect(measurement.overflow).toBe(false);
 console.log('preview bottom focus',id,width,measurement);
 await page.screenshot({path:`/tmp/ba-batch3/t006-${width}-${id}.png`,fullPage:true});
 await page.screenshot({path:`/tmp/ba-batch3/focus-${width}-${id}.png`});
}
for(const width of [360,1280])test(`ephemeral same-person scenarios ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});
 const actual=normalizeLegacy(legacy());actual.preference={situationId:'first',confirmed:true};actual.intention={classId:'yoga-free',sportId:'yoga',classSnapshot:content.classes.find(c=>c.id==='yoga-free')!,chosenAt:'2026-10-14T15:00:00.000Z',origin:'simulated-intention'};
 const bytes=JSON.stringify(actual);await page.addInitScript(({key,bytes})=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem(key,bytes);sessionStorage.setItem('seeded','yes');}},{key,bytes});await page.goto('/');
 for(const scenario of content.previewScenarios){
  await page.getByRole('link',{name:content.ui.profileAccessibleName}).click();await page.getByRole('button',{name:scenario.title,exact:true}).click();
  await expect(page.locator('[data-preview-scenario]')).toHaveAttribute('data-preview-scenario',scenario.id);await expect(page.locator('[data-intended-class-id]')).toHaveCount(0);
  if(scenario.kind==='notice'){await expect(page.locator('[data-notice-id]')).toHaveAttribute('data-notice-id',scenario.id);await expect(page.locator('.notice-photo .notice-card')).toHaveAttribute('aria-label',scenario.activationLabel!);await expect(page.locator('.notice-card')).toContainText(scenario.notice!);await expect(page.locator('main')).toContainText(scenario.notice!);await expect(page.getByRole('navigation',{name:'Principal'})).toHaveCount(0);}
  else {await expect(page.locator('main')).toContainText(scenario.guidance);await expect(page.locator('[data-stat="sessions"]')).toHaveText(String(scenario.history.length));}
  await previewExitEvidence(page,scenario.id,width);await page.keyboard.press('Enter');await expect(page.locator('[data-intended-class-id]')).toHaveAttribute('data-intended-class-id','yoga-free');expect(await raw(page)).toBe(bytes);
 }
 const scenario=content.previewScenarios.find(s=>s.kind==='journey')!;
 for(const hash of ['#/home','#/sports','#/sports/yoga','#/classes','#/classes/yoga','#/sports/yoga/classes','#/sports/yoga/classes/yoga-free',`#/sports/yoga/solo/${content.plans.find(p=>p.profileId===scenario.recommendationSituationId&&p.sportId==='yoga'&&p.medium==='dry-land')!.id}`,'#/profile','#/profile/journey','#/profile/challenges','#/session/forged','#/success/forged']){
  await page.getByRole('link',{name:content.ui.profileAccessibleName}).click();await page.getByRole('button',{name:scenario.title,exact:true}).click();await page.evaluate(h=>location.hash=h,hash);await page.waitForTimeout(60);
  for(const label of [content.ui.editSituation,content.ui.reset,content.ui.interest,content.ui.intention,content.ui.start])for(const button of await page.getByRole('button',{name:label,exact:true}).all())await expect(button).toBeDisabled();
  if(hash==='#/profile/journey')await expect(page.locator('[data-stat="sessions"]')).toHaveText(String(scenario.history.length));
  if(hash==='#/profile/challenges')await expect(page.locator('[data-stat="points"]')).toHaveText(String(scenario.history.length*content.rules.pointsPerCompletion));
  await previewExitEvidence(page,hash.replace(/[^a-z]/g,''),width);await page.keyboard.press('Enter');expect(await raw(page)).toBe(bytes);await expect(page.locator('[data-intended-class-id]')).toBeVisible();
 }
 await page.getByRole('link',{name:content.ui.profileAccessibleName}).click();await page.getByRole('button',{name:scenario.title,exact:true}).click();await page.goBack();await page.goForward();await expect(page.locator('[data-preview-badge]')).toBeVisible();expect(await raw(page)).toBe(bytes);await page.reload();await expect(page.locator('[data-preview-badge]')).toHaveCount(0);
 await page.getByRole('link',{name:content.ui.profileAccessibleName}).click();await page.getByRole('button',{name:scenario.title,exact:true}).click();await page.evaluate(key=>dispatchEvent(new StorageEvent('storage',{key})),key);await expect(page.locator('[data-preview-badge]')).toHaveCount(0);await expect(page.locator('[data-intended-class-id]')).toBeVisible();
 await page.getByRole('link',{name:content.ui.profileAccessibleName}).click();await expect(page.locator('[data-stat="sessions"]')).toHaveText('6');await expect(page.locator('[data-stat="points"]')).toHaveText('60');console.log('T006 exact actual bytes restored',bytes,'6 sessions / 60 points; intention yoga-free; scenario IDs',content.previewScenarios.map(s=>s.id));
});
for(const width of [360,1280])test(`scripted support alternatives ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});const requests:string[]=[];page.on('request',r=>requests.push(r.url()));await page.goto('/');await choose(page);
 await page.evaluate(h=>location.hash=h,'#/sports/yoga/classes/yoga-free');await page.getByRole('button',{name:content.ui.intention,exact:true}).click();const bytes=await raw(page);
 for(const chat of content.chats){const scenario=content.previewScenarios.find(s=>s.id===chat.scenarioId)!;
  for(const answer of chat.answers){
   await page.getByRole('link',{name:content.ui.profileAccessibleName}).click();await page.getByRole('button',{name:scenario.title,exact:true}).click();await expect(page).toHaveURL(new RegExp('#/notice/'+scenario.id+'$'));await previewExitEvidence(page,`notice-${chat.id}`,width);
   await page.getByRole('button',{name:scenario.activationLabel!,exact:true}).focus();await page.keyboard.press('Enter');await expect(page.locator('[data-chat-id]')).toHaveAttribute('data-chat-id',chat.id);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`/tmp/ba-refresh-t004/${width}-unanswered-${chat.id}.png`,fullPage:true});await expect(page.getByRole('heading',{level:1})).toBeFocused();await expect(page.getByRole('navigation',{name:'Principal'})).toHaveCount(0);await expect(page.locator('[data-answer-id]')).toHaveCount(chat.answers.length);
   for(const a of chat.answers)await expect(page.getByRole('button',{name:a.label,exact:true})).toBeVisible();await expect(page.locator('input,textarea')).toHaveCount(0);await expect(page.locator('main')).toContainText(content.ui.scriptedDisclosure);await expect(page.locator('main')).not.toContainText(content.ui.futureAI);
   await page.getByRole('button',{name:answer.label,exact:true}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('status')).toContainText(answer.response);await previewExitEvidence(page,`chat-${chat.id}-${answer.id}`,width);
   const destination=content.destinations.find(d=>d.id===answer.destinationId)!;const link=page.locator(`[data-destination-id="${destination.id}"]`);await link.focus();await page.keyboard.press('Enter');await expect(page.locator('[data-chat-id]')).toHaveCount(0);await expect(page.locator('[data-intended-class-id]')).toHaveCount(0);
   if(destination.kind==='class')await expect(page.locator('[data-detail-class-id]')).toHaveAttribute('data-detail-class-id',destination.classId);else if(destination.kind==='plan')await expect(page.locator('[data-plan-id]')).toHaveAttribute('data-plan-id',destination.planId);else await expect(page.locator('main')).toHaveAttribute('data-sport-id',destination.sportId);
   for(const label of [content.ui.interest,content.ui.intention,content.ui.start])for(const button of await page.getByRole('button',{name:label,exact:true}).all())await expect(button).toBeDisabled();
   expect(await raw(page)).toBe(bytes);await previewExitEvidence(page,`result-${chat.id}-${answer.id}`,width);await page.keyboard.press('Enter');await expect(page.locator('[data-intended-class-id]')).toHaveAttribute('data-intended-class-id','yoga-free');expect(await raw(page)).toBe(bytes);
   console.log('T007 exact route',scenario.id,chat.id,answer.id,answer.label,answer.response,JSON.stringify(destination),'before/after bytes',bytes);
  }
  await page.getByRole('link',{name:content.ui.profileAccessibleName}).click();await page.getByRole('button',{name:scenario.title,exact:true}).click();await page.getByRole('button',{name:scenario.activationLabel!,exact:true}).click();await page.getByRole('button',{name:chat.answers[0].label,exact:true}).click();await page.getByRole('link',{name:content.ui.back,exact:true}).click();await page.getByRole('button',{name:scenario.activationLabel!,exact:true}).click();await expect(page.getByRole('status')).toHaveCount(0);await page.getByRole('button',{name:chat.answers[0].label,exact:true}).click();await page.evaluate(key=>dispatchEvent(new StorageEvent('storage',{key})),key);await expect(page.locator('[data-preview-badge],[data-chat-id]')).toHaveCount(0);expect(await raw(page)).toBe(bytes);await page.getByRole('link',{name:content.ui.profileAccessibleName}).click();await page.getByRole('button',{name:scenario.title,exact:true}).click();await page.getByRole('button',{name:scenario.activationLabel!,exact:true}).click();await page.getByRole('button',{name:chat.answers[0].label,exact:true}).click();await page.reload();await expect(page.locator('[data-preview-badge]')).toHaveCount(0);await expect(page.getByRole('status')).toHaveCount(0);expect(await raw(page)).toBe(bytes);
 }
 for(const hash of ['#/notice/inactive','#/notice/missed-class','#/chat/inactive-chat','#/chat/missed-class-chat']){await page.goto('/'+hash);await expect(page.locator('[data-preview-badge],[data-notice-id],[data-chat-id]')).toHaveCount(0);expect(await raw(page)).toBe(bytes);}
 expect(requests.filter(url=>new URL(url).origin!=='http://127.0.0.1:4173')).toEqual([]);console.log('T004/V1 forged hashes rejected; T007 only local requests; no provider/push',requests);
});

test('served profile content recovery serial actual dist edits, retry and local photo boundary',async({page})=>{
 test.setTimeout(90000);
 const file='dist/config/app-content.json',original=readFileSync(file);const photo='dist/assets/photos/cali_warmup.jpg',photoBytes=readFileSync(photo);let moved=false;
 await (await page.context().newCDPSession(page)).send('Network.setCacheDisabled',{cacheDisabled:true});
 await page.addInitScript(()=>{const originalFetch=window.fetch; (window as any).__configFetches=[];window.fetch=(input,init)=>{if(String(input)==='/config/app-content.json')(window as any).__configFetches.push({url:String(input),cache:init?.cache});return originalFetch(input,init);};});
 const requests:{url:string;cache:string|undefined}[]=[];page.on('request',r=>requests.push({url:r.url(),cache:r.headers()['cache-control']}));
 const modified=structuredClone(content);modified.branding.tagline='Un recorrido editorial para moverte a tu ritmo.';modified.onboarding.startLabel='Comenzar mi recorrido';modified.onboarding.title='Contanos sobre vos para personalizar';modified.onboarding.instructions='Elegí tu situación para esta prueba editorial.';modified.onboarding.editInstructions='Personalizá las recomendaciones sin cambiar tu historia editorial.';modified.ui.durationOption='{minutes} minutos estimados';modified.onboarding.editTitle='Editar mi situación de ejemplo';modified.profiles[0].hero='Un paso editorial a tu ritmo';
 const scenario=modified.previewScenarios.find(s=>s.id==='inactive')!;scenario.notice='Aviso editorial simulado para volver sin presión.';scenario.guidance='Podés retomar con una alternativa editorial segura.';
 const chat=modified.chats.find(c=>c.id==='inactive-chat')!;chat.introduction='Elegí una alternativa editorial predefinida.';const answer=chat.answers.find(a=>a.id==='short-solo')!;answer.response='Una pausa breve también cuenta como cuidado editorial.';
 const destination=modified.destinations.find(d=>d.id===answer.destinationId)!;Object.assign(destination,{sportId:'yoga',planId:'yoga-returning',label:'Explorar este plan editorial'});
 const exercise=modified.exercises.find(e=>e.id==='cal-first-shoulders')!;const assignment=structuredClone(modified.images.find(i=>i.id===exercise.imageId)!);assignment.id='editorial-exact-photo';assignment.alt='Mujer de pie estirando un hombro con el brazo cruzado frente al pecho, al aire libre.';modified.images.push(assignment);exercise.imageId=assignment.id;
 async function reloadResponse(){const response=page.waitForResponse(r=>r.url().endsWith('/config/app-content.json'));await page.reload();return response;}
 async function practice(){await page.goto('/');await expect(page.locator('.hero')).toContainText(modified.profiles[0].hero);await page.goto('/#/sports/calisthenics/solo/cal-first');await expect(page.locator('[data-plan-id]')).toHaveAttribute('data-plan-id','cal-first');await page.getByRole('button',{name:content.ui.start,exact:true}).click();await expect(page.getByRole('heading',{level:1})).toHaveText(exercise.title);await expect(page.locator('main')).toContainText(exercise.technique);}
 try{
  writeFileSync(file,JSON.stringify(modified));const responsePromise=page.waitForResponse(r=>r.url().endsWith('/config/app-content.json'));await page.goto('/');const response=await responsePromise;expect(response.status()).toBe(200);expect(response.headers()['cache-control']).toBe('no-store');await expect(page.locator('main')).toContainText(modified.branding.tagline);await page.getByRole('button',{name:modified.onboarding.startLabel,exact:true}).click();await expect(page.getByRole('heading',{level:1})).toHaveText(modified.onboarding.title);await expect(page.getByRole('group',{name:modified.onboarding.instructions})).toBeVisible();await expect(page.locator('main')).toContainText(modified.onboarding.instructions);await choose(page);await expect(page.locator('.hero')).toContainText(modified.profiles[0].hero);
  await page.getByRole('link',{name:content.ui.profileAccessibleName}).click();await page.getByRole('button',{name:content.ui.editSituation}).click();await expect(page.getByRole('heading',{level:1})).toHaveText(modified.onboarding.editTitle);await expect(page.getByRole('group',{name:modified.onboarding.editInstructions})).toBeVisible();await page.getByRole('button',{name:content.ui.cancel,exact:true}).click();
  await page.getByRole('button',{name:scenario.title,exact:true}).click();await expect(page.locator('main')).toContainText(scenario.notice!);await expect(page.locator('main')).toContainText(scenario.guidance);await page.getByRole('button',{name:scenario.activationLabel!,exact:true}).click();await expect(page.locator('main')).toContainText(chat.introduction);await page.getByRole('button',{name:answer.label,exact:true}).click();await expect(page.getByRole('status')).toContainText(answer.response);await page.getByRole('link',{name:destination.label,exact:true}).click();await expect(page.locator('[data-plan-id]')).toHaveAttribute('data-plan-id','yoga-returning');await expect(page.getByRole('combobox',{name:modified.ui.duration,exact:true}).locator('option')).toHaveText(['15 minutos estimados','30 minutos estimados']);await page.getByRole('button',{name:content.ui.exitPreview,exact:true}).click();
  await practice();const img=page.locator('.exercise-photo img');await expect(img).toHaveAttribute('src',assignment.path!);await expect(img).toHaveAttribute('alt',assignment.alt);await img.evaluate((i:HTMLImageElement)=>i.decode());const served=await page.evaluate(async path=>{const r=await fetch(path);return {status:r.status,mime:r.headers.get('content-type'),bytes:Array.from(new Uint8Array(await r.arrayBuffer()))};},assignment.path!);expect(served.status).toBe(200);expect(served.mime).toContain('image/jpeg');expect(Buffer.from(served.bytes).equals(photoBytes)).toBe(true);
  console.log('T005/V3 T002/V2 served welcome/selection/edit copy and changed duration option formatter rendered; T008 served edited IDs/render',scenario.id,chat.id,answer.id,JSON.stringify(destination),exercise.id,assignment.id,assignment.path,'HTTP',response.status(),response.headers(),'JPEG hash',createHash('sha256').update(photoBytes).digest('hex'));
  for(const variant of ['missing','malformed','reference-invalid','unsafe-path','duration-invalid']){
   if(variant==='missing'){renameSync(file,file+'.held');moved=true;}else if(variant==='malformed')writeFileSync(file,'{invalid-json');else {const invalid=structuredClone(modified);if(variant==='reference-invalid')invalid.chats[0].answers[0].destinationId='retired-destination';else if(variant==='duration-invalid')invalid.plans[0].durationOptions=[15,15];else invalid.images.find(i=>i.id===assignment.id)!.path='https://example.com/not-allowed.jpg';writeFileSync(file,JSON.stringify(invalid));}
   const failed=await reloadResponse();await expect(page.getByRole('heading',{level:1})).toHaveText('No pudimos cargar el contenido.');await expect(page.getByRole('alert')).toContainText('Revisá la configuración');await expect(page.locator('[data-plan-id],[data-chat-id],.bottom-tabs')).toHaveCount(0);
   if(variant==='missing'){expect(failed.status()).toBe(404);renameSync(file+'.held',file);moved=false;}else expect(failed.status()).toBe(200);
   await page.screenshot({path:`/tmp/ba-batch3/t008-error-${variant}.png`});
   console.log('T008 blocking',variant,'HTTP',failed.status(),'Spanish error',await page.getByRole('alert').innerText());writeFileSync(file,JSON.stringify(modified));const retryResponse=page.waitForResponse(r=>r.url().endsWith('/config/app-content.json'));await page.getByRole('button',{name:'Intentar de nuevo',exact:true}).click();expect((await retryResponse).status()).toBe(200);await expect(page.locator('.hero')).toContainText(modified.profiles[0].hero);
  }
  const unavailable=structuredClone(modified);unavailable.images.push({id:'pending-exact',path:null,alt:'Imagen del ejercicio no disponible',subject:{kind:'exercise',id:exercise.id},sourceUrl:null,attribution:'Sin atribución verificada',provenance:'Imagen pendiente de revisión',licenseStatus:'unverified',evidence:null});Object.assign(unavailable.exercises.find(e=>e.id===exercise.id)!,{imageId:'pending-exact',imageStatus:'unavailable'});writeFileSync(file,JSON.stringify(unavailable));await page.reload();await practice();await expect(page.getByRole('status')).toHaveText(content.ui.imageUnavailable);await expect(page.locator('.exercise-photo img')).toHaveCount(0);
  // Pass through actual HTTP while disabling the browser image cache for the missing-byte check.
  await page.route('**/assets/photos/**',route=>route.continue());
  writeFileSync(file,JSON.stringify(modified));renameSync(photo,photo+'.held');await page.reload();const missingPhoto=page.waitForResponse(r=>r.url().endsWith(assignment.path!));await practice();expect((await missingPhoto).status()).toBe(404);await expect(page.getByRole('status')).toHaveText(content.ui.imageUnavailable);await expect(page.locator('.exercise-photo img')).toHaveCount(0);renameSync(photo+'.held',photo);
  expect(requests.filter(r=>new URL(r.url).origin!=='http://127.0.0.1:4173')).toEqual([]);const configRequests=requests.filter(r=>r.url.endsWith('/config/app-content.json'));expect(configRequests.length).toBeGreaterThan(5);const fetches=await page.evaluate(()=>(window as any).__configFetches);expect(fetches.length).toBeGreaterThan(0);expect(fetches.every((r:{cache:string})=>r.cache==='no-store')).toBe(true);console.log('T008 no-store fetch options',fetches,'browser requests',configRequests,'pending/missing image unavailable preserves exact instructions; no remote fallback; prior T005 correspondence consumed');
 }finally{
  if(moved)renameSync(file+'.held',file);writeFileSync(file,original);try{renameSync(photo+'.held',photo);}catch{/* Already restored. */}expect(readFileSync(file).equals(original)).toBe(true);expect(readFileSync(photo).equals(photoBytes)).toBe(true);console.log('T008 finally exact served bytes restored',createHash('sha256').update(original).digest('hex'));
 }
});

for(const width of [360,1280])test(`profile presentation convergence keyboard reduced motion ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await choose(page);
 const scenario=content.previewScenarios.find(s=>s.id==='inactive')!;await page.getByRole('link',{name:content.ui.profileAccessibleName}).click();await page.getByRole('button',{name:scenario.title,exact:true}).click();
 for(const surface of ['notice','chat']){
  await expect(page.getByRole('heading',{level:1})).toBeFocused();await page.getByRole('button',{name:content.ui.skipToContent}).focus();await page.keyboard.press('Enter');await expect(page.locator('main')).toBeFocused();
  await previewExitEvidence(page,`convergence-${surface}`,width);
  for(const b of await page.locator('button:not(.skip-link),a').all()){if(await b.isVisible()){const box=await b.boundingBox();expect(box!.height).toBeGreaterThanOrEqual(44);}}
  expect(await page.locator('.app').evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('0s');await expect(page.locator('footer')).toHaveCount(0);
  if(surface==='notice'){await page.getByRole('button',{name:scenario.activationLabel!,exact:true}).focus();await page.keyboard.press('Enter');}
 }
 await page.getByRole('button',{name:content.ui.exitPreview,exact:true}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('heading',{level:1})).toBeFocused();await page.goto('/#/sports/calisthenics/solo/cal-first');await page.getByRole('button',{name:content.ui.start,exact:true}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('heading',{level:1})).toBeFocused();
 const exercise=content.exercises.find(e=>e.id==='cal-first-shoulders')!,image=content.images.find(i=>i.id===exercise.imageId)!;await expect(page.locator('.exercise-photo img')).toHaveAttribute('alt',image.alt);await expect(page.locator('main')).toContainText(content.legal.illustrativeTraining);await expect(page.locator('footer')).toHaveCount(0);
 await page.getByRole('button',{name:content.ui.completeStep,exact:true}).focus();const measurement=await page.getByRole('button',{name:content.ui.completeStep,exact:true}).evaluate(el=>{const r=el.getBoundingClientRect();return {height:r.height,bottom:r.bottom,tabTop:document.querySelector('.bottom-tabs')!.getBoundingClientRect().top,outline:getComputedStyle(el).outlineStyle,width:document.documentElement.scrollWidth,viewport:innerWidth};});expect(measurement.height).toBeGreaterThanOrEqual(44);expect(measurement.bottom+4).toBeLessThan(measurement.tabTop);expect(measurement.outline).not.toBe('none');expect(measurement.width).toBeLessThanOrEqual(measurement.viewport);await page.screenshot({path:`/tmp/ba-batch3/t008-${width}-practice.png`,fullPage:true});await page.screenshot({path:`/tmp/ba-batch3/t008-${width}-practice-focus.png`});await page.keyboard.press('Enter');await expect(page.getByRole('heading',{level:1})).toBeFocused();console.log('T008 keyboard exercise focus, skip, disclosures, reduced motion',width,measurement);
});

test('ephemeral same-person scenarios genuine completed success stays isolated through legacy and canonical hashes',async({page})=>{
 await page.setViewportSize({width:360,height:900});await page.goto('/');await choose(page);await page.goto('/#/sports/calisthenics/solo/cal-first');await page.getByRole('button',{name:content.ui.start,exact:true}).click();
 const id=(await page.locator('[data-attempt-id]').getAttribute('data-attempt-id'))!;
 for(const step of content.plans.find(p=>p.id==='cal-first')!.steps){await expect(page.locator('[data-current-step-id]')).toHaveAttribute('data-current-step-id',step.id);await page.getByRole('button',{name:content.ui.completeStep,exact:true}).click();}
 await expect(page.locator('[data-completed-attempt-id]')).toHaveAttribute('data-completed-attempt-id',id);const canonical=new URL(page.url()).hash;const bytes=await raw(page);
 await page.getByRole('link',{name:content.ui.profileAccessibleName}).click();await page.getByRole('button',{name:'Entrenamiento sostenido',exact:true}).click();
 for(const hash of [`#/first/calisthenics/success/${id}`,canonical,`#/session/${id}`,`#/first/calisthenics/session/cal-first/${id}`]){
  await page.evaluate(h=>{location.hash=h;},hash);await expect(page).toHaveURL(/#\/home$/);await expect(page.locator('[data-completed-attempt-id],[data-attempt-id]')).toHaveCount(0);await expect(page.getByRole('heading',{name:content.ui.success,exact:true})).toHaveCount(0);await expect(page.locator('main')).toHaveAttribute('data-profile-id','regular');await expect(page.locator('[data-preview-scenario]')).toHaveAttribute('data-preview-scenario','sustained');expect(await raw(page)).toBe(bytes);
  await previewExitEvidence(page,'genuine-success-isolation',360);
 }
 await page.keyboard.press('Enter');await expect(page.locator('[data-preview-badge]')).toHaveCount(0);expect(await raw(page)).toBe(bytes);await page.goto('/'+canonical);await expect(page.locator('[data-completed-attempt-id]')).toHaveAttribute('data-completed-attempt-id',id);expect(await raw(page)).toBe(bytes);console.log('F1 genuine completion',id,'preview rejected legacy/canonical success/session, actual success restored; unchanged bytes',bytes);
});

test('one-person onboarding profile imported completion success keys retain colliding history and render a safe nonempty home',async({page})=>{
 const source=legacy();await page.addInitScript(({key,source})=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem(key,JSON.stringify(source));sessionStorage.setItem('seeded','yes');}},{key,source});await page.goto('/');await choose(page);const bytes=await raw(page);
 for(const profile of ['first','returning','regular']){
  const sourceKey=JSON.stringify(['legacy',profile,'completion','shared-attempt']);await page.evaluate(hash=>{location.hash=hash;},`#/success/${encodeURIComponent(sourceKey)}`);
  await expect(page).toHaveURL(/#\/home$/);await expect(page.getByRole('heading',{level:1})).toHaveText(content.profiles.find(p=>p.id==='first')!.welcome);await expect(page.locator('[data-completed-attempt-id]')).toHaveCount(0);expect(await raw(page)).toBe(bytes);console.log('F2 imported key safe nonempty home',sourceKey);
 }
 await page.getByRole('link',{name:content.ui.profileAccessibleName}).click();await expect(page.locator('[data-stat="sessions"]')).toHaveText('6');await expect(page.locator('[data-stat="points"]')).toHaveText('60');await page.getByRole('link',{name:content.ui.journey,exact:true}).click();await expect(page.locator('[data-history-id]')).toHaveCount(6);for(const profile of ['first','returning','regular'])await expect(page.locator('main')).toContainText(`Terminada ${profile}`);expect(await raw(page)).toBe(bytes);
 await page.goto('/#/sports/calisthenics/solo/cal-first');await page.getByRole('button',{name:content.ui.start,exact:true}).click();const id=(await page.locator('[data-attempt-id]').getAttribute('data-attempt-id'))!;for(const step of content.plans.find(p=>p.id==='cal-first')!.steps){await expect(page.locator('[data-current-step-id]')).toHaveAttribute('data-current-step-id',step.id);await page.getByRole('button',{name:content.ui.completeStep,exact:true}).click();}await expect(page.locator('[data-completed-attempt-id]')).toHaveAttribute('data-completed-attempt-id',id);await page.reload();await expect(page.locator('[data-completed-attempt-id]')).toHaveAttribute('data-completed-attempt-id',id);
 const after=JSON.parse((await raw(page))!);for(const [key,record] of Object.entries(JSON.parse(bytes!).journey))expect(after.journey[key]).toEqual(record);expect(Object.keys(after.journey)).toHaveLength(7);console.log('F2 preserved 6 imported records, actual completion render/reload',id,'original bytes',bytes);
});

import { mockupPhotos, sportPhotos, classPhotos, welcomePhoto } from '../src/content/mockupPhotos';
for(const width of [360,1280])test(`all mockup photo roles exact local delivery layout and preview ${width}`,async({page,request})=>{
 test.setTimeout(120000);const folder='/tmp/ba-all-photos';mkdirSync(folder,{recursive:true});await page.setViewportSize({width,height:900});
 const remote:string[]=[];page.on('request',r=>{if(r.resourceType()==='image'&&!r.url().startsWith('http://127.0.0.1:4173/'))remote.push(r.url());});
 async function photo(selector:string,src:string,alt:string){const img=page.locator(selector);await expect(img).toHaveAttribute('src',src);await expect(img).toHaveAttribute('alt',alt);const d=await img.evaluate(async(i:HTMLImageElement)=>{await i.decode();const b=i.getBoundingClientRect();return{width:i.naturalWidth,height:i.naturalHeight,w:b.width,h:b.height,fit:getComputedStyle(i).objectFit};});expect(d.width).toBeGreaterThan(0);expect(d.height).toBeGreaterThan(0);expect(d.w).toBeGreaterThan(40);expect(d.h).toBeGreaterThan(40);return d;}
 async function shot(name:string){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(await page.locator('.app').evaluate(e=>getComputedStyle(e).overflowY)).not.toBe('hidden');await page.screenshot({path:`${folder}/${width}-${name}.png`,fullPage:true});}
 await page.goto('/');await photo('.city-hero',welcomePhoto.src,welcomePhoto.alt);await shot('onboarding');await choose(page);
 for(const sport of content.sports)await photo(`[data-sport-card="${sport.id}"] img`,sportPhotos[sport.id].card.src,sportPhotos[sport.id].card.alt);await shot('home');
 await page.goto('/#/sports');for(const [n,sport] of content.sports.entries())await photo(`.sport-card:nth-child(${n+1}) img`,sportPhotos[sport.id].card.src,sportPhotos[sport.id].card.alt);await shot('sports');
 for(const sport of content.sports){
  await page.goto(`/#/sports/${sport.id}`);const geometry=await photo('.sport-hero img',sportPhotos[sport.id].hero.src,sportPhotos[sport.id].hero.alt);expect(geometry.fit).toBe('cover');expect(geometry.h).toBe(width===360?184:220);await shot(`${sport.id}-hero`);
  await page.goto(`/#/sports/${sport.id}/classes`);for(const item of content.classes.filter(c=>c.sportId===sport.id))await photo(`[data-class-id="${item.id}"] img`,classPhotos[item.id].src,classPhotos[item.id].alt);await shot(`${sport.id}-catalog`);
  for(const item of content.classes.filter(c=>c.sportId===sport.id)){await page.goto(`/#/sports/${sport.id}/classes/${item.id}`);await photo('.sport-hero img',classPhotos[item.id].src,classPhotos[item.id].alt);await shot(`${item.id}-detail`);}
 }
 const served:any[]=[];const manifest=JSON.parse(readFileSync('docs/mockup_ba_te_mueve/assets/image_manifest.json','utf8'));
 for(const [manifestKey,entry] of Object.entries(manifest) as [string,any][]){const path='/'+entry.local;const response=await request.get(path);const body=await response.body();expect(response.status()).toBe(200);expect(response.headers()['content-type']).toContain('image/jpeg');expect(body.equals(readFileSync('public'+path))).toBe(true);expect(body.subarray(0,3).toString('hex')).toBe('ffd8ff');const dimensions=await page.evaluate(async(src)=>{const img=new Image();img.src=src;await img.decode();return{width:img.naturalWidth,height:img.naturalHeight};},path);served.push({manifestKey,path,status:200,mime:'image/jpeg',byteLength:body.length,sha256:createHash('sha256').update(body).digest('hex'),dimensions});}
 for(const profile of content.profiles){if(profile.id!=='first'){await page.goto('/#/profile');await page.getByRole('button',{name:content.ui.editSituation}).click();await choose(page,profile.id);}
  for(const plan of content.plans.filter(p=>p.profileId===profile.id)){
   const dry=content.plans.find(p=>p.profileId===profile.id&&p.sportId===plan.sportId&&p.medium==='dry-land')!;await page.goto(`/#/sports/${plan.sportId}/solo/${dry.id}`);
   await photo('.sport-hero img',sportPhotos[plan.sportId].hero.src,sportPhotos[plan.sportId].hero.alt);
   for(const step of [...dry.steps,...(plan.medium==='water'?plan.steps:[])]){const exercise=content.exercises.find(e=>e.id===step.exerciseId)!;const image=content.images.find(i=>i.id===exercise.imageId)!;await photo(`[data-step-id="${step.id}"] .step-photo`,image.path!,image.alt);}
   if(plan.medium==='dry-land'){await shot(`${plan.id}-plan`);const last=page.getByRole('button',{name:content.ui.start,exact:true});await last.evaluate(e=>e.scrollIntoView({block:'center'}));expect((await last.boundingBox())!.y+(await last.boundingBox())!.height).toBeLessThan(836);}
   if(plan.medium==='water'){await shot(`${plan.id}-plan`);for(const box of await page.getByRole('checkbox').all())await box.check();await page.getByRole('button',{name:content.ui.startWater,exact:true}).click();}else await page.getByRole('button',{name:content.ui.start,exact:true}).click();
   for(const step of plan.steps){const e=content.exercises.find(e=>e.id===step.exerciseId)!;const image=content.images.find(i=>i.id===e.imageId)!;await photo('.exercise-photo img',image.path!,image.alt);await shot(`${e.id}-session`);await page.getByRole('button',{name:content.ui.completeStep,exact:true}).click();}
  }
 }
 const notice=content.previewScenarios.find(s=>s.kind==='notice')!;await page.goto('/#/profile');await page.getByRole('button',{name:notice.title,exact:true}).click();await photo('.notice-photo img',mockupPhotos.city_park.src,'');await shot('notice');await page.getByRole('button',{name:notice.activationLabel!,exact:true}).click();
 const chat=content.chats.find(c=>c.id===notice.chatId)!;
 for(const answer of chat.answers){await page.getByRole('button',{name:answer.label,exact:true}).click();const dest=content.destinations.find(d=>d.id===answer.destinationId)!;await page.locator(`[data-destination-id="${dest.id}"]`).click();const p=dest.kind==='class'?classPhotos[dest.classId]:sportPhotos[dest.sportId].hero;await photo('.sport-hero img',p.src,p.alt);await shot(`preview-${dest.id}`);await page.evaluate(h=>location.hash=h,`#/chat/${chat.id}`);await expect(page.locator('[data-chat-id]')).toBeVisible();}
 expect(remote).toEqual([]);writeFileSync(`${folder}/${width}-served.json`,JSON.stringify(served,null,2));console.log('All 29 bundled photos decoded and byte-identical HTTP; all dry plan thumbnails, 36 active steps, exact class/sport roles; no remote requests',width);
});

// T001: the document, not a device-sized child, owns scrolling.
async function shellCopy(page:Page) {
 const visible=await page.locator('body').innerText();
 const accessible=await page.locator('body').ariaSnapshot();
 for(const text of [visible,accessible]){
  expect(text).not.toMatch(/\b(?:demo|demostración)\b|inteligencia artificial/i);
  for(const paragraph of ['Antes de entrenar de verdad, estas propuestas requieren revisión','Propuesta conceptual, no es un servicio oficial','Prácticas ilustrativas: esta demo'])expect(text).not.toContain(paragraph);
 }
 await expect(page.locator('footer')).toHaveCount(0);
}
for(const width of [360,1280])test(`compact pinned shell geometry and contextual back ${width}`,async({page})=>{
 test.setTimeout(120000);mkdirSync('/tmp/ba-refresh-t001',{recursive:true});
 await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await choose(page);
 const visit=async(hash:string)=>{await page.evaluate(h=>location.hash=h,hash);await page.waitForTimeout(80);};
 const inspect=async(name:string)=>{
  await shellCopy(page);
  for(const benefit of await page.locator('[data-benefit-id]').all()){await expect(benefit.locator('img')).toHaveCount(1);await expect(benefit.locator('[data-benefit-limitation]')).toHaveCount(0);await expect(benefit.locator('progress')).toHaveCount(1);}
  if(await page.locator('[data-benefit-id]').count())await expect(page.locator('[data-benefit-limitation]')).toHaveText(content.legal.nonredeemable);
  const maximum=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
  const measurements=[];
  for(const fraction of [0,.5,1]){
   await page.evaluate(y=>window.scrollTo(0,y),Math.max(0,maximum)*fraction);
   const m=await page.locator('.app-header').evaluate(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,y:scrollY,height:r.height,viewport:innerHeight,width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,nested:[...document.querySelectorAll('.app,main,[data-preview-content]')].some(e=>['auto','scroll','hidden'].includes(getComputedStyle(e).overflowY)),motion:getComputedStyle(el).transitionDuration};});
   expect(m.top).toBeGreaterThanOrEqual(0);expect(m.bottom).toBeLessThan(m.viewport);expect(m.left).toBeGreaterThanOrEqual(0);expect(m.right).toBeLessThanOrEqual(width);expect(m.overflow).toBe(false);expect(m.nested).toBe(false);expect(m.motion).toBe('0s');
   if(maximum*fraction>m.height)expect(m.top).toBe(0);
   if(maximum>0&&fraction>0)expect(m.y).toBeGreaterThan(0);
   measurements.push(m);
  }
  await page.screenshot({path:`/tmp/ba-refresh-t001/${width}-${name}-bottom.png`});
  const back=page.locator('.breadcrumbs a');
  if(await back.count()){
   for(const position of ['initial','scrolled-focus']){
    await page.evaluate(p=>scrollTo(0,p==='initial'?0:document.documentElement.scrollHeight),position);
    await page.keyboard.press('Tab');await page.locator('h1').focus({preventScroll:true});await back.focus();
    const b=await back.evaluate(el=>{const r=el.getBoundingClientRect(),h=document.querySelector('.app-header')!.getBoundingClientRect(),s=getComputedStyle(el);const extra=parseFloat(s.outlineWidth)+parseFloat(s.outlineOffset);return {top:r.top,bottom:r.bottom,height:r.height,width:r.width,divider:h.bottom,outline:extra,style:s.outlineStyle,hits:[[r.left+2,(r.top+r.bottom)/2],[r.right-2,(r.top+r.bottom)/2],[(r.left+r.right)/2,(r.top+r.bottom)/2]].map(([x,y])=>el.contains(document.elementFromPoint(x,y))) };});
    expect(b.height).toBeGreaterThanOrEqual(44);expect(b.width).toBeGreaterThanOrEqual(44);expect(b.top-b.outline).toBeGreaterThan(b.divider);expect(b.style).not.toBe('none');expect(b.hits).toEqual([true,true,true]);console.log('T001/V3',width,name,position,b);
   }
   await page.screenshot({path:`/tmp/ba-refresh-t001/${width}-${name}-back-focus.png`});
  }
  await page.locator('h1').focus();await page.locator('h1').evaluate(el=>el.scrollIntoView({block:'start'}));
  const focus=await page.locator('h1').evaluate(el=>({top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom,header:document.querySelector('.app-header')!.getBoundingClientRect().bottom,tabs:document.querySelector('.bottom-tabs')?.getBoundingClientRect().top??innerHeight}));
  expect(focus.top).toBeGreaterThanOrEqual(focus.header);expect(focus.bottom).toBeLessThan(focus.tabs);
  await page.getByRole('button',{name:content.ui.skipToContent}).focus();await expect(page.getByRole('button',{name:content.ui.skipToContent})).toBeInViewport();await page.keyboard.press('Enter');await expect(page.locator('main')).toBeFocused();
  console.log('T001/V1,V2',width,name,{maximum,measurements,focus});
 };
 const routes=[['home','#/home'],['profile','#/profile'],['journey','#/profile/journey'],['challenges','#/profile/challenges'],['sports','#/sports'],['choice','#/sports/yoga'],['classes','#/classes'],['catalog','#/sports/yoga/classes'],['class','#/sports/yoga/classes/yoga-free'],['plan','#/sports/yoga/solo/yoga-first']] as const;
 for(const [name,hash] of routes){await visit(hash);await inspect(`actual-${name}`);const back=page.locator('.breadcrumbs a');if(await back.count()){const target=await back.getAttribute('href');await back.focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(new RegExp(target!.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$'));}}
 await visit('#/sports/calisthenics/solo/cal-first');await page.getByRole('button',{name:content.ui.start,exact:true}).click();await inspect('actual-practice');await expect(page.locator('main')).toContainText('No hagas ejercicios con dolor');
 await visit('#/sports/swimming/solo/swim-dry-first');await expect(page.getByRole('checkbox')).toHaveCount(2);await expect(page.getByRole('button',{name:content.ui.startWater})).toBeDisabled();await inspect('actual-water-safety');
 for(const scenario of content.previewScenarios){
  await visit('#/profile');await page.getByRole('button',{name:scenario.title,exact:true}).click();await inspect(`preview-${scenario.id}`);
  if(scenario.kind==='notice'){
   await page.getByRole('button',{name:scenario.activationLabel!,exact:true}).click();await inspect(`chat-${scenario.id}`);
   const chat=content.chats.find(c=>c.scenarioId===scenario.id)!;await page.getByRole('button',{name:chat.answers[0].label,exact:true}).click();await page.locator('[data-destination-id]').click();await inspect(`destination-${scenario.id}`);
  }else{
   for(const [name,hash] of [['profile','#/profile'],['journey','#/profile/journey'],['challenges','#/profile/challenges'],['sports','#/sports'],['choice','#/sports/yoga'],['classes','#/classes'],['catalog','#/sports/yoga/classes'],['class','#/sports/yoga/classes/yoga-free'],['plan',`#/sports/yoga/solo/yoga-${scenario.recommendationSituationId}`]] as const){await visit(hash);await inspect(`preview-${scenario.id}-${name}`);const back=page.locator('.breadcrumbs a');if(await back.count()){const target=await back.getAttribute('href');await back.click();expect(new URL(page.url()).hash).toBe(target);}}
  }
  await page.getByRole('button',{name:content.ui.exitPreview,exact:true}).click();
 }
 await page.evaluate(k=>localStorage.setItem(k,'{invalid'),key);await page.reload();await shellCopy(page);await page.screenshot({path:`/tmp/ba-refresh-t001/${width}-recovery.png`});
});

async function homePhoto(page:Page) {
 const image=page.locator('.home-hero > img');await expect(image).toHaveAttribute('src',mockupPhotos.city_park.src);await expect(image).toHaveAttribute('alt',mockupPhotos.city_park.alt);
 expect(await image.evaluate(async(i:HTMLImageElement)=>{await i.decode();return i.naturalWidth;})).toBe(1400);
}
for(const width of [360,1280])test(`genuine profile buckets and Buenos Aires Home ${width}`,async({page,request})=>{
 await page.setViewportSize({width,height:900});await page.clock.setFixedTime(new Date('2026-11-02T15:00:00Z'));
 const folder='/tmp/ba-refresh-t003';mkdirSync(folder,{recursive:true});const remote:string[]=[];page.on('request',r=>{if(new URL(r.url()).origin!=='http://127.0.0.1:4173')remote.push(r.url());});
 await page.goto('/');await choose(page);await homePhoto(page);await page.screenshot({path:`${folder}/${width}-actual-home.png`,fullPage:true});
 await page.goto('/#/profile');await expect(page.locator('[data-stat="weeklyGoal"]')).toHaveText('0 de 1 sesiones');await expect(page.getByRole('progressbar',{name:content.ui.weeklyGoal})).toHaveAttribute('value','0');await expect(page.locator('[data-activity-count="0"]')).toHaveCount(7);await expect(page.locator('main')).toContainText(content.ui.activityEmpty);expect(await page.locator('.activity-column i').evaluateAll(b=>b.every(el=>el.getBoundingClientRect().height===0))).toBe(true);
 await page.screenshot({path:`${folder}/${width}-zero-profile.png`,fullPage:true});
 const source=legacy();for(const p of Object.values(source.profiles))p.baselineHistory[0].activityDate='2026-11-02';source.scenarioReferenceDate='2026-11-02';const actual=normalizeLegacy(source);actual.preference={situationId:'first',confirmed:true};actual.intention={classId:'yoga-free',sportId:'yoga',classSnapshot:content.classes.find(c=>c.id==='yoga-free')!,chosenAt:'2026-10-14T15:00:00.000Z',origin:'simulated-intention'};
 const bytes=JSON.stringify(actual);await page.evaluate(({key,bytes})=>localStorage.setItem(key,bytes),{key,bytes});await page.reload();
 async function buckets(dates:string[],counts:number[],total:number,goal:number){
  expect(await page.locator('[data-activity-date]').evaluateAll(elements=>elements.map(el=>el.getAttribute('data-activity-date')))).toEqual(dates);
  expect(await page.locator('[data-activity-count]').evaluateAll(elements=>elements.map(el=>Number(el.getAttribute('data-activity-count'))))).toEqual(counts);expect(counts.reduce((a,b)=>a+b,0)).toBe(total);
  await expect(page.locator('[data-stat="weeklyGoal"]')).toHaveText(`${total} de ${goal} sesiones`);await expect(page.getByRole('progressbar',{name:content.ui.weeklyGoal})).toHaveAttribute('value',String(Math.min(total,goal)));await expect(page.getByRole('progressbar',{name:content.ui.weeklyGoal})).toHaveAttribute('aria-valuetext',`${total} de ${goal} sesiones`);
  const fullDays=['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];for(const [i,date] of dates.entries())await expect(page.locator(`[data-activity-date="${date}"]`)).toContainText(`${new Intl.DateTimeFormat('es-AR',{timeZone:'America/Argentina/Buenos_Aires',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(date+'T12:00:00Z'))}: ${counts[i]} sesiones`);
  const heights=await page.locator('.activity-column i').evaluateAll(b=>b.map(el=>el.getBoundingClientRect().height));for(const [i,c]of counts.entries())expect(heights[i]).toBe(c===0?0:c/Math.max(...counts,1)*71);
  console.log('T003/V1 independent dates/counts/raw total/goal/bar heights',width,dates,fullDays,counts,total,goal,heights);
 }
 await expect(page.locator('[data-stat="sessions"]')).toHaveText('6');await expect(page.locator('[data-stat="points"]')).toHaveText('60');await expect(page.locator('[data-stat="activeWeeks"]')).toHaveText('2');await buckets(['2026-11-02','2026-11-03','2026-11-04','2026-11-05','2026-11-06','2026-11-07','2026-11-08'],[3,0,0,0,0,0,0],3,1);
 await page.screenshot({path:`${folder}/${width}-populated-profile.png`,fullPage:true});
 await page.getByRole('button',{name:content.ui.editSituation}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('heading',{level:1})).toBeFocused();await page.getByRole('radio').nth(2).check();await page.getByRole('button',{name:content.ui.cancel,exact:true}).click();expect(await raw(page)).toBe(bytes);await page.reload();expect(await raw(page)).toBe(bytes);
 const scenario=content.previewScenarios.find(s=>s.id==='sustained')!;await page.getByRole('button',{name:scenario.title,exact:true}).click();await homePhoto(page);await page.screenshot({path:`${folder}/${width}-sustained-home.png`,fullPage:true});await page.goto('/#/profile');
 // Independent reference-date oracle, not the production selector.
 const previewDates=['2026-10-12','2026-10-13','2026-10-14','2026-10-15','2026-10-16','2026-10-17','2026-10-18'];const counts=previewDates.map(date=>scenario.history.filter(r=>r.activityDate===date&&date<=scenario.referenceDate).length);
 await buckets(previewDates,counts,counts.reduce((a,b)=>a+b,0),2);await expect(page.locator('[data-stat="sessions"]')).toHaveText(String(scenario.history.length));await page.screenshot({path:`${folder}/${width}-preview-profile.png`,fullPage:true});expect(await raw(page)).toBe(bytes);await page.getByRole('button',{name:content.ui.exitPreview,exact:true}).click();await expect(page.locator('[data-intended-class-id="yoga-free"]')).toBeVisible();expect(await raw(page)).toBe(bytes);
 await page.goto('/#/profile');await page.getByRole('button',{name:'Volver después de una pausa',exact:true}).click();await homePhoto(page);await page.screenshot({path:`${folder}/${width}-paused-home.png`,fullPage:true});expect(await raw(page)).toBe(bytes);await page.getByRole('button',{name:content.ui.exitPreview,exact:true}).click();
 await page.goto('/#/profile');await page.getByRole('button',{name:content.ui.editSituation}).click();await choose(page,'returning');const edited=JSON.parse((await raw(page))!);expect({...edited,preference:null}).toEqual({...actual,preference:null});await page.reload();expect(await raw(page)).toBe(JSON.stringify(edited));
 const provenance=JSON.parse(readFileSync('public/assets/photos/provenance.json','utf8')).assets.find((a:any)=>a.manifestKey==='city_park');expect(provenance.photoId).toBe(31414914);const response=await request.get(provenance.runtimePath);expect(response.status()).toBe(200);const served=await response.body();expect(served.equals(readFileSync('public'+provenance.runtimePath))).toBe(true);expect(createHash('sha256').update(served).digest('hex')).toBe(provenance.sha256);console.log('T003/V2 served Home provenance',provenance.photoId,provenance.source,provenance.sha256,served.length,'actual→preview→exit exact bytes',bytes,'confirmed preference-only',JSON.stringify(edited));
 await page.route('**/assets/photos/city_park.jpg',r=>r.abort());await page.reload();await expect(page.locator('.home-hero [role="status"]')).toHaveText(content.ui.imageUnavailable);await expect(page.locator('.home-hero')).toContainText(content.profiles[1].hero);expect(remote).toEqual([]);
});

for(const situation of ['first','returning','regular'])test(`display-only duration estimates ${situation}`,async({page})=>{
 await page.goto('/');await choose(page,situation);const bytes=await raw(page);
 for(const sport of content.sports){
  const plan=content.plans.find(p=>p.profileId===situation&&p.sportId===sport.id&&p.medium==='dry-land')!;
  await page.goto(`/#/sports/${sport.id}`);const summary=page.locator('.route-card.solo');await expect(summary).toContainText(content.ui.duration);await expect(summary).toContainText('15 min');if(sport.id==='swimming'){await expect(summary).toContainText(content.ui.dryLand);await expect(summary).toContainText('45 min / 60 min');}else await expect(summary).toContainText('15 min / 30 min');
  await summary.click();const steps=await page.locator('[data-step-id]').evaluateAll(elements=>elements.map(el=>({step:el.getAttribute('data-step-id'),exercise:el.getAttribute('data-exercise-id'),text:el.textContent,images:[...el.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),alt:i.alt}))})));
  const water=sport.id==='swimming';const selector=page.getByRole('combobox',{name:'Duración estimada',exact:true});await expect(selector.locator('option')).toHaveText(water?['45 min','60 min']:['15 min','30 min']);await expect(selector).toHaveValue(water?'45':'15');
  if(water)await expect(page.locator('.plan-meta')).toContainText('15 min');await selector.focus();await page.keyboard.press('ArrowDown');await expect(selector).toHaveValue(water?'60':'30');
  expect(await page.locator('[data-step-id]').evaluateAll(elements=>elements.map(el=>({step:el.getAttribute('data-step-id'),exercise:el.getAttribute('data-exercise-id'),text:el.textContent,images:[...el.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),alt:i.alt}))})))).toEqual(steps);expect(await raw(page)).toBe(bytes);
  await page.keyboard.press('ArrowUp');await expect(selector).toHaveValue(water?'45':'15');console.log('T005/V1',situation,sport.id,'options',water?[45,60]:[15,30],'default/keyboard unchanged ordered steps/photos',JSON.stringify(steps),'storage exact',bytes);
 }
});
for(const width of [360,1280])test(`duration local defaults focus and visual ${width}`,async({page})=>{
 const folder='/tmp/ba-refresh-t005';mkdirSync(folder,{recursive:true});await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await choose(page);const bytes=await raw(page);
 await page.goto('/#/sports/calisthenics');await page.screenshot({path:`${folder}/${width}-sport-summary.png`,fullPage:true});await page.goto('/#/sports/calisthenics/solo/cal-first');const selector=page.getByRole('combobox',{name:'Duración estimada',exact:true});await selector.selectOption('30');expect(await raw(page)).toBe(bytes);await page.screenshot({path:`${folder}/${width}-plan-selector.png`,fullPage:true});
 await page.goto('/#/sports/yoga/solo/yoga-first');await expect(selector).toHaveValue('15');await page.goto('/#/sports/calisthenics/solo/cal-first');await expect(selector).toHaveValue('15');await selector.selectOption('30');await page.goto('/#/home');await page.goto('/#/sports/calisthenics/solo/cal-first');await expect(selector).toHaveValue('15');await selector.selectOption('30');await page.reload();await expect(selector).toHaveValue('15');expect(await raw(page)).toBe(bytes);
 await page.goto('/#/sports/swimming/solo/swim-dry-first');await page.screenshot({path:`${folder}/${width}-dry-water-estimates.png`,fullPage:true});await selector.focus();await page.keyboard.press('ArrowDown');await expect(selector).toHaveValue('60');
 const geometry=await selector.evaluate(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,header:document.querySelector('.app-header')!.getBoundingClientRect().bottom,tabs:document.querySelector('.bottom-tabs')!.getBoundingClientRect().top,outline:getComputedStyle(el).outlineStyle,overflow:document.documentElement.scrollWidth>innerWidth};});expect(geometry.height).toBeGreaterThanOrEqual(44);expect(geometry.top).toBeGreaterThan(geometry.header);expect(geometry.bottom+7).toBeLessThan(geometry.tabs);expect(geometry.outline).not.toBe('none');expect(geometry.overflow).toBe(false);await page.screenshot({path:`${folder}/${width}-selector-focus.png`});expect(await raw(page)).toBe(bytes);
 await page.goto('/#/profile');await page.getByRole('button',{name:'Entrenamiento sostenido',exact:true}).click();await page.goto('/#/sports/yoga/solo/yoga-regular');await selector.selectOption('30');await expect(page.getByRole('button',{name:content.ui.start,exact:true})).toBeDisabled();expect(await raw(page)).toBe(bytes);await page.screenshot({path:`${folder}/${width}-preview-selector.png`,fullPage:true});await page.getByRole('button',{name:content.ui.exitPreview,exact:true}).click();expect(await raw(page)).toBe(bytes);
 await page.goto('/#/profile');page.once('dialog',d=>d.accept());await page.getByRole('button',{name:content.ui.reset,exact:true}).click();await choose(page);await page.goto('/#/sports/yoga/solo/yoga-first');await expect(selector).toHaveValue('15');console.log('T005/V1,V2 leave/change/reload/reset defaults, actual/preview exact bytes, no credit, selector keyboard geometry',width,geometry,bytes);
});

for(const width of [360,1280])test(`photo-led challenges and honest earned points ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/');await choose(page);
 await page.goto('/#/profile/challenges');await expect(page.locator('[data-stat="points"]')).toHaveText('0');
 await expect(page.locator('[data-badge-id]')).toHaveCount(2);await expect(page.locator('[data-badge-id] .badge-icon svg')).toHaveCount(2);
 await expect(page.locator('[data-benefit-id]')).toHaveCount(3);
 await expect(page.locator('[data-benefit-limitation]')).toHaveCount(1);
 await expect(page.locator('[data-benefit-limitation]')).toHaveText(content.legal.nonredeemable);
 for(const rule of content.rules.benefits){const card=page.locator(`[data-benefit-id="${rule.id}"]`);const image=card.locator('img');await expect(card).toContainText(rule.title);await expect(image).toHaveAttribute('src',rule.photo.path);await expect(image).toHaveAttribute('alt',rule.photo.alt);await image.evaluate((img:HTMLImageElement)=>img.decode());await expect(card.locator('progress')).toHaveAttribute('value','0');}
 await expect(page.locator('main')).not.toContainText(/demo|ilustrativ|ejemplo|fictici|simulad/i);
 await page.screenshot({path:`/tmp/ba-rewards-${width}-empty.png`,fullPage:true});
 const bytes=await raw(page);await page.goto('/#/profile');await page.getByRole('button',{name:'Entrenamiento sostenido',exact:true}).click();await page.goto('/#/profile/challenges');
 const scenario=content.previewScenarios.find(s=>s.id==='sustained')!;const points=scenario.history.length*content.rules.pointsPerCompletion;
 await expect(page.locator('[data-stat="points"]')).toHaveText(String(points));await expect(page.locator('[data-benefit-id="coffee"] .benefit-points')).toHaveText('Meta alcanzada');
 await expect(page.locator('main')).not.toContainText(/demo|ilustrativ|ejemplo|fictici|simulad/i);
 await page.screenshot({path:`/tmp/ba-rewards-${width}-progress.png`,fullPage:true});expect(await raw(page)).toBe(bytes);
});

for(const width of [360,1280])for(const scenario of content.previewScenarios.filter(s=>s.kind==='notice'))test(`notice wallpaper ${scenario.id} ${width} opens matching structured chat`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/');await choose(page);
 const bytes=await raw(page);await page.getByRole('link',{name:content.ui.profileAccessibleName}).click();await page.getByRole('button',{name:scenario.title,exact:true}).click();
 await expect(page.locator('[data-notice-id]')).toHaveAttribute('data-notice-id',scenario.id);
 await expect(page.locator('[data-preview-badge]')).toHaveCount(0);
 await expect(page.locator('.app-header')).toBeHidden();await expect(page.locator('.breadcrumbs')).toHaveCount(0);
 await expect(page.getByRole('heading',{level:1})).toBeFocused();
 await expect(page.locator('.notice-time')).toHaveAttribute('aria-hidden','true');await expect(page.locator('.notice-time strong')).toHaveText('9:41');
 await expect(page.locator('[data-notice-id] > p:not(.visually-hidden)')).toHaveCount(0);
 const photo=page.locator('.notice-photo > img');await expect(photo).toHaveAttribute('src','/assets/photos/city_park.jpg');await expect(photo).toHaveAttribute('alt','');await photo.evaluate((img:HTMLImageElement)=>img.decode());
 const card=page.getByRole('button',{name:scenario.activationLabel!,exact:true});await expect(card).toContainText(scenario.notice!);await expect(card).toHaveAccessibleDescription(scenario.notice!);
 const exit=page.getByRole('button',{name:content.ui.exitPreview,exact:true});await expect(exit).toHaveCount(1);
 const geometry=await page.locator('.notice-photo').evaluate(el=>{
  const box=(s:string)=>{const r=document.querySelector(s)!.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,width:r.width};};
  return {scene:box('.notice-photo'),clock:box('.notice-time'),card:box('.notice-card'),exit:box('[data-preview-exit] button'),filter:getComputedStyle(el.querySelector('img')!).filter,overflow:document.documentElement.scrollWidth>innerWidth};
 });
 expect(geometry.scene.height).toBeGreaterThanOrEqual(590);expect(geometry.scene.width).toBeLessThanOrEqual(355);
 expect(geometry.clock.top-geometry.scene.top).toBe(55);expect(geometry.card.top-geometry.scene.top).toBe(216);expect(geometry.card.height).toBeLessThan(150);
 expect(geometry.exit.top).toBeGreaterThan(geometry.scene.bottom);expect(geometry.exit.height).toBeGreaterThanOrEqual(44);expect(geometry.exit.bottom).toBeLessThanOrEqual(900-24);expect(geometry.exit.bottom).toBeGreaterThan(820);expect(geometry.overflow).toBe(false);expect(geometry.filter).toBe('brightness(0.65)');
 const path=`/tmp/ba-notice-correction/${width}-${scenario.id}`;await page.screenshot({path:`${path}.png`,fullPage:true});
 await card.focus();await page.keyboard.press('Tab');await expect(exit).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(card).toBeFocused();expect(await card.evaluate(el=>getComputedStyle(el).outlineStyle)).toBe('solid');await page.screenshot({path:`${path}-keyboard.png`});
 await card.click();const chat=content.chats.find(c=>c.id===scenario.chatId)!;
 await expect(page.locator('[data-chat-id]')).toHaveAttribute('data-chat-id',chat.id);await expect(page.locator('[data-answer-id]')).toHaveCount(chat.answers.length);
 await expect(page.locator('[data-preview-badge]')).toBeVisible();await expect(page.locator('input,textarea')).toHaveCount(0);
 for(const answer of chat.answers){const button=page.locator(`[data-answer-id="${answer.id}"]`);await expect(button).toHaveText(answer.label+'›');await button.click();await expect(page.getByRole('status')).toContainText(answer.response);}
 await page.getByRole('link',{name:content.ui.back,exact:true}).click();await expect(page.locator('[data-notice-id]')).toHaveAttribute('data-notice-id',scenario.id);await expect(page.locator('[data-preview-badge]')).toHaveCount(0);
 await card.focus();await page.keyboard.press('Enter');await expect(page.locator('[data-chat-id]')).toHaveAttribute('data-chat-id',chat.id);await expect(page.getByRole('status')).toHaveCount(0);
 await page.getByRole('link',{name:content.ui.back,exact:true}).click();await page.setViewportSize({width,height:560});
 const shortGeometry=await page.locator('[data-preview-exit]').evaluate(el=>({top:el.getBoundingClientRect().top,sceneBottom:document.querySelector('.notice-photo')!.getBoundingClientRect().bottom}));expect(shortGeometry.top).toBeGreaterThan(shortGeometry.sceneBottom);await page.screenshot({path:`${path}-short.png`,fullPage:true});
 await card.focus();await page.keyboard.press('Tab');await expect(exit).toBeFocused();const focusBox=await exit.boundingBox();expect(focusBox!.y).toBeGreaterThanOrEqual(0);expect(focusBox!.y+focusBox!.height+4).toBeLessThanOrEqual(560);expect(await exit.evaluate(el=>getComputedStyle(el).outlineStyle)).toBe('solid');await page.screenshot({path:`${path}-exit-keyboard.png`});
 await page.keyboard.press('Enter');await expect(page.locator('[data-notice-id],[data-preview-badge]')).toHaveCount(0);expect(await raw(page)).toBe(bytes);
 console.log('notice wallpaper geometry / matching chat / preset answers / bottom exit',width,scenario.id,chat.id,geometry,'screenshot',`${path}.png`);
});
