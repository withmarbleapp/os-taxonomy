import { expect, test } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('Weekend Worksheets happy path', () => {
  test('home shows children and can generate + assess in demo mode', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Whose learning adventure/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Maya/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Leo/i })).toBeVisible();

    await page.getByRole('button', { name: /Maya/i }).click();
    await expect(page.getByText(/Maya is growing/i)).toBeVisible();
    await expect(page.getByLabel(/Concept constellation/i)).toBeVisible();
    await expect(page.getByText(/Needs learning/i).first()).toBeVisible();
    await expect(page.getByText(/Next focus:/i)).toBeVisible();

    await page.getByRole('link', { name: /Create worksheet/i }).click();
    await expect(page.getByRole('heading', { name: /Pick a theme/i })).toBeVisible();

    await page.getByPlaceholder(/sea life/i).fill('sea life');
    await page.getByRole('button', { name: /^20 minutes$/i }).click();
    await page.getByRole('button', { name: /Create worksheet/i }).click();

    await expect(page.getByText(/Ready to print/i)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('link', { name: /Download/i })).toBeVisible();

    await page.getByRole('button', { name: /Upload scan when done/i }).click();
    await expect(page.getByText(/Upload scan/i)).toBeVisible();

    const fixtureScan = path.resolve(__dirname, '../../fixtures/scans/demo-scan-sea-life.svg');
    await page.setInputFiles('input[type="file"]', fixtureScan);

    await expect(page.getByRole('heading', { name: /How it went/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/Maya/i).first()).toBeVisible();

    await page.getByRole('link', { name: /View progress/i }).click();
    await expect(page.getByRole('heading', { name: /The curriculum, curated/i })).toBeVisible();
    await expect(page.getByLabel(/Progress atlas/i)).toBeVisible();
    await expect(page.getByLabel(/Subject overview/i)).toBeVisible();
    await expect(
      page.locator('.subject-card').filter({ hasText: 'Mathematics' }),
    ).toBeVisible();
  });

  test('atlas and scorecards open full-width subject workspace', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Leo/i }).click();
    await page.getByRole('link', { name: /Explore learning path/i }).click();

    await expect(page.getByLabel(/Progress atlas/i)).toBeVisible();
    await expect(page.getByText(/Progress atlas/i).first()).toBeVisible();

    await page
      .locator('.subject-card')
      .filter({ hasText: 'Mathematics' })
      .click();

    await expect(page.getByLabel(/Mathematics learning path/i)).toBeVisible();
    await expect(page.locator('.subject-workspace')).toBeVisible();
    await expect(page.locator('.chapter-rail-item').first()).toBeVisible();
    await expect(page.locator('.chapter-link-map')).toBeVisible();
    await expect(page.locator('.journey-step').first()).toBeVisible();

    await page.locator('.journey-step').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /Close topic details/i }).click();

    await page.getByRole('button', { name: /Overview/i }).first().click();
    await expect(page.getByLabel(/Progress atlas/i)).toBeVisible();
    await expect(page.getByLabel(/Mathematics learning path/i)).toHaveCount(0);
  });

  test('topic drawer prefills subject and sub-subject on generate', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Leo/i }).click();
    await page.getByRole('link', { name: /Explore learning path/i }).click();

    await page
      .locator('.subject-card')
      .filter({ hasText: 'English' })
      .click();

    await expect(page.getByLabel(/English learning path/i)).toBeVisible();
    const chapter = page.locator('.chapter-rail-item.active');
    await expect(chapter).toBeVisible();
    const domainName = (await chapter.locator('.chapter-rail-title').textContent())?.trim();
    expect(domainName).toBeTruthy();

    await page.locator('.journey-step').first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const topicName = (await dialog.locator('h2').textContent())?.trim();
    expect(topicName).toBeTruthy();

    await dialog.getByRole('link', { name: /Create worksheet/i }).click();
    await expect(page.getByRole('heading', { name: /Pick a theme/i })).toBeVisible();

    await expect(page.getByLabel(/^Subject focus/i)).toHaveValue('English');
    await expect(page.getByLabel(/Sub-subject focus/i)).toHaveValue(domainName!);
    await expect(page.getByText(`We'll favour: ${topicName}`)).toBeVisible();
  });

  test('settings can toggle demo mode', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /Household setup/i })).toBeVisible();
    await page.getByRole('button', { name: /Use demo data/i }).click();
    await expect(page.getByText(/Demo mode on/i)).toBeVisible();
  });

  test('settings can add and remove a child with DOB', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /Household setup/i })).toBeVisible();

    await page.getByLabel(/^Name$/i).last().fill('Sam');
    await page.getByLabel(/Date of birth/i).last().fill('2020-03-15');
    await expect(page.getByText(/Age 6 · Year 1/i).last()).toBeVisible();
    await page.getByRole('button', { name: /Add child/i }).click();
    await expect(page.getByText(/Child added/i)).toBeVisible();
    await expect(page.getByText('Sam').first()).toBeVisible();
    await expect(page.getByText(/Age 6 · Year 1/i).first()).toBeVisible();

    await page.goto('/');
    await expect(page.getByRole('button', { name: /Sam/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sam/i })).toContainText('Year 1');

    await page.goto('/settings');
    page.once('dialog', (dialog) => dialog.accept());
    await page
      .locator('.list-item')
      .filter({ hasText: 'Sam' })
      .getByRole('button', { name: /Remove/i })
      .click();
    await expect(page.getByText(/Sam removed/i)).toBeVisible();
  });
});
