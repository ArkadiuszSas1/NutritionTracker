import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Diary } from './components/Diary';
import { Login } from './components/Login';
import { NutritionProvider } from './hooks/useNutrition';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'diary'>('dashboard');
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUserId(null);
  };

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!userId) {
    return <Login onSuccess={setUserId} />;
  }

  return (
    <NutritionProvider userId={userId}>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
        {activeTab === 'dashboard' ? <Dashboard /> : <Diary />}
      </Layout>
    </NutritionProvider>
  );
}

export default App;
