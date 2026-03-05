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
Used when running `npm run dev`. It uses a **relative path** (`/analyzeFood`) which the Vite dev server proxies to the local Firebase Emulator over HTTP internally — avoiding the browser's mixed-content block (HTTPS page → HTTP emulator).
```env
VITE_GOOGLE_CLIENT_ID=...
VITE_CLOUD_FUNCTION_URL=/analyzeFood
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

2.  **Create `functions/.secret.local`** (one-time setup):

    The Firebase Emulator cannot access Firebase Secret Manager, so you must provide the Gemini API key in a local file. This file is already in `.gitignore` and will never be committed.
    ```bash
    firebase functions:secrets:access GEMINI_API_KEY
    ```
    Copy the printed key and create the file `functions/.secret.local`:
    ```env
    GEMINI_API_KEY=YOUR_KEY_HERE
    ```

3.  **Start the Firebase Emulators** (in a new terminal):
    ```bash
    firebase emulators:start --only functions
    ```
    *This hosts your Cloud Function locally so your app can call it.*

4.  **Start the React App**:
    ```bash
    npm run dev
    ```

### How the Vite Proxy Works

Because the dev server uses HTTPS (via `@vitejs/plugin-basic-ssl`, required for camera access on mobile), the browser would normally block requests to the HTTP emulator as "mixed content". To solve this, `vite.config.ts` includes a proxy rule:

```
Browser (HTTPS) → https://localhost:5173/analyzeFood
                        ↓  Vite proxy (runs server-side, no browser restriction)
              http://127.0.0.1:5001/.../analyzeFood  (Firebase Emulator)
```

The browser only ever talks to the secure Vite server. Vite handles the HTTP hop to the emulator internally.

## Mobile Testing (Local Network)

You can test the app on a physical mobile device over Wi-Fi. Because OAuth and the camera API require HTTPS, a few extra steps are needed.

### Prerequisites
- Your PC and mobile device must be on the **same Wi-Fi network**.
- Your PC's local IP address is `192.168.1.156` (run `ipconfig` to confirm if it changes).

### One-time OAuth Setup

Google and Firebase require a valid domain (not a raw IP address) for OAuth. Use the free `nip.io` DNS service, which maps `192.168.1.156.nip.io` → `192.168.1.156` automatically.

**1. Firebase Authorized Domains**
1. Go to [Firebase Console → Authentication → Settings → Authorized domains](https://console.firebase.google.com/project/nutritiontracker-706c4/authentication/settings).
2. Click **Add domain** and add: `192.168.1.156.nip.io`

**2. Google Cloud Console**
1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials) and open your OAuth 2.0 Web Client ID.
2. Under **Authorized JavaScript origins**, add: `https://192.168.1.156.nip.io:5173`
3. Under **Authorized redirect URIs**, ensure this Firebase handler URI is present (it may already be there):
   ```
   https://nutritiontracker-706c4.firebaseapp.com/__/auth/handler
   ```
4. Click **Save** and wait ~1-2 minutes for the changes to propagate.

### Running the App for Mobile Testing

The dev server is already configured to serve over HTTPS (required for camera access on Android/iOS) and to accept `nip.io` hostnames.

1. **Start the Firebase Emulators** (in a separate terminal):
   ```bash
   firebase emulators:start --only functions
   ```

2. **Start the React App**:
   ```bash
   npm run dev
   ```
   The server will print `Network: https://192.168.1.156:5173/` — this confirms HTTPS is active.

3. **On your mobile browser**, navigate to:
   ```
   https://192.168.1.156.nip.io:5173
   ```

4. **Accept the certificate warning**: Chrome/Safari will show a "connection not private" warning because the certificate is self-signed. Tap **Advanced → Proceed** to continue. This is safe for local testing.

> **Note:** Your local IP (`192.168.1.156`) may change if your router reassigns it. If the setup stops working, run `ipconfig`, update the `nip.io` address accordingly in Firebase and Google Cloud Console, and update the note above.

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