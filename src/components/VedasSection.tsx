import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Star,
    Heart,
    Sparkles,
    Sun,
    Moon,
    Flame,
    Flower,
    Crown,
    Shield,
    Scroll,
    Eye,
    ChevronDown,
    ChevronUp,
    Play,
    Pause
} from 'lucide-react';

interface VedicText {
    id: string;
    title: string;
    category: string;
    description: string;
    chapters: number;
    verses: number;
    significance: string;
    benefits: string[];
    icon: React.ReactNode;
    color: string;
}

interface HanumanChalisaVerse {
    id: string;
    verseNumber: number;
    hindi: string;
    transliteration: string;
    english: string;
    meaning: string;
}

interface VedicTextWithVideo extends VedicText {
    videoId?: string;
    videoTitle?: string;
    videoArtist?: string;
}

const vedicTexts: VedicTextWithVideo[] = [
    {
        id: 'hanuman-chalisa',
        title: 'Hanuman Chalisa',
        category: 'Devotional',
        description: 'The most powerful hymn dedicated to Lord Hanuman, written by Tulsidas',
        chapters: 1,
        verses: 40,
        significance: 'Removes obstacles, grants courage, and provides protection from negative energies',
        benefits: ['Removes fear and anxiety', 'Grants courage and strength', 'Protects from evil forces', 'Improves devotion'],
        icon: <Heart className="w-6 h-6" />,
        color: 'from-red-500 to-orange-500',
        videoId: 'qbhXS_tmmy8',
        videoTitle: 'Hanuman Chalisa',
        videoArtist: 'Suresh Wadkar'
    },
    {
        id: 'bhagavad-gita',
        title: 'Bhagavad Gita',
        category: 'Scripture',
        description: 'Divine dialogue between Prince Arjuna and Lord Krishna on the battlefield of Kurukshetra',
        chapters: 18,
        verses: 700,
        significance: 'Ultimate guide to righteous living and spiritual enlightenment',
        benefits: ['Provides life guidance', 'Teaches dharma', 'Removes confusion', 'Grants wisdom'],
        icon: <Crown className="w-6 h-6" />,
        color: 'from-blue-500 to-purple-500',
        videoId: 'E53GuZ8NFQw',
        videoTitle: 'Bhagavad Gita Chant Series',
        videoArtist: 'ISKCON'
    },
    {
        id: 'shiva-sutras',
        title: 'Shiva Sutras',
        category: 'Philosophy',
        description: 'Sacred Kashmir Shaivism text revealing the nature of consciousness',
        chapters: 3,
        verses: 77,
        significance: 'Reveals the path to self-realization and divine consciousness',
        benefits: ['Awakens consciousness', 'Grants inner wisdom', 'Removes ignorance', 'Leads to moksha'],
        icon: <Flame className="w-6 h-6" />,
        color: 'from-purple-500 to-indigo-500',
        videoId: 'Oz3dkPzqQ7s',
        videoTitle: 'Shiva Sutras of Vasugupta – Part 1',
        videoArtist: 'Swami Haribrahmendrananda'
    },
    {
        id: 'vishnu-sahasranama',
        title: 'Vishnu Sahasranama',
        category: 'Devotional',
        description: 'Thousand names of Lord Vishnu from the Mahabharata',
        chapters: 1,
        verses: 107,
        significance: 'Invokes divine protection and blessings of Lord Vishnu',
        benefits: ['Removes sins', 'Grants prosperity', 'Provides protection', 'Increases devotion'],
        icon: <Sun className="w-6 h-6" />,
        color: 'from-yellow-500 to-orange-500',
        videoId: 'ATflA6WOy0I',
        videoTitle: 'Vishnu Sahasranamam',
        videoArtist: 'M.S. Subbulakshmi'
    },
    {
        id: 'durga-saptashati',
        title: 'Durga Saptashati',
        category: 'Devotional',
        description: 'Seven hundred verses glorifying Goddess Durga from Markandeya Purana',
        chapters: 13,
        verses: 700,
        significance: 'Invokes the divine feminine energy and removes all obstacles',
        benefits: ['Removes obstacles', 'Grants strength', 'Protects from enemies', 'Brings prosperity'],
        icon: <Shield className="w-6 h-6" />,
        color: 'from-red-500 to-pink-500',
        videoId: 'cfNt_XNYZOk',
        videoTitle: 'Durga Saptashati – Complete 13 Adhyayas',
        videoArtist: 'Sanskrit Guided Chant'
    },
    {
        id: 'gayatri-mantra',
        title: 'Gayatri Mantra',
        category: 'Mantra',
        description: 'Most sacred Vedic mantra for enlightenment and wisdom',
        chapters: 1,
        verses: 1,
        significance: 'Purifies mind and grants divine wisdom',
        benefits: ['Purifies mind', 'Grants wisdom', 'Removes ignorance', 'Awakens consciousness'],
        icon: <Sparkles className="w-6 h-6" />,
        color: 'from-gold-500 to-yellow-500',
        videoId: '6Kb0q9J8lPA',
        videoTitle: 'Gayatri Mantra – 108 Times With Lyrics',
        videoArtist: 'Traditional Chant'
    },
    {
        id: 'lalita-sahasranama',
        title: 'Lalita Sahasranama',
        category: 'Devotional',
        description: 'Thousand names of Goddess Lalita Devi from Brahmanda Purana',
        chapters: 1,
        verses: 1000,
        significance: 'Invokes the grace of the Divine Mother',
        benefits: ['Grants beauty', 'Removes obstacles', 'Brings prosperity', 'Grants wisdom'],
        icon: <Flower className="w-6 h-6" />,
        color: 'from-pink-500 to-purple-500',
        videoId: 'DtSBLpQStT4',
        videoTitle: 'Sri Lalitha Sahasranamam – Full With Lyrics',
        videoArtist: 'Traditional Rendition'
    },
    {
        id: 'rig-veda-mantras',
        title: 'Rig Veda Mantras',
        category: 'Vedas',
        description: 'Selected powerful mantras from the oldest Vedic text',
        chapters: 10,
        verses: 1028,
        significance: 'Contains the most ancient spiritual wisdom of humanity',
        benefits: ['Connects to cosmic energy', 'Grants knowledge', 'Purifies atmosphere', 'Brings peace'],
        icon: <BookOpen className="w-6 h-6" />,
        color: 'from-green-500 to-blue-500',
        videoId: 'xCQCSN38KYY',
        videoTitle: 'Rig Veda – Full Chanting',
        videoArtist: 'Vedic Scholars'
    }
];

