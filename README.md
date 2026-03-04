# Nutrition Tracker

A premium, mobile-first web application designed to track your daily nutrition effortlessly using AI-powered image recognition and Google Sheets as a secure, personal database.

## Live Demo

- **App**: https://nutritiontracker-706c4.web.app
- **Firebase Console**: https://console.firebase.google.com/project/nutritiontracker-706c4/overview

---

## Features

- **AI Image Recognition**: Snap a photo or upload an image of your meal, and Google Gemini AI will automatically estimate calories and macronutrients (Protein, Carbs, Fat).
- **Personal Data Ownership**: All your data is stored in a private Google Sheet named "Nutrition Tracker Data" in your own Google Drive.
- **Daily Dashboard**: Visualize your progress against daily goals with a sleek, modern UI.
- **Historical Diary**: Browse your past entries and observe your nutritional trends.
- **Secure Authentication**: Log in securely using your own Google account.

---

## Architecture

```
Browser (React App)
    │
    ├── Google Sheets API ──────────────────────► Google Drive/Sheets
    │   (direct, with user's OAuth token)         (user's own data)
    │
    └── Firebase Cloud Function ─────────────────► Gemini AI
        (POST /analyzeFood with image)             (API key is secret on server)
```

| | Google Sheets | Gemini AI |
|---|---|---|
| **Auth method** | User's own OAuth token | Private API key (server-side) |
| **Who pays** | Nothing — user's own Google Drive | API owner (per-call billing) |
| **Call origin** | Directly from the browser | Via Firebase Cloud Function proxy |
| **Why** | Safe — user already consented | Key must stay secret on the server |

**Google Sheets** calls are made directly from the browser because they use the user's own OAuth token — nothing secret is exposed. **Gemini AI** calls are proxied through a Firebase Cloud Function so the private API key never reaches the browser.

---

## Setup & Configuration

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- A Google Account
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`

### 2. Google Cloud Configuration (OAuth Client ID)

To enable Google Login and Google Sheets integration, you must set up a project in the Google Cloud Console:

1. Go to the **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Create a new project (e.g., "Nutrition Tracker").
3. **Enable APIs**:
   - Search for and enable the **Google Sheets API**.
   - Search for and enable the **Google Drive API**.
4. **Configure OAuth Consent Screen**:
   - Select **User Type**: "External".
   - Fill in the required app information.
   - **Add Scopes**:
     - `auth/userinfo.email`
     - `auth/userinfo.profile`
     - `https://www.googleapis.com/auth/spreadsheets`
     - `https://www.googleapis.com/auth/drive.file`
   - **Add Test Users**: Add your own Google email while the app is in "Testing" status.
5. **Create Credentials**:
   - Go to the **Credentials** tab → **Create Credentials** → **OAuth client ID**.
   - Select **Web application**.
   - **Authorized JavaScript origins**: Add `http://localhost:5173` and your production domain.
   - **Authorized redirect URIs**: Add the same URLs.
   - Copy your **Client ID**.

### 3. Google Gemini AI API Key (Server-side Secret)

The Gemini API key is **never stored in the frontend code**. It lives securely in Firebase Secret Manager and is accessed only by the Cloud Function.

1. Go to **[Google AI Studio](https://aistudio.google.com/)**.
2. In the left sidebar, click **"Get API key"**.
3. Click **"Create API key in existing project"** and select your project.
4. Copy your **API Key**.
5. Store it as a Firebase secret:
   ```bash
   firebase functions:secrets:set GEMINI_API_KEY
   # Paste your key when prompted
   ```

---

## Environment Variables

Create `.env.local` in the root of the project:

```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
VITE_CLOUD_FUNCTION_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/analyzeFood
```

> **Note**: `VITE_GEMINI_API_KEY` is NOT needed in the frontend. It lives securely in Firebase Secret Manager.

---

## Running Locally

```bash
# Install frontend dependencies
npm install

# Install functions dependencies
npm install --prefix ./functions

# Start the dev server
npm run dev
```

For local AI testing, start the Firebase Functions emulator in a separate terminal:
```bash
firebase emulators:start --only functions
```
And set `VITE_CLOUD_FUNCTION_URL=http://127.0.0.1:5001/YOUR_PROJECT_ID/us-central1/analyzeFood` in `.env.local`.

---

## Deployment

```bash
# 1. Build the React frontend
npm run build

# 2. Deploy frontend (Hosting) + backend (Cloud Function)
firebase deploy
```

Or deploy separately:
```bash
firebase deploy --only hosting   # Frontend only
firebase deploy --only functions # Cloud Function only
```