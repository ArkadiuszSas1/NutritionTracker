import { Home, Book, PlusCircle, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { GeminiService } from '../services/GeminiService';
import { useNutrition } from '../hooks/useNutrition';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: 'dashboard' | 'diary';
    setActiveTab: (tab: 'dashboard' | 'diary') => void;
    onLogout: () => void;
}

export function Layout({ children, activeTab, setActiveTab, onLogout }: LayoutProps) {
    const [isUploaderOpen, setIsUploaderOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { addMeal } = useNutrition();

    const handleMealAdd = async (data: { imageBase64?: string; textDescription?: string }) => {
        setIsUploaderOpen(false); // Close the modal immediately
        setIsAnalyzing(true);     // Show loading state

        try {
            // 1. Send to Gemini
            const analysis = await GeminiService.analyzeFood(data);

            // 2. Format for Google Sheets (adding ID, Date, Time)
            const now = new Date();
            const newMeal = {
                id: crypto.randomUUID(),
                date: now.toISOString().split('T')[0],
                time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                foodName: analysis.foodName,
                calories: analysis.calories,
                protein: analysis.protein,
                carbs: analysis.carbs,
                fat: analysis.fat
            };

            // 3. Save to Google Sheets Context
            await addMeal(newMeal);

            // Switch to diary to see the new meal
            setActiveTab('dashboard');

        } catch (error) {
            console.error(error);
            alert('Failed to analyze the image or save the meal. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:pl-64 flex flex-col font-sans">
            {/* Top Header */}
            <header className="bg-white sticky top-0 z-10 shadow-sm px-4 py-3 flex justify-between items-center md:hidden">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Nutrition Tracker
                </h1>
                <button className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors cursor-pointer">
                    <Settings size={20} />
                </button>
            </header>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-20 shadow-sm">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md pb-0.5">N</div>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">Tracker</h1>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    <NavItem
                        icon={<Home size={22} />}
                        label="Dashboard"
                        isActive={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <NavItem
                        icon={<Book size={22} />}
                        label="Diary"
                        isActive={activeTab === 'diary'}
                        onClick={() => setActiveTab('diary')}
                    />
                </nav>

                <div className="p-4 border-t border-gray-50">
                    <button onClick={onLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer">
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-8 animate-in fade-in duration-300 relative">
                {children}
            </main>

            {/* Analysis Loading Overlay */}
            {isAnalyzing && (
                <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="w-24 h-24 relative mb-6">
                        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl animate-pulse">✨</span>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing your meal...</h2>
                    <p className="text-gray-500 font-medium">Gemini AI is estimating calories and macros.</p>
                </div>
            )}

            {/* Floating Action Button (Mobile) */}
            <div className="fixed bottom-24 right-4 md:hidden z-20">
                <button onClick={() => setIsUploaderOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-105 transition-all active:scale-95 cursor-pointer">
                    <PlusCircle size={28} />
                </button>
            </div>

            {/* Desktop Add Button (in sidebar) */}
            <div className="hidden md:block absolute bottom-24 left-4 right-4 z-20">
                <button onClick={() => setIsUploaderOpen(true)} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 cursor-pointer">
                    <PlusCircle size={20} />
                    Add Meal
                </button>
            </div>

            {isUploaderOpen && (
                <ImageUploader
                    onMealAdded={handleMealAdd}
                    onCancel={() => setIsUploaderOpen(false)}
                />
            )}

            {/* Bottom Navigation (Mobile) */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 pb-safe z-30 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                <div className="flex justify-around items-center h-16">
                    <MobileNavItem
                        icon={<Home size={24} />}
                        label="Dashboard"
                        isActive={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    {/* Invisible placeholder for FAB spacing */}
                    <div className="w-16 h-full" />
                    <MobileNavItem
                        icon={<Book size={24} />}
                        label="Diary"
                        isActive={activeTab === 'diary'}
                        onClick={() => setActiveTab('diary')}
                    />
                </div>
            </nav>
        </div>
    );
}

// Nav helpers
function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all cursor-pointer ${isActive
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }`}
        >
            <div className={`${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                {icon}
            </div>
            <span>{label}</span>
        </button>
    );
}

function MobileNavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors cursor-pointer ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
        >
            <div className={`${isActive ? 'scale-110 drop-shadow-sm' : ''} transition-transform duration-200`}>
                {icon}
            </div>
            <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{label}</span>
        </button>
    );
}