const hanumanChalisaVerses: HanumanChalisaVerse[] = [
    {
        id: '1',
        verseNumber: 1,
        hindi: 'श्रीगुरु चरन सरोज रज, निज मन मुकुर सुधारि।',
        transliteration: 'Shri Guru charan saroj raj, nij man mukur sudhari.',
        english: 'With the dust of my Guru\'s lotus feet, I cleanse the mirror of my mind.',
        meaning: 'Purifying the mind with reverence to the Guru to receive divine wisdom'
    },
    {
        id: '2',
        verseNumber: 2,
        hindi: 'बरनउं रघुबर बिमल जसु, जो दायकु फल चारि।।',
        transliteration: 'Baranaun Raghubar bimal jasu, jo dayaku phal chari.',
        english: 'I sing the pure glory of Lord Rama, which grants the four fruits of life.',
        meaning: 'Praising Lord Rama grants dharma, artha, kama, and moksha'
    },
    {
        id: '3',
        verseNumber: 3,
        hindi: 'बुद्धिहीन तनु जानिके, सुमिरौं पवन-कुमार।',
        transliteration: 'Buddhihin tanu janike, sumiron pavan-kumar.',
        english: 'Knowing my body to be devoid of intelligence, I remember the son of the wind.',
        meaning: 'Humbly seeking Hanuman\'s grace to overcome ignorance'
    },
    {
        id: '4',
        verseNumber: 4,
        hindi: 'बल बुद्धि विद्या देहु मोहिं, हरहु कलेस विकार।।',
        transliteration: 'Bal buddhi vidya dehu mohin, harahu kalesh vikar.',
        english: 'Grant me strength, intelligence, and knowledge, remove my afflictions and disorders.',
        meaning: 'Prayer for physical strength, mental clarity, and removal of suffering'
    },
    {
        id: '5',
        verseNumber: 5,
        hindi: 'जय हनुमान ज्ञान गुन सागर। जय कपीस तिहुं लोक उजागर।।',
        transliteration: 'Jai Hanuman gyan gun sagar. Jai Kapis tihun lok ujagar.',
        english: 'Victory to Hanuman, the ocean of wisdom and virtue. Victory to the lord of monkeys who illuminates the three worlds.',
        meaning: 'Praising Hanuman as the embodiment of wisdom and the illuminator of all realms'
    },
    {
        id: '6',
        verseNumber: 6,
        hindi: 'राम दूत अतुलित बल धामा। अंजनि-पुत्र पवनसुत नामा।।',
        transliteration: 'Ram doot atulit bal dhama. Anjani-putra Pavansut nama.',
        english: 'You are Rama\'s messenger, the abode of incomparable strength. Son of Anjani, you are known as Pavansut.',
        meaning: 'Acknowledging Hanuman as Rama\'s devoted messenger and son of the wind god'
    },
    {
        id: '7',
        verseNumber: 7,
        hindi: 'महाबीर विक्रम बजरंगी। कुमति निवार सुमति के संगी।।',
        transliteration: 'Mahaveer Vikram Bajrangi. Kumati nivar sumati ke sangi.',
        english: 'Great hero, brave and strong as diamond. Destroyer of evil thoughts and companion of good sense.',
        meaning: 'Praising Hanuman\'s heroic nature and his power to remove negative thoughts'
    },
    {
        id: '8',
        verseNumber: 8,
        hindi: 'कंचन बरन बिराज सुबेसा। कानन कुंडल कुंचित केसा।।',
        transliteration: 'Kanchan varan viraaj subesa. Kanan kundal kunchit kesa.',
        english: 'Golden complexioned, beautifully adorned. Wearing earrings and curly hair.',
        meaning: 'Describing Hanuman\'s divine and beautiful appearance'
    }
];

