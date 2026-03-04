# Nutrition Tracker

A premium, mobile-first web application designed to track your daily nutrition effortlessly using AI-powered image recognition and Google Sheets as a secure, personal database.

## Live Demo

- **App**: https://nutritiontracker-706c4.web.app
- **Firebase Console**: https://console.firebase.google.com/project/nutritiontracker-706c4/overview

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

---

## Environment Management (Local vs. Production)

This project uses Vite's environment variable system to automatically switch between local development and production.

### `.env.local` (Development)
Used when running `npm run dev`. It points to the **Firebase Emulator**.
```env
VITE_GOOGLE_CLIENT_ID=...
VITE_CLOUD_FUNCTION_URL=http://127.0.0.1:5001/nutritiontracker-706c4/us-central1/analyzeFood
```

### `.env.production` (Production)
Used when running `npm run build`. It points to the **Live Cloud Function**.
```env
VITE_GOOGLE_CLIENT_ID=...
VITE_CLOUD_FUNCTION_URL=https://us-central1-nutritiontracker-706c4.cloudfunctions.net/analyzeFood
```

---

## Local Development Workflow

1.  **Install dependencies**:
    ```bash
    npm install
    npm install --prefix ./functions
    ```

2.  **Start the Firebase Emulators** (in a new terminal):
    ```bash
    firebase emulators:start --only functions
    ```
    *This hosts your Cloud Function locally so your app can call it.*

3.  **Start the React App**:
    ```bash
    npm run dev
    ```

---

## Deployment Workflow

1.  **Build the project**:
    ```bash
    npm run build
    ```
    *Vite will automatically use the production URL from `.env.production`.*

2.  **Deploy to Firebase**:
    ```bash
    firebase deploy
    ```

---

## Setup & Configuration

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v22 or higher recommended)
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