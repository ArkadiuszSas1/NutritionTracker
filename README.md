# Nutrition Tracker

A premium, mobile-first web application designed to track your daily nutrition effortlessly using AI-powered image recognition and Google Sheets as a secure, personal database.

## Features

- **AI Image Recognition**: Snap a photo or upload an image of your meal, and Google Gemini AI will automatically estimate calories and macronutrients (Protein, Carbs, Fat).
- **Personal Data Ownership**: All your data is stored in a private Google Sheet named "Nutrition Tracker Data" in your own Google Drive.
- **Daily Dashboard**: Visualize your progress against daily goals with a sleek, modern UI.
- **Historical Diary**: Browse your past entries and observe your nutritional trends.
- **Secure Authentication**: Log in securely using your own Google account.

---

## Setup & Configuration

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A Google Account

### 2. Google Cloud Configuration (OAuth Client ID)

To enable Google Login and Google Sheets integration, you must set up a project in the Google Cloud Console:

1.  Go to the **[Google Cloud Console](https://console.cloud.google.com/)**.
2.  Create a new project (e.g., "Nutrition Tracker").
3.  **Enable APIs**:
    - Search for and enable the **Google Sheets API**.
    - Search for and enable the **Google Drive API**.
4.  **Configure OAuth Consent Screen**:
    - Select **User Type**: "External" (or "Internal" if you have a Google Workspace).
    - Fill in the required app information (App name, support email, developer contact).
    - **Add Scopes**:
        - `auth/userinfo.email`
        - `auth/userinfo.profile`
        - `https://www.googleapis.com/auth/spreadsheets`
        - `https://www.googleapis.com/auth/drive.file`
    - **Add Test Users**: Add your own Google email address as a test user while the app is in "Testing" status.
5.  **Create Credentials**:
    - Go to the **Credentials** tab.
    - Click **Create Credentials** -> **OAuth client ID**.
    - Select **Web application**.
    - **Authorized JavaScript origins**: Add `http://localhost:5173`.
    - **Authorized redirect URIs**: Add `http://localhost:5173`.
    - Copy your **Client ID**.

### 3. Google Gemini AI API Key

To enable the AI food analysis, you need an API key from Google AI Studio:

1.  Go to **[Google AI Studio](https://aistudio.google.com/)**.
2.  In the left sidebar, click **"Get API key"**.
3.  Click **"Create API key in existing project"** and select your "Nutrition Tracker" project.
4.  Copy your **API Key**.

---

## Environment Setup

Create a file named `.env.local` in the root directory of the project and add your credentials:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## Running the Application

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Start the development server**:
    ```bash
    npm run dev
    ```
3.  Open your browser to `http://localhost:5173`.

## Deployment

This app is designed to be deployed to **Netlify** or **Vercel**. When deploying, ensure you add the environment variables (`VITE_GOOGLE_CLIENT_ID` and `VITE_GEMINI_API_KEY`) to your deployment settings and add your production URL to the "Authorized JavaScript origins" in Google Cloud Console.