export const VedasSection: React.FC = () => {
    const [selectedText, setSelectedText] = useState<string | null>(null);
    const [expandedTexts, setExpandedTexts] = useState<Set<string>>(new Set());
    const [activeChapter, setActiveChapter] = useState<number>(1);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentVerse, setCurrentVerse] = useState<number>(0);

    const toggleExpansion = (textId: string) => {
        const newExpanded = new Set(expandedTexts);
        if (newExpanded.has(textId)) {
            newExpanded.delete(textId);
        } else {
            newExpanded.add(textId);
        }
        setExpandedTexts(newExpanded);
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
        // Here you would implement audio playback logic
    };

    const nextVerse = () => {
        if (currentVerse < hanumanChalisaVerses.length - 1) {
            setCurrentVerse(currentVerse + 1);
        }
    };

    const prevVerse = () => {
        if (currentVerse > 0) {
            setCurrentVerse(currentVerse - 1);
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
                    <BookOpen className="w-10 h-10 text-golden-400" />
                    <Flower className="w-10 h-10 text-mystical-400" />
                    <h2 className="text-4xl font-bold text-white">Sacred Vedas & Scriptures</h2>
                    <Flame className="w-10 h-10 text-orange-400" />
                    <Star className="w-10 h-10 text-yellow-400" />
                </div>
                <p className="text-cosmic-200 text-lg max-w-4xl mx-auto">
                    Explore the timeless wisdom of Hindu scriptures, mantras, and devotional texts.
                    Connect with divine knowledge that has guided humanity for millennia.
                </p>
            </motion.div>

            {/* Scripture Library */}
            <div className="grid lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Scroll className="w-6 h-6 text-golden-400" />
                        Sacred Texts Library
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        {vedicTexts.map((text) => (
                            <motion.div
                                key={text.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 cursor-pointer"
                                onClick={() => {
                                    setSelectedText(selectedText === text.id ? null : text.id);
                                    if (text.id === 'hanuman-chalisa') {
                                        setCurrentVerse(0);
                                    }
                                }}
                            >
                                <div className={`bg-gradient-to-r ${text.color} rounded-lg p-3 mb-4 w-fit`}>
                                    {text.icon}
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xl font-bold text-white">{text.title}</h4>
                                    {text.videoId && (
                                        <div className="flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded-full">
                                            <Play className="w-3 h-3 text-red-400" />
                                            <span className="text-red-300 text-xs">Audio</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-mystical-300 text-sm mb-3">{text.category}</p>
                                <p className="text-cosmic-200 text-sm mb-4">{text.description}</p>

                                <div className="flex justify-between text-xs text-cosmic-300 mb-4">
                                    <span>Chapters: {text.chapters}</span>
                                    <span>Verses: {text.verses}</span>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleExpansion(text.id);
                                    }}
                                    className="text-golden-400 hover:text-golden-300 text-sm flex items-center gap-1"
                                >
                                    {expandedTexts.has(text.id) ? (
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

                                {expandedTexts.has(text.id) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-4 pt-4 border-t border-white/20"
                                    >
                                        <p className="text-sm text-golden-300 mb-3 font-semibold">Significance:</p>
                                        <p className="text-cosmic-200 text-sm mb-3">{text.significance}</p>

                                        <p className="text-sm text-green-300 mb-2 font-semibold">Benefits:</p>
                                        <ul className="text-cosmic-200 text-sm space-y-1">
                                            {text.benefits.map((benefit, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <Star className="w-3 h-3 text-golden-400 mt-0.5 flex-shrink-0" />
                                                    {benefit}
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Hanuman Chalisa Reader */}
                <div className="lg:col-span-1">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 sticky top-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Heart className="w-6 h-6 text-red-400" />
                            Hanuman Chalisa
                        </h3>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-cosmic-300 text-sm">
                                    Verse {currentVerse + 1} of {hanumanChalisaVerses.length}
                                </span>
                                <button
                                    onClick={togglePlay}
                                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                >
                                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg p-4 mb-4">
                                <div className="text-center">
                                    <p className="text-xl font-bold text-white mb-2 leading-relaxed">
                                        {hanumanChalisaVerses[currentVerse]?.hindi}
                                    </p>
                                    <p className="text-red-300 mb-3 italic">
                                        {hanumanChalisaVerses[currentVerse]?.transliteration}
                                    </p>
                                    <p className="text-cosmic-200 text-sm mb-3">
                                        {hanumanChalisaVerses[currentVerse]?.english}
                                    </p>
                                    <div className="border-t border-white/20 pt-3">
                                        <p className="text-golden-300 text-sm">
                                            <span className="font-semibold">Meaning: </span>
                                            {hanumanChalisaVerses[currentVerse]?.meaning}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    onClick={prevVerse}
                                    disabled={currentVerse === 0}
                                    className="bg-mystical-500 hover:bg-mystical-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={nextVerse}
                                    disabled={currentVerse === hanumanChalisaVerses.length - 1}
                                    className="bg-mystical-500 hover:bg-mystical-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>

                        {/* Daily Verse */}
                        <div className="bg-gradient-to-r from-golden-500/20 to-yellow-500/20 rounded-lg p-4">
                            <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <Sun className="w-5 h-5 text-golden-400" />
                                Daily Verse
                            </h4>
                            <p className="text-cosmic-200 text-sm mb-2">
                                "Rama Rama Kahi Rama Kahi, Rama Rama Kahi Rama"
                            </p>
                            <p className="text-golden-300 text-xs">
                                Chanting the name of Rama purifies the heart and brings divine blessings
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selected Text Content Viewer */}
            {selectedText && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-white">
                                {vedicTexts.find(text => text.id === selectedText)?.title}
                            </h3>
                            <button
                                onClick={() => setSelectedText(null)}
                                className="text-cosmic-300 hover:text-white transition-colors"
                            >
                                ✕ Close
                            </button>
                        </div>

                        {selectedText === 'hanuman-chalisa' && (
                            <div className="space-y-6">
                                {/* Video Player */}
                                <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg p-6">
                                    <div className="text-center mb-4">
                                        <h4 className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
                                            <Play className="w-5 h-5" />
                                            Listen to Hanuman Chalisa
                                        </h4>
                                        <p className="text-cosmic-200 text-sm mb-2">
                                            Traditional chanting by Suresh Wadkar
                                        </p>
                                    </div>
                                    <div className="relative w-full max-w-4xl mx-auto">
                                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/qbhXS_tmmy8`}
                                                title="Hanuman Chalisa - Suresh Wadkar"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="rounded-lg"
                                            ></iframe>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg p-6">
                                    <div className="text-center mb-4">
                                        <h4 className="text-lg font-bold text-white mb-2">
                                            Complete Hanuman Chalisa
                                        </h4>
                                        <p className="text-cosmic-200 text-sm">
                                            Read the complete verses with meanings
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {hanumanChalisaVerses.map((verse) => (
                                            <div key={verse.id} className="bg-white/10 rounded-lg p-4">
                                                <div className="text-center mb-3">
                                                    <span className="text-red-300 text-sm font-semibold">
                                                        Verse {verse.verseNumber}
                                                    </span>
                                                </div>
                                                <p className="text-xl font-bold text-white mb-2 text-center leading-relaxed">
                                                    {verse.hindi}
                                                </p>
                                                <p className="text-red-300 mb-2 text-center italic text-sm">
                                                    {verse.transliteration}
                                                </p>
                                                <p className="text-cosmic-200 text-sm mb-2 text-center">
                                                    {verse.english}
                                                </p>
                                                <div className="border-t border-white/20 pt-2">
                                                    <p className="text-golden-300 text-xs text-center">
                                                        <span className="font-semibold">Meaning: </span>
                                                        {verse.meaning}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedText === 'bhagavad-gita' && (
                            <div className="space-y-6">
                                {/* Video Player */}
                                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-6">
                                    <div className="text-center mb-4">
                                        <h4 className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
                                            <Play className="w-5 h-5" />
                                            Listen to Bhagavad Gita
                                        </h4>
                                        <p className="text-cosmic-200 text-sm mb-2">
                                            Sanskrit chanting by ISKCON
                                        </p>
                                    </div>
                                    <div className="relative w-full max-w-4xl mx-auto">
                                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/E53GuZ8NFQw`}
                                                title="Bhagavad Gita Chant Series - ISKCON"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="rounded-lg"
                                            ></iframe>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-6">
                                    <h4 className="text-lg font-bold text-white mb-4">Bhagavad Gita - Key Verses</h4>
                                    <div className="space-y-4">
                                        <div className="bg-white/10 rounded-lg p-4">
                                            <h5 className="text-blue-300 font-semibold mb-2">Chapter 2, Verse 47</h5>
                                            <p className="text-white mb-2">कर्मण्येवाधिकारस्ते मा फलेषु कदाचन</p>
                                            <p className="text-cosmic-200 text-sm mb-2">You have the right to perform actions, but not to the fruits of action.</p>
                                            <p className="text-golden-300 text-xs">This verse teaches the importance of performing duty without attachment to results.</p>
                                        </div>
                                        <div className="bg-white/10 rounded-lg p-4">
                                            <h5 className="text-blue-300 font-semibold mb-2">Chapter 7, Verse 3</h5>
                                            <p className="text-white mb-2">मनुष्याणां सहस्रेषु कश्चिद्यतति सिद्धये</p>
                                            <p className="text-cosmic-200 text-sm mb-2">Among thousands of men, hardly one strives for perfection.</p>
                                            <p className="text-golden-300 text-xs">This verse emphasizes the rarity of those who seek spiritual enlightenment.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedText === 'gayatri-mantra' && (
                            <div className="space-y-6">
                                {/* Video Player */}
                                <div className="bg-gradient-to-r from-golden-500/20 to-yellow-500/20 rounded-lg p-6">
                                    <div className="text-center mb-4">
                                        <h4 className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
                                            <Play className="w-5 h-5" />
                                            Listen to Gayatri Mantra
                                        </h4>
                                        <p className="text-cosmic-200 text-sm mb-2">
                                            108 times with lyrics - Traditional chant
                                        </p>
                                    </div>
                                    <div className="relative w-full max-w-4xl mx-auto">
                                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/6Kb0q9J8lPA`}
                                                title="Gayatri Mantra - 108 Times With Lyrics"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="rounded-lg"
                                            ></iframe>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-golden-500/20 to-yellow-500/20 rounded-lg p-6">
                                    <h4 className="text-lg font-bold text-white mb-4 text-center">Gayatri Mantra</h4>
                                    <div className="text-center space-y-4">
                                        <p className="text-2xl font-bold text-white leading-relaxed">
                                            ॐ भूर्भुवः स्वः<br />
                                            तत्सवितुर्वरेण्यं<br />
                                            भर्गो देवस्य धीमहि<br />
                                            धियो यो नः प्रचोदयात्
                                        </p>
                                        <p className="text-golden-300 italic">
                                            Om Bhur Bhuvaḥ Svaḥ<br />
                                            Tat Savitur Vareṇyaṃ<br />
                                            Bhargo Devasya Dhīmahi<br />
                                            Dhiyo Yo Naḥ Prachodayāt
                                        </p>
                                        <p className="text-cosmic-200">
                                            "We meditate on the glory of that Being who has produced this universe;
                                            may He enlighten our minds."
                                        </p>
                                        <div className="bg-white/10 rounded-lg p-4">
                                            <h5 className="text-golden-300 font-semibold mb-2">How to Chant:</h5>
                                            <ul className="text-cosmic-200 text-sm space-y-1">
                                                <li>• Best time: Early morning during sunrise</li>
                                                <li>• Chant 108 times daily</li>
                                                <li>• Face east while chanting</li>
                                                <li>• Visualize the sun's divine light</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedText && !['hanuman-chalisa', 'bhagavad-gita', 'gayatri-mantra'].includes(selectedText) && (
                            <div className="space-y-6">
                                {(() => {
                                    const currentText = vedicTexts.find(text => text.id === selectedText);
                                    return currentText?.videoId ? (
                                        <div className="bg-white/10 rounded-lg p-6">
                                            <div className="text-center mb-4">
                                                <h4 className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
                                                    <Play className="w-5 h-5" />
                                                    Listen to {currentText.title}
                                                </h4>
                                                <p className="text-cosmic-200 text-sm mb-2">
                                                    {currentText.videoTitle} - {currentText.videoArtist}
                                                </p>
                                            </div>
                                            <div className="relative w-full max-w-4xl mx-auto">
                                                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                                    <iframe
                                                        width="100%"
                                                        height="100%"
                                                        src={`https://www.youtube.com/embed/${currentText.videoId}`}
                                                        title={`${currentText.videoTitle} - ${currentText.videoArtist}`}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        className="rounded-lg"
                                                    ></iframe>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}

                                <div className="bg-white/10 rounded-lg p-6">
                                    <p className="text-cosmic-200 text-center">
                                        More content for {vedicTexts.find(text => text.id === selectedText)?.title} coming soon...
                                        <br />
                                        <span className="text-golden-300 text-sm">
                                            This sacred text contains profound wisdom for spiritual growth.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Featured Mantras */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-golden-400" />
                    Sacred Mantras
                </h3>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Gayatri Mantra */}
                    <div className="bg-gradient-to-br from-golden-500/20 to-yellow-500/20 rounded-xl p-6 border border-golden-400/30">
                        <div className="flex items-center gap-3 mb-4">
                            <Sun className="w-8 h-8 text-golden-400" />
                            <h4 className="text-lg font-bold text-white">Gayatri Mantra</h4>
                        </div>
                        <p className="text-sm text-cosmic-200 mb-3">
                            ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्
                        </p>
                        <p className="text-xs text-golden-300">
                            The most sacred mantra for wisdom and enlightenment
                        </p>
                    </div>

                    {/* Mahamrityunjaya Mantra */}
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-400/30">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-8 h-8 text-blue-400" />
                            <h4 className="text-lg font-bold text-white">Mahamrityunjaya</h4>
                        </div>
                        <p className="text-sm text-cosmic-200 mb-3">
                            ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात्
                        </p>
                        <p className="text-xs text-blue-300">
                            Powerful mantra for healing and protection from death
                        </p>
                    </div>

                    {/* Ganesha Mantra */}
                    <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl p-6 border border-red-400/30">
                        <div className="flex items-center gap-3 mb-4">
                            <Crown className="w-8 h-8 text-red-400" />
                            <h4 className="text-lg font-bold text-white">Ganesha Mantra</h4>
                        </div>
                        <p className="text-sm text-cosmic-200 mb-3">
                            ॐ गं गणपतये नमः
                        </p>
                        <p className="text-xs text-red-300">
                            Removes obstacles and grants success in all endeavors
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Reading Guidelines */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/20"
            >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Eye className="w-6 h-6 text-mystical-400" />
                    Guidelines for Sacred Reading
                </h3>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="bg-mystical-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Flower className="w-8 h-8 text-mystical-400" />
                        </div>
                        <h4 className="text-white font-semibold mb-2">Purification</h4>
                        <p className="text-cosmic-200 text-sm">
                            Cleanse your mind and space before reading sacred texts
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="bg-golden-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Sun className="w-8 h-8 text-golden-400" />
                        </div>
                        <h4 className="text-white font-semibold mb-2">Best Times</h4>
                        <p className="text-cosmic-200 text-sm">
                            Early morning (Brahma Muhurta) and evening are most auspicious
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="bg-green-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Heart className="w-8 h-8 text-green-400" />
                        </div>
                        <h4 className="text-white font-semibold mb-2">Devotion</h4>
                        <p className="text-cosmic-200 text-sm">
                            Read with sincere devotion and an open heart
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="bg-purple-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Star className="w-8 h-8 text-purple-400" />
                        </div>
                        <h4 className="text-white font-semibold mb-2">Consistency</h4>
                        <p className="text-cosmic-200 text-sm">
                            Regular practice amplifies the spiritual benefits
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}; 