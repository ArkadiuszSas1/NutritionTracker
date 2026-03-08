import { test, expect } from '@playwright/test';

test.describe('Edit Meal Flow', () => {

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

    test('should successfully edit an existing meal', async ({ page }) => {
        // 1. Mock the specific Cloud Function endpoint so we don't hit the real Gemini API
        await page.route('**/analyzeFood*', async (route) => {
            const request = route.request();
            if (request.method() === 'POST') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        foodName: 'Test Meal To Edit',
                        calories: 500,
                        protein: 20,
                        carbs: 50,
                        fat: 10,
                        fiber: 5,
                        novaGrade: 2
                    })
                });
            } else {
                await route.continue();
            }
        });

        // 2. Add a meal first so we have something guaranteed to edit
        await page.getByRole('button', { name: 'Add Meal' }).click();
        await page.getByPlaceholder(/Describe your meal/).fill('Test Meal To Edit');
        await page.getByRole('button', { name: 'Analyze Description Only' }).click();
        await expect(page.getByText('Review Analysis')).toBeVisible({ timeout: 10000 });
        await page.getByRole('button', { name: 'Approve' }).click();
        await expect(page.getByText('Review Analysis')).not.toBeVisible();
        await expect(page.locator('h4').filter({ hasText: /Test Meal To Edit/i }).first()).toBeVisible({ timeout: 10000 });

        // 3. Click the hidden test edit button via evaluate
        const mealItemContainer = page.locator('div.relative.overflow-hidden.rounded-2xl.bg-gray-100').filter({ hasText: 'Test Meal To Edit' }).first();
        const testBtn = mealItemContainer.locator('[data-testid="test-edit-meal-btn"]');
        await testBtn.evaluate((node: HTMLButtonElement) => node.click());

        // 4. Wait for Edit Meal modal
        await expect(page.getByText('Edit Meal')).toBeVisible({ timeout: 10000 });

        // 5. Change the food name and calories
        const nameInput = page.locator('div').filter({ hasText: /^Food Name$/ }).locator('input');
        await nameInput.fill('Edited Test Meal');

        const caloriesInput = page.locator('div').filter({ hasText: /^Calories \(kcal\)$/ }).locator('input');
        await caloriesInput.fill('600');

        // 6. Save changes
        await page.getByRole('button', { name: 'Save Changes' }).click();

        // 7. Verify modal closes and new text is visible
        await expect(page.getByText('Edit Meal')).not.toBeVisible();
        await expect(page.locator('h4').filter({ hasText: /Edited Test Meal/i }).first()).toBeVisible({ timeout: 10000 });

        // Also verify the container has the new calories text
        await expect(mealItemContainer).toContainText('600');
    });
});
