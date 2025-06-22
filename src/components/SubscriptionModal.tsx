import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Crown, Star, Sparkles, Zap } from 'lucide-react';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: string;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, feature }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleSignUp = () => {
        navigate('/register');
    };

    const handleSignIn = () => {
        navigate('/login');
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gradient-to-br from-cosmic-800 to-mystical-800 rounded-2xl p-8 max-w-md w-full border border-golden-400/30 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Crown className="w-6 h-6 text-golden-400" />
                        <h2 className="text-2xl font-bold text-white">Subscription Required</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-cosmic-300 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-center gap-2 mb-4"
                    >
                        <Star className="w-12 h-12 text-golden-400" />
                        <Sparkles className="w-12 h-12 text-mystical-400" />
                    </motion.div>

                    <h3 className="text-xl font-semibold text-white mb-3">
                        Free trials for {feature} exhausted!
                    </h3>

                    <p className="text-cosmic-200 mb-6">
                        Create an account to unlock unlimited access to all premium features including:
                    </p>

                    <div className="space-y-3 text-left">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-golden-400" />
                            <span className="text-cosmic-100">Unlimited AI Palm Reading</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-mystical-400" />
                            <span className="text-cosmic-100">Comprehensive Kundli Analysis</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-golden-400" />
                            <span className="text-cosmic-100">Personalized Angel Guidance</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-mystical-400" />
                            <span className="text-cosmic-100">Emergency Spiritual Consultations</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-golden-400" />
                            <span className="text-cosmic-100">Daily Horoscopes & Predictions</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSignUp}
                        className="w-full bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <Crown className="w-5 h-5" />
                        Create Free Account
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSignIn}
                        className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                    >
                        Already have an account? Sign In
                    </motion.button>
                </div>

                <div className="text-center mt-6">
                    <p className="text-cosmic-300 text-sm">
                        Join thousands of users on their spiritual journey
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default SubscriptionModal; 