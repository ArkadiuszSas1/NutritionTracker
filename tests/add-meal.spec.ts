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

        // Check that the mocked fields are populated
        await expect(page.locator('div').filter({ hasText: /^Food Name$/ }).locator('input')).toHaveValue('Mocked Apple');
        await expect(page.locator('div').filter({ hasText: /^Calories \(kcal\)$/ }).locator('input')).toHaveValue('95');
        await expect(page.locator('div').filter({ hasText: /^Protein \(g\)$/ }).locator('input')).toHaveValue('0.5');
        await expect(page.locator('div').filter({ hasText: /^Carbs \(g\)$/ }).locator('input')).toHaveValue('25');
        await expect(page.locator('div').filter({ hasText: /^Fat \(g\)$/ }).locator('input')).toHaveValue('0.3');
        await expect(page.locator('div').filter({ hasText: /^NOVA Grade \(1-4\)$/ }).locator('input')).toHaveValue('1');
        await expect(page.locator('div').filter({ hasText: /^Fiber \(g\)$/ }).locator('input')).toHaveValue('4.4');

        await expect(page.locator('div').filter({ hasText: /^Glycemic Load$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('div').filter({ hasText: /^Net Carbs \(g\)$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('div').filter({ hasText: /^Added Sugar \(g\)$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('div').filter({ hasText: /^Sat Fat \(g\)$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('div').filter({ hasText: /^Mono Fat \(g\)$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('div').filter({ hasText: /^Poly Fat \(g\)$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('div').filter({ hasText: /^Energy Impact$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('textarea')).toHaveValue('I ate a large honeycrisp apple');

        // 6. Approve the analysis
        await page.getByRole('button', { name: 'Approve' }).click();

        // 7. Verify the modal closes and the meal appears on the dashboard
        await expect(page.getByText('Review Analysis')).not.toBeVisible();
        await expect(page.getByText('Mocked Apple')).toBeVisible({ timeout: 10000 });
    });

    test('should successfully add a meal from gallery with mocked Gemini response', async ({ page }) => {
        // 1. Mock the specific Cloud Function endpoint so we don't hit the real Gemini API
        await page.route('**/analyzeFood*', async (route) => {
            const request = route.request();
            if (request.method() === 'POST') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        foodName: 'Mocked Gallery Apple',
                        calories: 105,
                        protein: 0.6,
                        carbs: 26,
                        fat: 0.4,
                        fiber: 4.5,
                        novaGrade: 1
                    })
                });
            } else {
                await route.continue();
            }
        });

        // 2. Click the 'Add Meal' button (using text that appears in the desktop sidebar)
        await page.getByRole('button', { name: 'Add Meal' }).click();

        // 3. Upload a dummy image to the gallery input
        const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
        await page.locator('input[type="file"]').setInputFiles({
            name: 'dummy.png',
            mimeType: 'image/png',
            buffer: imageBuffer
        });

        // 4. Wait for the image preview to appear and click 'Approve & Analyze'
        await expect(page.getByRole('button', { name: 'Approve & Analyze' })).toBeVisible();
        await page.getByRole('button', { name: 'Approve & Analyze' }).click();

        // 5. Wait for the Review Analysis modal to appear and assert the mocked values
        await expect(page.getByText('Review Analysis')).toBeVisible({ timeout: 10000 });

        // Check that the mocked fields are populated
        await expect(page.locator('div').filter({ hasText: /^Food Name$/ }).locator('input')).toHaveValue('Mocked Gallery Apple');
        await expect(page.locator('div').filter({ hasText: /^Calories \(kcal\)$/ }).locator('input')).toHaveValue('105');
        await expect(page.locator('div').filter({ hasText: /^Protein \(g\)$/ }).locator('input')).toHaveValue('0.6');
        await expect(page.locator('div').filter({ hasText: /^Carbs \(g\)$/ }).locator('input')).toHaveValue('26');
        await expect(page.locator('div').filter({ hasText: /^Fat \(g\)$/ }).locator('input')).toHaveValue('0.4');
        await expect(page.locator('div').filter({ hasText: /^NOVA Grade \(1-4\)$/ }).locator('input')).toHaveValue('1');
        await expect(page.locator('div').filter({ hasText: /^Fiber \(g\)$/ }).locator('input')).toHaveValue('4.5');

        await expect(page.locator('div').filter({ hasText: /^Glycemic Load$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('div').filter({ hasText: /^Net Carbs \(g\)$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('div').filter({ hasText: /^Added Sugar \(g\)$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('div').filter({ hasText: /^Sat Fat \(g\)$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('div').filter({ hasText: /^Mono Fat \(g\)$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('div').filter({ hasText: /^Poly Fat \(g\)$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('div').filter({ hasText: /^Energy Impact$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('textarea')).toHaveValue('');

        // 6. Approve the analysis
        await page.getByRole('button', { name: 'Approve' }).click();

        // 7. Verify the modal closes and the meal appears on the dashboard
        await expect(page.getByText('Review Analysis')).not.toBeVisible();
        await expect(page.getByText('Mocked Gallery Apple')).toBeVisible({ timeout: 10000 });
    });

    test('should successfully add a meal from camera with mocked Gemini response', async ({ page }) => {
        // Grant camera permissions
        await page.context().grantPermissions(['camera']);

        // 1. Mock the specific Cloud Function endpoint so we don't hit the real Gemini API
        await page.route('**/analyzeFood*', async (route) => {
            const request = route.request();
            if (request.method() === 'POST') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        foodName: 'Mocked Camera Apple',
                        calories: 110,
                        protein: 0.7,
                        carbs: 27,
                        fat: 0.5,
                        fiber: 4.6,
                        novaGrade: 1
                    })
                });
            } else {
                await route.continue();
            }
        });

        // 2. Click the 'Add Meal' button
        await page.getByRole('button', { name: 'Add Meal' }).click();

        // 3. Click 'Open Camera'
        await page.getByRole('button', { name: 'Open Camera' }).click();

        // 4. Wait for video to be visible and click 'Take Photo'
        await expect(page.locator('video')).toBeVisible();
        await page.getByRole('button', { name: 'Take Photo' }).click();

        // 5. Wait for the image preview to appear and click 'Approve & Analyze'
        await expect(page.getByRole('button', { name: 'Approve & Analyze' })).toBeVisible();
        await page.getByRole('button', { name: 'Approve & Analyze' }).click();

        // 6. Wait for the Review Analysis modal to appear and assert the mocked values
        await expect(page.getByText('Review Analysis')).toBeVisible({ timeout: 10000 });

        // Check that the mocked fields are populated
        await expect(page.locator('div').filter({ hasText: /^Food Name$/ }).locator('input')).toHaveValue('Mocked Camera Apple');
        await expect(page.locator('div').filter({ hasText: /^Calories \(kcal\)$/ }).locator('input')).toHaveValue('110');
        await expect(page.locator('div').filter({ hasText: /^Protein \(g\)$/ }).locator('input')).toHaveValue('0.7');
        await expect(page.locator('div').filter({ hasText: /^Carbs \(g\)$/ }).locator('input')).toHaveValue('27');
        await expect(page.locator('div').filter({ hasText: /^Fat \(g\)$/ }).locator('input')).toHaveValue('0.5');
        await expect(page.locator('div').filter({ hasText: /^NOVA Grade \(1-4\)$/ }).locator('input')).toHaveValue('1');
        await expect(page.locator('div').filter({ hasText: /^Fiber \(g\)$/ }).locator('input')).toHaveValue('4.6');

        await expect(page.locator('div').filter({ hasText: /^Glycemic Load$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('div').filter({ hasText: /^Net Carbs \(g\)$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('div').filter({ hasText: /^Added Sugar \(g\)$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('div').filter({ hasText: /^Sat Fat \(g\)$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('div').filter({ hasText: /^Mono Fat \(g\)$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('div').filter({ hasText: /^Poly Fat \(g\)$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('div').filter({ hasText: /^Energy Impact$/ }).locator('input')).toHaveValue('');
        await expect(page.locator('div').filter({ hasText: /^Comment$/ }).locator('textarea')).toHaveValue('');

        // 7. Approve the analysis
        await page.getByRole('button', { name: 'Approve' }).click();

        // 8. Verify the modal closes and the meal appears on the dashboard
        await expect(page.getByText('Review Analysis')).not.toBeVisible();
        await expect(page.getByText('Mocked Camera Apple')).toBeVisible({ timeout: 10000 });
    });

});
