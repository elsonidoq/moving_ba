import { test, expect, type Page } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import type { Content } from '../src/content/types';
import { normalizeLegacy, type LegacyEnvelope } from '../src/state/storage';
const content=JSON.parse(readFileSync('public/config/app-content.json','utf8')) as Content;
const key='ba-en-movimiento:demo:v1';
const evidence='/tmp/ba-batch2';mkdirSync(evidence,{recursive:true});
const raw=(page:Page)=>page.evaluate(k=>localStorage.getItem(k),key);
async function choose(page:Page,id='first') {await page.getByRole('radio',{name:content.onboarding.choices.find(c=>c.id===id)!.label,exact:true}).check();await page.getByRole('button',{name:content.onboarding.continueLabel,exact:true}).click();}
function legacy():LegacyEnvelope {
 const profiles=Object.fromEntries(['first','returning','regular'].map(p=>[p,{baselineHistory:[{id:'collision',profileId:p,sportId:'yoga',planId:'retired',planTitle:`Histórica ${p}`,sportTitle:'Yoga',medium:'dry-land',activityDate:'2026-10-01',origin:'seed'}],completions:{'shared-attempt':{id:'shared-attempt',attemptId:'shared-attempt',profileId:p,sportId:'yoga',planId:'retired-completed',planTitle:`Terminada ${p}`,sportTitle:'Yoga',medium:'dry-land',activityDate:'2026-10-02',origin:'user-simulated',timestamp:'2026-10-02T15:00:00.000Z',completedStepIds:['step-one']}},interests:{'retired-class':{classId:'retired-class',profileId:p,sportId:'yoga',classTitle:`Clase ${p}`,sportTitle:'Yoga',timestamp:'2026-10-02T15:00:00.000Z',origin:'simulated-interest'}}}]));
 return {schemaVersion:1,selectedProfileId:'regular',scenarioReferenceDate:'2026-10-14',profiles} as LegacyEnvelope;
}
test('one-person onboarding profile exact unselected choices and no identity inference',async({page})=>{
 await page.goto('/#/regular/yoga/solo/yoga-regular');
 await expect(page.getByRole('radio')).toHaveCount(3);
 await expect(page.getByRole('radio',{checked:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:content.onboarding.continueLabel,exact:true})).toBeDisabled();
 await expect(page.getByRole('navigation',{name:'Principal'})).toHaveCount(0);
 expect(await raw(page)).toBeNull();
});
for(const choice of content.onboarding.choices) test(`one-person onboarding profile ${choice.id} explicit recommendation survives reload`,async({page})=>{
 await page.goto('/');await choose(page,choice.id);const profile=content.profiles.find(p=>p.id===choice.id)!;
 await expect(page.locator('.hero')).toContainText(profile.hero);expect(JSON.parse((await raw(page))!).preference).toEqual({situationId:choice.id,confirmed:true});
 await page.reload();await expect(page.locator('.hero')).toContainText(profile.hero);console.log('choice',choice.id,'route',page.url(),'bytes',await raw(page));
});
test('one-person onboarding profile legacy collision choose reload edit preserves canonical history and lifetime',async({page})=>{
 const source=legacy();await page.addInitScript(({key,source})=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem(key,JSON.stringify(source));sessionStorage.setItem('seeded','yes');}},{key,source});
 await page.goto('/#/regular/home');await expect(page.getByRole('radio',{checked:true})).toHaveCount(0);expect(await raw(page)).toBe(JSON.stringify(source));
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
 await page.reload();await expect(page.getByRole('radio')).toHaveCount(3);expect(await page.evaluate(()=>localStorage.getItem('unrelated'))).toBe('sentinel');
 await page.evaluate(k=>localStorage.setItem(k,'{invalid-exact-bytes'),key);await page.reload();await expect(page.getByRole('heading',{level:1})).toHaveText(content.ui.storageRecovery);const broken=await raw(page);const brokenURL=page.url();
 page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:content.ui.storageReset}).click();expect(await raw(page)).toBe(broken);expect(page.url()).toBe(brokenURL);
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:content.ui.storageReset}).click();await expect(page.getByRole('radio')).toHaveCount(3);expect(JSON.parse((await raw(page))!).journey).toEqual({});
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
 await page.keyboard.press('Tab');await expect(page.getByRole('radio').first()).toBeFocused();await page.keyboard.press('Space');await page.keyboard.press('ArrowDown');await expect(page.getByRole('radio').nth(1)).toBeChecked();
 await page.screenshot({path:`${evidence}/t003-${width}-onboarding.png`,fullPage:true});await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:content.onboarding.continueLabel,exact:true})).toBeFocused();await page.keyboard.press('Enter');
 await expect(page.getByRole('heading',{level:1})).toBeFocused();await page.screenshot({path:`${evidence}/t003-${width}-home.png`,fullPage:true});
 await page.getByRole('link',{name:content.ui.profileAccessibleName}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('heading',{level:1})).toBeFocused();
 const reset=page.getByRole('button',{name:content.ui.reset,exact:true});await reset.focus();page.once('dialog',d=>d.dismiss());await page.keyboard.press('Enter');await expect(reset).toBeFocused();await page.screenshot({path:`${evidence}/t003-${width}-profile.png`,fullPage:true});
 for(const selector of ['.profile-button','.bottom-tabs a','button:not(.skip-link)','.situation-option'])for(const box of await page.locator(selector).all()){const b=await box.boundingBox();if(b)expect(b.height).toBeGreaterThanOrEqual(44);}
 const sizes=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,appBottom:document.querySelector('.app')!.getBoundingClientRect().bottom,tabHeight:document.querySelector('.bottom-tabs')!.getBoundingClientRect().height,padding:getComputedStyle(document.querySelector('.app')!).paddingBottom}));expect(sizes.scroll).toBeLessThanOrEqual(sizes.client);expect(parseInt(sizes.padding)).toBeGreaterThan(sizes.tabHeight);
 await page.getByRole('button',{name:content.ui.skipToContent}).focus();await page.keyboard.press('Enter');await expect(page.locator('main')).toBeFocused();console.log('keyboard radio ArrowDown/profile/reset cancel/skip focus passed',width,sizes,'screenshots',`${evidence}/t003-${width}-*.png`);
});
