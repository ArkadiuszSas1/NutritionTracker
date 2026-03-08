import { test, expect } from '@playwright/test';

test.describe('Delete Meal Flow', () => {

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

    test('should successfully delete an existing meal', async ({ page }) => {
        // 1. Mock the specific Cloud Function endpoint so we don't hit the real Gemini API
        await page.route('**/analyzeFood*', async (route) => {
            const request = route.request();
            if (request.method() === 'POST') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        foodName: 'Test Meal To Delete',
                        calories: 300,
                        protein: 10,
                        carbs: 40,
                        fat: 10,
                        fiber: 5,
                        novaGrade: 2
                    })
                });
            } else {
                await route.continue();
            }
        });

        // 2. Add a meal first so we have something guaranteed to delete
        await page.getByRole('button', { name: 'Add Meal' }).click();
        await page.getByPlaceholder(/Describe your meal/).fill('Test Meal To Delete');
        await page.getByRole('button', { name: 'Analyze Description Only' }).click();
        await expect(page.getByText('Review Analysis')).toBeVisible({ timeout: 10000 });
        await page.getByRole('button', { name: 'Approve' }).click();
        await expect(page.getByText('Review Analysis')).not.toBeVisible();
        await expect(page.locator('h4').filter({ hasText: /Test Meal To Delete/i }).first()).toBeVisible({ timeout: 10000 });

        // 3. Click the hidden test delete button via evaluate
        const mealItemContainer = page.locator('div.relative.overflow-hidden.rounded-2xl.bg-gray-100').filter({ hasText: 'Test Meal To Delete' }).first();
        const deleteBtn = mealItemContainer.locator('[data-testid="test-delete-meal-btn"]');
        await deleteBtn.evaluate((node: HTMLButtonElement) => node.click());

        // 4. Verify the meal is removed from the dashboard
        await expect(page.locator('h4').filter({ hasText: /Test Meal To Delete/i })).not.toBeVisible({ timeout: 10000 });
    });
});
