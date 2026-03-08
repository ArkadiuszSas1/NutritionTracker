import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

    test('should login successfully with valid seeded credentials', async ({ page }) => {
        // Navigate to the app (which redirects to login if unauthenticated)
        await page.goto('/');

        // Check we are on the login screen
        await expect(page.getByText('Nutrition Tracker')).toBeVisible();
        await expect(page.getByText('Your daily nutrition, analyzed with AI.')).toBeVisible();

        // Fill in the login form using the exact label text from the component
        await page.getByRole('textbox', { name: "Enter your email" }).fill('test@test.com');
        await page.getByPlaceholder('Enter your password').fill('password');

        // Click the Sign In button
        await page.getByRole('button', { name: 'Sign In' }).click();

        // After login, we should see the dashboard. We can check for a seeded meal
        // Assuming "Oatmeal & Blueberries" is seeded for today
        await expect(page.getByText('Oatmeal & Blueberries')).toBeVisible({ timeout: 10000 });

        // Check for the "Calories Eaten" header in the dashboard
        await expect(page.getByText('Calories Eaten')).toBeVisible();
    });

    test('should register successfully with a new user', async ({ page }) => {
        // Navigate to the app (which redirects to login if unauthenticated)
        await page.goto('/');

        // Check we are on the login screen
        await expect(page.getByText('Nutrition Tracker')).toBeVisible();

        // Switch to registration mode
        await page.getByRole('button', { name: "Don't have an account? Register" }).click();

        // Fill in the registration form with a unique email
        const uniqueEmail = `testuser_${Date.now()}@test.com`;
        await page.getByRole('textbox', { name: "Enter your email" }).fill(uniqueEmail);
        await page.getByPlaceholder('Enter your password').fill('password123');

        // Click the Create Account button
        await page.getByRole('button', { name: 'Create Account' }).click();

        // After registration, we should see the dashboard.
        await expect(page.getByText('Calories Eaten')).toBeVisible({ timeout: 10000 });
    });

});
