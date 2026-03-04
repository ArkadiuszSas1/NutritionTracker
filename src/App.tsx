import { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Diary } from './components/Diary';
import { Login } from './components/Login';
import { NutritionProvider } from './hooks/useNutrition';

// Using a placeholder Client ID if one is not provided in env vars.
// The user must configure this later in Netlify or their local .env file.
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'diary'>('dashboard');
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('google_access_token'));

  const handleSetToken = (token: string) => {
    localStorage.setItem('google_access_token', token);
    setAccessToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('google_access_token');
    setAccessToken(null);
  };

  if (!accessToken) {
    return (
      <GoogleOAuthProvider clientId={CLIENT_ID}>
        <Login onSuccess={handleSetToken} />
      </GoogleOAuthProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <NutritionProvider accessToken={accessToken}>
        <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
          {activeTab === 'dashboard' ? <Dashboard /> : <Diary />}
        </Layout>
      </NutritionProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
