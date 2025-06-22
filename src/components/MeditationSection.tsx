import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
    Brain,
    Heart,
    Flower,
    Sun,
    Moon,
    Star,
    Eye,
    Waves,
    TreePine,
    Sparkles,
    Play,
    Lock,
    Search,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

interface MeditationMethod {
    id: string;
    title: string;
    description: string;
    videoId: string;
    benefits: string[];
    duration: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    icon: React.ReactNode;
    color: string;
}

interface CustomMeditationVideo {
    id: string;
    title: string;
    videoId: string;
    description: string;
    duration: string;
    thumbnail: string;
}

interface UsageData {
    count: number;
    lastUsed: string;
}

interface MeditationSectionProps {
    user: User | null;
}

const MAX_FREE_TRIES = 3;

const meditationMethods: MeditationMethod[] = [
    {
        id: 'mindfulness',
        title: 'Mindfulness Meditation',
        description: 'Cultivates non-judgmental awareness of the present moment by observing thoughts, sensations, and emotions as they arise, often anchored to the breath',
        videoId: 'ZToicYcHIOU',
        benefits: ['Reduces stress and anxiety', 'Improves focus and concentration', 'Enhances emotional regulation', 'Increases self-awareness'],
        duration: '10-20 minutes',
        difficulty: 'Beginner',
        icon: <Brain className="w-6 h-6" />,
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'body-scan',
        title: 'Body Scan Meditation',
        description: 'Involves systematically moving attention through the body, noticing and releasing tension in each area—a form of progressive relaxation',
        videoId: 'u4gZgnCy5ew',
        benefits: ['Releases physical tension', 'Improves body awareness', 'Promotes deep relaxation', 'Enhances sleep quality'],
        duration: '15-30 minutes',
        difficulty: 'Beginner',
        icon: <TreePine className="w-6 h-6" />,
        color: 'from-green-500 to-emerald-500'
    },
    {
        id: 'loving-kindness',
        title: 'Loving-Kindness (Metta) Meditation',
        description: 'Focuses on generating compassion by silently repeating phrases like "May I/you be happy, safe, and at peace," extending goodwill outward',
        videoId: 'sz7cpV7ERsM',
        benefits: ['Increases compassion and empathy', 'Reduces negative emotions', 'Improves relationships', 'Enhances emotional well-being'],
        duration: '10-25 minutes',
        difficulty: 'Beginner',
        icon: <Heart className="w-6 h-6" />,
        color: 'from-pink-500 to-rose-500'
    },
    {
        id: 'mantra',
        title: 'Mantra Meditation',
        description: 'Centers the mind on the repetition of a word or sound (e.g., "Om") to cultivate focus and inner calm',
        videoId: 'g0omXSVTeq0',
        benefits: ['Deepens concentration', 'Calms mental chatter', 'Connects to spiritual essence', 'Reduces stress'],
        duration: '15-30 minutes',
        difficulty: 'Intermediate',
        icon: <Sparkles className="w-6 h-6" />,
        color: 'from-purple-500 to-violet-500'
    },
    {
        id: 'transcendental',
        title: 'Transcendental Meditation (TM)',
        description: 'Practiced for 15–20 minutes twice daily, silently repeating a personal mantra to move the mind toward "pure awareness"',
        videoId: 'fO3AnD2QbIg',
        benefits: ['Reduces stress deeply', 'Improves cognitive function', 'Enhances creativity', 'Promotes restful alertness'],
        duration: '15-20 minutes',
        difficulty: 'Advanced',
        icon: <Sun className="w-6 h-6" />,
        color: 'from-yellow-500 to-orange-500'
    },
    {
        id: 'guided-imagery',
        title: 'Guided Imagery (Visualization) Meditation',
        description: 'Uses vivid mental images—such as peaceful landscapes—to promote deep relaxation and stress relief',
        videoId: 't1rRo6cgM_E',
        benefits: ['Reduces anxiety and stress', 'Enhances imagination', 'Promotes healing', 'Improves mood'],
        duration: '10-30 minutes',
        difficulty: 'Beginner',
        icon: <Eye className="w-6 h-6" />,
        color: 'from-indigo-500 to-purple-500'
    },
    {
        id: 'breathing',
        title: 'Focused Breathing Meditation',
        description: 'Involves deliberate attention on the breath (e.g., box breathing) to anchor the mind and reduce anxiety',
        videoId: 'VUjiXcfKBn8',
        benefits: ['Calms nervous system', 'Reduces anxiety quickly', 'Improves lung capacity', 'Easy to practice anywhere'],
        duration: '5-15 minutes',
        difficulty: 'Beginner',
        icon: <Waves className="w-6 h-6" />,
        color: 'from-teal-500 to-cyan-500'
    },
    {
        id: 'walking',
        title: 'Walking Meditation',
        description: 'A movement-based practice where each step is taken with full awareness of the body\'s sensations and the environment',
        videoId: 'ShG6kISrHoU',
        benefits: ['Combines exercise with mindfulness', 'Improves balance and coordination', 'Connects with nature', 'Energizes the body'],
        duration: '10-30 minutes',
        difficulty: 'Beginner',
        icon: <TreePine className="w-6 h-6" />,
        color: 'from-green-500 to-lime-500'
    },
    {
        id: 'chakra',
        title: 'Chakra Meditation',
        description: 'Focuses on tuning into and balancing the body\'s seven energy centers (chakras) often through visualization and gentle breathwork',
        videoId: 'P_ri2uy9Hgs',
        benefits: ['Balances energy centers', 'Enhances spiritual awareness', 'Promotes emotional healing', 'Increases vitality'],
        duration: '20-45 minutes',
        difficulty: 'Intermediate',
        icon: <Flower className="w-6 h-6" />,
        color: 'from-violet-500 to-purple-500'
    },
    {
        id: 'progressive-muscle',
        title: 'Progressive Muscle Relaxation',
        description: 'Entails sequentially tensing and then relaxing major muscle groups to cultivate deep physical and mental relaxation',
        videoId: '2IJUD-e14FY',
        benefits: ['Releases muscle tension', 'Reduces physical stress', 'Improves sleep quality', 'Lowers blood pressure'],
        duration: '15-30 minutes',
        difficulty: 'Beginner',
        icon: <Moon className="w-6 h-6" />,
        color: 'from-slate-500 to-gray-500'
    }
];

