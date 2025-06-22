import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Star, Sparkles, User } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "13214695469-rfc1tg3lftkkj9dq57js7rj5ugsinjaj.apps.googleusercontent.com";

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleEmailRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate inputs
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password should be at least 6 characters.');
            return;
        }

        setLoading(true);

        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update profile with display name
            await updateProfile(user, {
                displayName: name
            });

            // Store additional user data in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                displayName: name,
                email: user.email,
                photoURL: user.photoURL,
                createdAt: serverTimestamp(),
                subscription: 'free',
                subscriptionExpiry: null,
                palmistryUsage: { count: 0, lastUsed: '' },
                kundliUsage: { count: 0, lastUsed: '' },
                angelGuidanceUsage: { count: 0, lastUsed: '' },
            });

            navigate('/');
        } catch (err: any) {
            let errorMessage = 'Failed to register. Please try again.';
            if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered.';
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setError('');
        setLoading(true);

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Store user data in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                displayName: user.displayName || 'New User',
                email: user.email,
                photoURL: user.photoURL,
                createdAt: serverTimestamp(),
                subscription: 'free',
                subscriptionExpiry: null,
                palmistryUsage: { count: 0, lastUsed: '' },
                kundliUsage: { count: 0, lastUsed: '' },
                angelGuidanceUsage: { count: 0, lastUsed: '' },
            });

            navigate('/');
        } catch (err: any) {
            console.error('Failed to register with Google:', err);
            setError('Failed to register with Google: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="min-h-screen bg-gradient-to-br from-cosmic-900 via-mystical-900 to-golden-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center justify-center gap-2 mb-4"
                            >
                                <Star className="w-8 h-8 text-golden-400" />
                                <Sparkles className="w-8 h-8 text-mystical-400" />
                            </motion.div>
                            <h1 className="text-3xl font-bold text-white mb-2">Join the Journey</h1>
                            <p className="text-cosmic-200">Create your account to unlock cosmic wisdom</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-6"
                            >
                                <p className="text-red-300 text-sm">{error}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleEmailRegister} className="space-y-6">
                            <div>
                                <label className="block text-white font-medium mb-2">Full Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 pl-12 text-white placeholder-cosmic-400 focus:outline-none focus:border-golden-400 transition-colors"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cosmic-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-white font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-golden-400 transition-colors"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-white font-medium mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 pr-12 text-white placeholder-cosmic-400 focus:outline-none focus:border-golden-400 transition-colors"
                                        placeholder="Create a password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cosmic-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-white font-medium mb-2">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 pr-12 text-white placeholder-cosmic-400 focus:outline-none focus:border-golden-400 transition-colors"
                                        placeholder="Confirm your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cosmic-400 hover:text-white transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-mystical-500 to-mystical-600 hover:from-mystical-600 hover:to-mystical-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </motion.button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/20"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-transparent text-cosmic-200">OR</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <GoogleLogin
                                onSuccess={handleGoogleRegister}
                                onError={() => {
                                    setError('Google sign-in failed');
                                }}
                                theme="filled_blue"
                                size="large"
                                width="100%"
                            />
                        </div>

                        <div className="text-center mt-6">
                            <p className="text-cosmic-200">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="text-golden-400 hover:text-golden-300 font-semibold transition-colors"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default Register; 