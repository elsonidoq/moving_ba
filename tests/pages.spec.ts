import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { Content } from '../src/content/types';

const content = JSON.parse(readFileSync('public/config/app-content.json', 'utf8')) as Content;

async function imagesLoaded(page: Page) {
  const images = page.locator('main img');
  expect(await images.count()).toBeGreaterThan(0);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveAttribute('src', /^\/moving_ba\/assets\//);
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  }
}

for (const width of [360, 1280]) {
  test(`Pages subpath loads content, photos, practice and hash reload at ${width}px`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    const failures: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
    const configResponse = page.waitForResponse(response => response.url().endsWith('/moving_ba/config/app-content.json'));
    await page.goto('./');
    expect((await configResponse).status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(content.branding.name);
    await imagesLoaded(page);
    await page.getByRole('button', { name: content.onboarding.startLabel, exact: true }).click();
    await page.getByRole('radio', { name: content.onboarding.choices.find(choice => choice.id === 'returning')!.label, exact: true }).check();
    await page.getByRole('button', { name: content.onboarding.continueLabel, exact: true }).click();
    await expect(page.locator('.home-hero')).toBeVisible();
    await imagesLoaded(page);

    for (const [hash, selector] of [
      ['#/sports', '.sport-list'],
      ['#/sports/yoga', '.sport-hero'],
      ['#/sports/yoga/classes', '.class-list'],
      ['#/sports/yoga/classes/yoga-free', '[data-detail-class-id="yoga-free"]'],
      ['#/profile/challenges', '.benefit-list'],
      ['#/sports/yoga/solo/yoga-returning', '[data-plan-id="yoga-returning"]'],
    ]) {
      await page.goto(`${baseURL}${hash}`);
      await expect(page.locator(selector)).toBeVisible();
      await imagesLoaded(page);
    }
    await page.reload();
    await expect(page.locator('[data-plan-id="yoga-returning"]')).toBeVisible();
    await page.getByRole('button', { name: content.ui.start, exact: true }).click();
    await expect(page.locator('[data-attempt-id]')).toBeVisible();
    await imagesLoaded(page);
    const saved = await page.evaluate(() => localStorage.getItem('ba-en-movimiento:demo:v1'));
    expect(saved).toBeTruthy();
    // A reload abandons only the incomplete practice, not the chosen situation.
    await page.reload();
    await expect(page.getByRole('button', { name: content.onboarding.startLabel, exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('ba-en-movimiento:demo:v1'))).toBe(saved);
    expect(errors).toEqual([]);
    expect(failures).toEqual([]);
  });
}