export const MeditationSection: React.FC<MeditationSectionProps> = ({ user }) => {
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [expandedMethods, setExpandedMethods] = useState<Set<string>>(new Set());
    const [customRequest, setCustomRequest] = useState('');
    const [customVideos, setCustomVideos] = useState<CustomMeditationVideo[]>([]);
    const [loadingCustom, setLoadingCustom] = useState(false);
    const [customUsage, setCustomUsage] = useState<UsageData>({ count: 0, lastUsed: '' });

    React.useEffect(() => {
        const loadUsageData = async () => {
            if (!user) return;

            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();

                    if (userData.customMeditationUsage) {
                        setCustomUsage(userData.customMeditationUsage);
                    } else {
                        setCustomUsage({ count: 0, lastUsed: '' });
                    }
                }
            } catch (error) {
                console.error('Error loading custom meditation usage:', error);
                setCustomUsage({ count: 0, lastUsed: '' });
            }
        };

        loadUsageData();
    }, [user]);

    const updateCustomUsage = async () => {
        if (!user) return;

        const newUsage = {
            count: customUsage.count + 1,
            lastUsed: new Date().toISOString()
        };

        setCustomUsage(newUsage);

        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                customMeditationUsage: newUsage
            });
        } catch (error) {
            console.error('Error updating custom meditation usage:', error);
        }
    };

    const canUseCustomMeditation = () => {
        return customUsage.count < MAX_FREE_TRIES;
    };

    const toggleExpansion = (methodId: string) => {
        const newExpanded = new Set(expandedMethods);
        if (newExpanded.has(methodId)) {
            newExpanded.delete(methodId);
        } else {
            newExpanded.add(methodId);
        }
        setExpandedMethods(newExpanded);
    };

    const searchCustomMeditation = async () => {
        if (!canUseCustomMeditation()) {
            alert('You have exhausted your free custom meditation searches. Please upgrade to premium for unlimited access.');
            return;
        }

        if (!customRequest.trim()) {
            alert('Please describe what kind of meditation you\'re looking for');
            return;
        }

        setLoadingCustom(true);

        try {
            const searchQuery = `guided meditation ${customRequest.trim()}`;

            const mockVideos: CustomMeditationVideo[] = [
                {
                    id: '1',
                    title: `Guided Meditation for ${customRequest}`,
                    videoId: 'ZToicYcHIOU',
                    description: `A soothing guided meditation session focused on ${customRequest}`,
                    duration: '15 minutes',
                    thumbnail: `https://img.youtube.com/vi/ZToicYcHIOU/maxresdefault.jpg`
                },
                {
                    id: '2',
                    title: `Deep Relaxation Meditation - ${customRequest}`,
                    videoId: 'u4gZgnCy5ew',
                    description: `Experience deep relaxation and peace with this ${customRequest} meditation`,
                    duration: '20 minutes',
                    thumbnail: `https://img.youtube.com/vi/u4gZgnCy5ew/maxresdefault.jpg`
                },
                {
                    id: '3',
                    title: `Healing Meditation for ${customRequest}`,
                    videoId: 'sz7cpV7ERsM',
                    description: `A gentle healing meditation designed to help with ${customRequest}`,
                    duration: '25 minutes',
                    thumbnail: `https://img.youtube.com/vi/sz7cpV7ERsM/maxresdefault.jpg`
                }
            ];

            setCustomVideos(mockVideos);
            await updateCustomUsage();
        } catch (error) {
            console.error('Error searching for custom meditation:', error);
            alert('Sorry, there was an error searching for meditations. Please try again.');
        } finally {
            setLoadingCustom(false);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return 'text-green-400 bg-green-500/20';
            case 'Intermediate': return 'text-yellow-400 bg-yellow-500/20';
            case 'Advanced': return 'text-red-400 bg-red-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="flex items-center justify-center gap-3 mb-6">
                    <Brain className="w-10 h-10 text-blue-400" />
                    <Flower className="w-10 h-10 text-purple-400" />
                    <h2 className="text-4xl font-bold text-white">Guided Meditation Center</h2>
                    <Heart className="w-10 h-10 text-pink-400" />
                    <Star className="w-10 h-10 text-yellow-400" />
                </div>
                <p className="text-cosmic-200 text-lg max-w-4xl mx-auto">
                    Discover inner peace and tranquility through expert-guided meditation practices.
                    Choose from proven techniques to reduce stress, enhance focus, and cultivate mindfulness.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl p-8 border border-purple-400/30">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Search className="w-6 h-6 text-purple-400" />
                            Custom AI Meditation Finder
                        </h3>

                        {user ? (
                            !canUseCustomMeditation() ? (
                                <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2">
                                    <p className="text-red-300 text-sm flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Free searches exhausted
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg px-4 py-2">
                                    <p className="text-purple-300 text-sm">
                                        Free searches: {MAX_FREE_TRIES - customUsage.count}
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg px-4 py-2">
                                <p className="text-yellow-300 text-sm">
                                    Sign in to use AI search
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-white font-semibold mb-2">
                                Describe what you need meditation for:
                            </label>
                            <textarea
                                value={customRequest}
                                onChange={(e) => setCustomRequest(e.target.value)}
                                placeholder="e.g., anxiety relief, better sleep, stress from work, healing from heartbreak, confidence boost..."
                                rows={3}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-purple-400 transition-colors resize-none"
                                disabled={!user || !canUseCustomMeditation()}
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={searchCustomMeditation}
                            disabled={!user || !canUseCustomMeditation() || loadingCustom || !customRequest.trim()}
                            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loadingCustom ? (
                                <>
                                    <Search className="w-5 h-5 animate-pulse" />
                                    Searching for Perfect Meditation...
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5" />
                                    {user ? (canUseCustomMeditation() ? 'Find My Meditation' : 'Upgrade to Premium') : 'Sign in to Search'}
                                </>
                            )}
                        </motion.button>
                    </div>

                    {customVideos.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8"
                        >
                            <h4 className="text-lg font-bold text-white mb-4">
                                Personalized Meditation Recommendations:
                            </h4>
                            <div className="grid md:grid-cols-3 gap-4">
                                {customVideos.map((video) => (
                                    <div key={video.id} className="bg-white/10 rounded-lg p-4">
                                        <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${video.videoId}`}
                                                title={video.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="rounded-lg"
                                            ></iframe>
                                        </div>
                                        <h5 className="text-white font-semibold mb-2">{video.title}</h5>
                                        <p className="text-cosmic-200 text-sm mb-2">{video.description}</p>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-purple-300">{video.duration}</span>
                                            <div className="flex items-center gap-1 text-green-400">
                                                <Play className="w-3 h-3" />
                                                <span>Guided</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-blue-400" />
                    10 Essential Meditation Techniques
                </h3>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {meditationMethods.map((method) => (
                        <motion.div
                            key={method.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 cursor-pointer"
                            onClick={() => setSelectedMethod(selectedMethod === method.id ? null : method.id)}
                        >
                            <div className={`bg-gradient-to-r ${method.color} rounded-lg p-3 mb-4 w-fit`}>
                                {method.icon}
                            </div>

                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xl font-bold text-white">{method.title}</h4>
                                <div className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(method.difficulty)}`}>
                                    {method.difficulty}
                                </div>
                            </div>

                            <p className="text-cosmic-200 text-sm mb-4">{method.description}</p>

                            <div className="flex items-center justify-between text-xs text-cosmic-300 mb-4">
                                <span>Duration: {method.duration}</span>
                                <div className="flex items-center gap-1 text-green-400">
                                    <Play className="w-3 h-3" />
                                    <span>Video Guide</span>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpansion(method.id);
                                }}
                                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                            >
                                {expandedMethods.has(method.id) ? (
                                    <>
                                        <ChevronUp className="w-4 h-4" />
                                        Show Less
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4" />
                                        Show Benefits
                                    </>
                                )}
                            </button>

                            {expandedMethods.has(method.id) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-4 pt-4 border-t border-white/20"
                                >
                                    <p className="text-sm text-blue-300 mb-2 font-semibold">Benefits:</p>
                                    <ul className="text-cosmic-200 text-sm space-y-1">
                                        {method.benefits.map((benefit, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <Star className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                                                {benefit}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {selectedMethod && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    {(() => {
                        const method = meditationMethods.find(m => m.id === selectedMethod);
                        if (!method) return null;

                        return (
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                        {method.icon}
                                        {method.title}
                                    </h3>
                                    <button
                                        onClick={() => setSelectedMethod(null)}
                                        className="text-cosmic-300 hover:text-white transition-colors"
                                    >
                                        ✕ Close
                                    </button>
                                </div>

                                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${method.videoId}`}
                                        title={method.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="rounded-lg"
                                    ></iframe>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-lg font-bold text-white mb-3">About This Practice</h4>
                                        <p className="text-cosmic-200 text-sm mb-4">{method.description}</p>
                                        <div className="flex gap-4 text-sm">
                                            <span className="text-blue-300">Duration: {method.duration}</span>
                                            <span className={`${getDifficultyColor(method.difficulty)} px-2 py-1 rounded`}>
                                                {method.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white mb-3">Key Benefits</h4>
                                        <ul className="space-y-2">
                                            {method.benefits.map((benefit, index) => (
                                                <li key={index} className="flex items-start gap-2 text-cosmic-200 text-sm">
                                                    <Star className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                                    {benefit}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/20"
            >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-golden-400" />
                    Meditation Tips for Success
                </h3>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="bg-blue-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Brain className="w-8 h-8 text-blue-400" />
                        </div>
                        <h4 className="text-white font-semibold mb-2">Start Small</h4>
                        <p className="text-cosmic-200 text-sm">
                            Begin with just 5-10 minutes daily and gradually increase duration
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="bg-green-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <TreePine className="w-8 h-8 text-green-400" />
                        </div>
                        <h4 className="text-white font-semibold mb-2">Find Your Space</h4>
                        <p className="text-cosmic-200 text-sm">
                            Create a quiet, comfortable environment free from distractions
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="bg-purple-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Heart className="w-8 h-8 text-purple-400" />
                        </div>
                        <h4 className="text-white font-semibold mb-2">Be Patient</h4>
                        <p className="text-cosmic-200 text-sm">
                            Remember that meditation is a practice - progress comes with time
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="bg-yellow-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Star className="w-8 h-8 text-yellow-400" />
                        </div>
                        <h4 className="text-white font-semibold mb-2">Stay Consistent</h4>
                        <p className="text-cosmic-200 text-sm">
                            Regular daily practice is more beneficial than longer infrequent sessions
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}; 