import { useGoogleLogin } from '@react-oauth/google';

interface LoginProps {
    onSuccess: (accessToken: string) => void;
}

export function Login({ onSuccess }: LoginProps) {
    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            onSuccess(tokenResponse.access_token);
        },
        // Requesting profile, email, Google Sheets access, and Google Drive (file level) access to search for the file
        scope: 'profile email https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
        prompt: 'consent' // Forces Google to show the consent screen so new scopes are properly granted
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
            {/* Decorative background gradients */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-1/3 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/50 relative z-10">
                <div className="p-10 space-y-8">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-4xl shadow-lg mb-4">
                            N
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Nutrition Tracker</h1>
                        <p className="text-gray-500 font-medium text-sm">Your daily nutrition, analyzed with AI.</p>

                        <div className="text-left bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                            <h2 className="text-sm font-semibold text-gray-800 mb-2">What we track:</h2>
                            <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4 marker:text-blue-500">
                                <li><strong>Macros:</strong> Calories, Protein, Carbs, Fat</li>
                                <li><strong>Carbs info:</strong> Fiber, Net Carbs, Added Sugars</li>
                                <li><strong>Fat info:</strong> Sat/Mono/Poly, Omega-3/6</li>
                                <li><strong>Quality:</strong> NOVA Grade (1-4), Glycemic Load</li>
                                <li><strong>Impact:</strong> Energy Level estimates</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={() => login()}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-semibold py-3.5 px-6 rounded-2xl shadow-sm transition-all focus:ring-4 focus:ring-blue-100 cursor-pointer"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                <svg />
                            </svg>
                            Continue with Google
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
                            By continuing, you grant access to your Google Sheets<br />to save your meal data securely.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
