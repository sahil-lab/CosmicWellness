import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { VideoPlayer } from './VideoPlayer';
import { PaymentModal } from './PaymentModal';
import { getAngelGuidance, calculateLifePathNumber } from '../services/aiService';
import { AngelGuidance, AngelGuidanceRequest } from '../types';
import { zodiacSigns } from '../data/zodiacSigns';
import {
    Sparkles,
    Heart,
    Star,

    Calendar,
    Clock,
    Gem,
    Palette,
    Hash,
    MessageCircle,
    Play,
    Lock
} from 'lucide-react';

const ANGEL_GUIDANCE_STORAGE_KEY = 'angelGuidanceUsage';
const MAX_FREE_TRIES = 3;

interface AngelGuidanceUsage {
    count: number;
    lastUsed: string;
}

export const AngelGuidanceSection: React.FC = () => {
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('');
    const [selectedZodiac, setSelectedZodiac] = useState('');
    const [problem, setProblem] = useState('');
    const [lifePathNumber, setLifePathNumber] = useState<number | null>(null);
    const [guidance, setGuidance] = useState<AngelGuidance | null>(null);
    const [loading, setLoading] = useState(false);
    const [usage, setUsage] = useState<AngelGuidanceUsage>({ count: 0, lastUsed: '' });
    const [showPayment, setShowPayment] = useState(false);

    useEffect(() => {
        // Load usage data from localStorage
        const storedUsage = localStorage.getItem(ANGEL_GUIDANCE_STORAGE_KEY);
        if (storedUsage) {
            setUsage(JSON.parse(storedUsage));
        }
    }, []);

    useEffect(() => {
        // Calculate life path number when birth date changes
        if (birthDate && birthDate.length >= 8) {
            const lifePathNum = calculateLifePathNumber(birthDate);
            setLifePathNumber(lifePathNum);
        }
    }, [birthDate]);

    const updateUsage = () => {
        const newUsage = {
            count: usage.count + 1,
            lastUsed: new Date().toISOString()
        };
        setUsage(newUsage);
        localStorage.setItem(ANGEL_GUIDANCE_STORAGE_KEY, JSON.stringify(newUsage));
    };

    const canUseService = () => {
        return usage.count < MAX_FREE_TRIES;
    };

    const handleGetGuidance = async () => {
        if (!canUseService()) {
            setShowPayment(true);
            return;
        }

        if (!birthDate || !selectedZodiac || !problem.trim() || !lifePathNumber) {
            alert('Please fill in all required fields (birth date, zodiac sign, and problem description)');
            return;
        }

        setLoading(true);
        try {
            const request: AngelGuidanceRequest = {
                birthDate,
                birthTime,
                zodiacSign: selectedZodiac,
                problem,
                lifePathNumber
            };

            const angelGuidance = await getAngelGuidance(request);
            setGuidance(angelGuidance);
            updateUsage();
        } catch (error) {
            console.error('Error getting angel guidance:', error);
            alert('Sorry, there was an error getting your angel guidance. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        // Reset usage count after successful payment
        const resetUsage = { count: 0, lastUsed: new Date().toISOString() };
        setUsage(resetUsage);
        localStorage.setItem(ANGEL_GUIDANCE_STORAGE_KEY, JSON.stringify(resetUsage));
        setShowPayment(false);

        // Automatically get guidance after payment
        handleGetGuidance();
    };

    const formatBirthDate = (value: string) => {
        // Remove all non-digit characters
        const digits = value.replace(/\D/g, '');

        // Format as DD/MM/YYYY
        if (digits.length >= 2) {
            let formatted = digits.substring(0, 2);
            if (digits.length >= 4) {
                formatted += '/' + digits.substring(2, 4);
                if (digits.length >= 8) {
                    formatted += '/' + digits.substring(4, 8);
                } else if (digits.length > 4) {
                    formatted += '/' + digits.substring(4);
                }
            } else if (digits.length > 2) {
                formatted += '/' + digits.substring(2);
            }
            return formatted;
        }
        return digits;
    };

    const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatBirthDate(e.target.value);
        setBirthDate(formatted);
    };

    const remainingTries = MAX_FREE_TRIES - usage.count;

    return (
        <div className="w-full max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="w-8 h-8 text-mystical-400" />
                    <h2 className="text-3xl font-bold text-white">Angel Guidance</h2>
                </div>
                <p className="text-cosmic-200 text-lg max-w-2xl mx-auto">
                    Connect with divine wisdom to receive personalized spiritual guidance, healing stones, mantras, and subliminal recommendations
                </p>

                {!canUseService() ? (
                    <div className="mt-4 p-4 bg-golden-500/20 border border-golden-400/30 rounded-lg">
                        <p className="text-golden-200 flex items-center justify-center gap-2">
                            <Lock className="w-4 h-4" />
                            You've used all your free tries. Upgrade to premium for unlimited access!
                        </p>
                    </div>
                ) : (
                    <div className="mt-4 p-3 bg-mystical-500/20 border border-mystical-400/30 rounded-lg">
                        <p className="text-mystical-200">
                            Free tries remaining: <span className="font-bold text-mystical-300">{remainingTries}</span>
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Input Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-8"
            >
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Birth Date */}
                    <div>
                        <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-mystical-400" />
                            Birth Date *
                        </label>
                        <input
                            type="text"
                            value={birthDate}
                            onChange={handleBirthDateChange}
                            placeholder="DD/MM/YYYY"
                            maxLength={10}
                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-mystical-400 transition-colors"
                        />
                        {lifePathNumber && (
                            <p className="text-mystical-300 text-sm mt-2">
                                Life Path Number: <span className="font-bold">{lifePathNumber}</span>
                            </p>
                        )}
                    </div>

                    {/* Birth Time (Optional) */}
                    <div>
                        <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cosmic-400" />
                            Birth Time (Optional)
                        </label>
                        <input
                            type="time"
                            value={birthTime}
                            onChange={(e) => setBirthTime(e.target.value)}
                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-mystical-400 transition-colors"
                        />
                    </div>

                    {/* Zodiac Sign */}
                    <div>
                        <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                            <Star className="w-4 h-4 text-golden-400" />
                            Zodiac Sign *
                        </label>
                        <select
                            value={selectedZodiac}
                            onChange={(e) => setSelectedZodiac(e.target.value)}
                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-mystical-400 transition-colors"
                        >
                            <option value="">Select your zodiac sign</option>
                            {zodiacSigns.map((sign) => (
                                <option key={sign.id} value={sign.name} className="bg-cosmic-800">
                                    {sign.symbol} {sign.name} ({sign.dates})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Problem Description */}
                    <div className="md:col-span-2">
                        <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-mystical-400" />
                            Describe Your Problem/Situation *
                        </label>
                        <textarea
                            value={problem}
                            onChange={(e) => setProblem(e.target.value)}
                            placeholder="Tell the angels about your current situation, challenges, or what guidance you're seeking..."
                            rows={4}
                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-mystical-400 transition-colors resize-none"
                        />
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGetGuidance}
                    disabled={loading || !birthDate || !selectedZodiac || !problem.trim()}
                    className="mt-6 w-full bg-gradient-to-r from-mystical-500 to-golden-500 hover:from-mystical-600 hover:to-golden-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Sparkles className="w-5 h-5 animate-spin" />
                            Connecting with Angels...
                        </>
                    ) : (
                        <>
                            <Heart className="w-5 h-5" />
                            {canUseService() ? 'Get Angel Guidance' : 'Upgrade to Premium'}
                        </>
                    )}
                </motion.button>
            </motion.div>

            {/* Guidance Results */}
            {guidance && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Angel Message */}
                    <div className="bg-gradient-to-br from-mystical-500/20 to-golden-500/20 rounded-xl p-6 border border-mystical-400/30">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-mystical-400" />
                            Divine Message
                        </h3>
                        <p className="text-cosmic-100 leading-relaxed">{guidance.message}</p>
                    </div>

                    {/* Life Path Number */}
                    <div className="bg-gradient-to-br from-golden-500/20 to-mystical-500/20 rounded-xl p-6 border border-golden-400/30">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Hash className="w-5 h-5 text-golden-400" />
                            Life Path Number {guidance.lifePathNumber}
                        </h3>
                        <p className="text-cosmic-100 leading-relaxed">{guidance.lifePathMeaning}</p>
                    </div>

                    {/* Guidance Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Healing Stones */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                                <Gem className="w-4 h-4 text-mystical-400" />
                                Healing Stones
                            </h4>
                            <ul className="space-y-2">
                                {guidance.stones.map((stone, index) => (
                                    <li key={index} className="text-cosmic-200 text-sm">
                                        • {stone}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Lucky Color */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                                <Palette className="w-4 h-4 text-golden-400" />
                                Lucky Color
                            </h4>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-6 h-6 rounded-full border-2 border-white/30"
                                    style={{ backgroundColor: guidance.luckyColor.toLowerCase() }}
                                ></div>
                                <span className="text-cosmic-200">{guidance.luckyColor}</span>
                            </div>
                        </div>

                        {/* Lucky Number */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                                <Hash className="w-4 h-4 text-cosmic-400" />
                                Lucky Number
                            </h4>
                            <div className="text-3xl font-bold text-mystical-400">
                                {guidance.luckyNumber}
                            </div>
                        </div>

                        {/* Mantra */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-golden-400" />
                                Daily Mantra
                            </h4>
                            <p className="text-cosmic-200 text-sm italic">
                                "{guidance.mantra}"
                            </p>
                        </div>
                    </div>

                    {/* Subliminal Video */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Play className="w-5 h-5 text-mystical-400" />
                            Recommended Subliminal Video
                        </h3>
                        <VideoPlayer videos={[guidance.subliminalVideo]} />
                    </div>
                </motion.div>
            )}

            {/* Payment Modal */}
            {showPayment && (
                <PaymentModal
                    isOpen={showPayment}
                    onClose={() => setShowPayment(false)}
                    onSuccess={handlePaymentSuccess}
                    amount={199}
                    description="Angel Guidance Premium Access - Get unlimited access to personalized angel guidance, healing recommendations, and spiritual insights."
                />
            )}
        </div>
    );
}; 