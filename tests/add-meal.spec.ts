import { test, expect } from '@playwright/test';

test.describe('Add Meal Flow', () => {

    test.beforeEach(async ({ page }) => {
        page.on('dialog', dialog => console.log('🚨 Unexpected Alert: ' + dialog.message()));
        // Authenticate using the seeded test user
        await page.goto('/');
        await page.getByRole('textbox', { name: 'Enter your email' }).fill('test@test.com');
        await page.getByPlaceholder('Enter your password').fill('password');
        await page.getByRole('button', { name: 'Sign In' }).click();

        // Wait for the dashboard to load (by checking for the header)
        await expect(page.getByText("Today's Summary")).toBeVisible({ timeout: 10000 });
    });

    test('should successfully add a text-based meal with mocked Gemini response', async ({ page }) => {
        // 1. Mock the specific Cloud Function endpoint so we don't hit the real Gemini API
        await page.route('**/analyzeFood*', async (route) => {
            const request = route.request();
            // Ensure only POST requests are mocked (to be safe)
            if (request.method() === 'POST') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        foodName: 'Mocked Apple',
                        calories: 95,
                        protein: 0.5,
                        carbs: 25,
                        fat: 0.3,
                        fiber: 4.4,
                        novaGrade: 1
                    })
                });
            } else {
                await route.continue();
            }
        });

        // 2. Click the 'Add Meal' button (using text that appears in the desktop sidebar)
        await page.getByRole('button', { name: 'Add Meal' }).click();

        // 3. Fill the text description in the ImageUploader modal
        await page.getByPlaceholder(/Describe your meal/).fill('I ate a large honeycrisp apple');

        // 4. Submit the text description
        await page.getByRole('button', { name: 'Analyze Description Only' }).click();

        // 5. Wait for the Review Analysis modal to appear and assert the mocked values
        await expect(page.getByText('Review Analysis')).toBeVisible();

        // Check that the mocked food name was populated
        await expect(page.locator('div').filter({ hasText: /^Food Name$/ }).locator('input')).toHaveValue('Mocked Apple');

        // 6. Approve the analysis
        await page.getByRole('button', { name: 'Approve' }).click();

        // 7. Verify the modal closes and the meal appears on the dashboard
        await expect(page.getByText('Review Analysis')).not.toBeVisible();
        await expect(page.getByText('Mocked Apple')).toBeVisible({ timeout: 10000 });
    });

});
