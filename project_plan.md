# Nutrition Counter Web Application: Implementation Plan

## Phase 1: Project Scaffolding
- [ ] Initialize frontend application using React + Vite + TypeScript.
- [ ] Install and configure Tailwind CSS.
- [ ] Set up basic folder structure (`src/components`, `src/services`, `src/hooks`, `src/types`, `src/assets`).
- [ ] Clean up default Vite boilerplate and create a clean starting point.

## Phase 2: Core UI Layout & Routing
- [ ] Set up React Router (if needed) or simple state-based routing between "Dashboard" and "Diary".
- [ ] Build a premium, mobile-first responsive Layout component (Header, Main Content area, Navigation).
- [ ] Create placeholder components for the Dashboard (Daily View) and the Meal Diary (Historical View).

## Phase 3: Authentication Integration (Google OAuth)
- [ ] Determine Google OAuth flow suitable for a frontend-only application (Google Identity Services).
- [ ] Create a Login screen/component.
- [ ] Implement user sign-in and sign-out logic.
- [ ] Ensure the app requests the necessary scopes for Google Sheets API access.

## Phase 4: Data Storage Integration (Google Sheets API)
- [ ] Set up a service to interact with the Google Sheets API.
- [ ] Implement a function to create a new spreadsheet if one doesn't exist for the user.
- [ ] Implement functions to read data (fetch user's daily meals and historical totals) and parse it into an application state.
- [ ] Implement a function to append new meal data to the spreadsheet.

## Phase 5: Image Capture & Upload UI
- [ ] Build a component for users to capture a live photo (using device camera).
- [ ] Build a component for users to upload an image from their gallery.
- [ ] Ensure images are displayed in a preview before processing.

## Phase 6: AI Integration (Google Gemini API)
- [ ] Set up the service for the Gemini API using the hardcoded API key.
- [ ] Construct the prompt telling Gemini how to analyze the image and what JSON format to return (Calories, Protein, Carbs, Fat, and Food Name).
- [ ] Send the captured/uploaded image to Gemini and parse the response.

## Phase 7: Wiring it Together
- [ ] Connect the Gemini data parsing to the Google Sheets data save function.
- [ ] Update the UI to reflect new meals immediately after successfully capturing and saving.
- [ ] Display aggregate nutrition data for the selected day in the Dashboard.

## Phase 8: Final Polish & Deployment
- [ ] Perform a pass on UI/UX, ensuring interactions are smooth and modern (animations, hover states).
- [ ] Verify the application works flawlessly across desktop and mobile devices.
- [ ] Connect the repository to Netlify and deploy the application.
- [ ] Verify production functionality.
