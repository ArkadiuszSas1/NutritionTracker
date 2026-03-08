import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';

interface LoginProps {
    onSuccess: (userId: string) => void;
}

export function Login({ onSuccess }: LoginProps) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        setIsLoading(true);

        try {
            if (isRegistering) {
                const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
                onSuccess(result.user.uid);
            } else {
                const result = await signInWithEmailAndPassword(auth, email.trim(), password);
                onSuccess(result.user.uid);
            }
        } catch (err: any) {
            console.error("Authentication error", err);

            // Map common Firebase errors to user-friendly messages
            if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                setError('Invalid email or password.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Email is already registered.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else {
                setError(err.message || 'An error occurred during authentication.');
            }
        } finally {
            setIsLoading(false);
        }
    };

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
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100/50">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white border border-gray-200 text-gray-900 rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white border border-gray-200 text-gray-900 rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all focus:ring-4 focus:ring-blue-500/50 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                isRegistering ? 'Create Account' : 'Sign In'
                            )}
                        </button>

                        <div className="text-center mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRegistering(!isRegistering);
                                    setError('');
                                }}
                                className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                            >
                                {isRegistering
                                    ? 'Already have an account? Sign in'
                                    : "Don't have an account? Register"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
