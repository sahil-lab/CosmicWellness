import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
    Apple,
    Heart,
    Activity,
    Zap,
    Leaf,
    Coffee,
    Clock,
    BookOpen,
    ExternalLink,
    Play,
    Lock,
    Loader2,
    ChevronDown,
    ChevronUp,
    Utensils,
    Pill,
    Droplets,
    Brain,
    Sunrise,
    Sunset,
    Wind,
    Star
} from 'lucide-react';

import { getDietRecommendations } from '../services/aiService';
import { HealthProfile, DietRecommendation } from '../types';

interface UsageData {
    count: number;
    lastUsed: string;
}

interface DietSupplementsSectionProps {
    user: User | null;
}

const MAX_FREE_CONSULTATIONS = 3;

const commonConditions = [
    'Diabetes', 'Hypertension', 'Obesity', 'Heart Disease', 'Digestive Issues',
    'Anxiety', 'Depression', 'Insomnia', 'Arthritis', 'Thyroid Issues',
    'PCOD/PCOS', 'Cholesterol', 'Kidney Stones', 'Liver Issues', 'Skin Problems'
];

const dietaryRestrictions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto',
    'Low-Carb', 'Low-Fat', 'No Spicy Food', 'No Nuts', 'Jain Food'
];

export const DietSupplementsSection: React.FC<DietSupplementsSectionProps> = ({ user }) => {
    const [healthProfile, setHealthProfile] = useState<HealthProfile>({
        height: '',
        weight: '',
        age: '',
        gender: '',
        medicalHistory: [],
        currentMedications: '',
        allergies: '',
        fitnessLevel: 'Beginner',
        healthGoals: '',
        dietaryRestrictions: [],
        description: ''
    });

    const [recommendations, setRecommendations] = useState<DietRecommendation | null>(null);
    const [loading, setLoading] = useState(false);
    const [usage, setUsage] = useState<UsageData>({ count: 0, lastUsed: '' });
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    React.useEffect(() => {
        const loadUsageData = async () => {
            if (!user) return;

            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();

                    if (userData.dietSupplementsUsage) {
                        setUsage(userData.dietSupplementsUsage);
                    } else {
                        setUsage({ count: 0, lastUsed: '' });
                    }
                }
            } catch (error) {
                console.error('Error loading diet supplements usage:', error);
                setUsage({ count: 0, lastUsed: '' });
            }
        };

        loadUsageData();
    }, [user]);

    const updateUsage = async () => {
        if (!user) return;

        const newUsage = {
            count: usage.count + 1,
            lastUsed: new Date().toISOString()
        };

        setUsage(newUsage);

        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                dietSupplementsUsage: newUsage
            });
        } catch (error) {
            console.error('Error updating diet supplements usage:', error);
        }
    };

    const canUseService = () => {
        return usage.count < MAX_FREE_CONSULTATIONS;
    };

    const toggleSection = (sectionId: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    const handleMedicalHistoryChange = (condition: string, checked: boolean) => {
        setHealthProfile(prev => ({
            ...prev,
            medicalHistory: checked
                ? [...prev.medicalHistory, condition]
                : prev.medicalHistory.filter(c => c !== condition)
        }));
    };

    const handleDietaryRestrictionsChange = (restriction: string, checked: boolean) => {
        setHealthProfile(prev => ({
            ...prev,
            dietaryRestrictions: checked
                ? [...prev.dietaryRestrictions, restriction]
                : prev.dietaryRestrictions.filter(r => r !== restriction)
        }));
    };

    const generateRecommendations = async () => {
        if (!canUseService()) {
            alert('You have exhausted your free consultations. Please upgrade to premium for unlimited access.');
            return;
        }

        if (!healthProfile.description.trim()) {
            alert('Please describe your health goals or concerns');
            return;
        }

        setLoading(true);

        try {
            console.log('🏥 Generating AI-powered diet recommendations for:', healthProfile);

            // Call the AI service to get personalized recommendations
            const aiRecommendations = await getDietRecommendations(healthProfile);

            console.log('✅ Received AI recommendations:', aiRecommendations);
            setRecommendations(aiRecommendations);
            await updateUsage();
        } catch (error) {
            console.error('❌ Error generating recommendations:', error);
            alert('Sorry, there was an error generating your recommendations. Please try again.');
        } finally {
            setLoading(false);
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
                    <Apple className="w-10 h-10 text-green-400" />
                    <Heart className="w-10 h-10 text-red-400" />
                    <h2 className="text-4xl font-bold text-white">Diet & Supplements Center</h2>
                    <Leaf className="w-10 h-10 text-green-400" />
                    <Activity className="w-10 h-10 text-blue-400" />
                </div>
                <p className="text-cosmic-200 text-lg max-w-4xl mx-auto">
                    Get personalized diet plans, home remedies, and supplement recommendations based on your health profile.
                    Includes recipes, exercise routines, and Ayurvedic guidance for optimal wellness.
                </p>
            </motion.div>

            {/* Health Profile Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl p-8 border border-green-400/30">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Heart className="w-6 h-6 text-red-400" />
                            Health Profile Assessment
                        </h3>

                        {user ? (
                            !canUseService() ? (
                                <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2">
                                    <p className="text-red-300 text-sm flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Free consultations exhausted
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-green-500/20 border border-green-400/30 rounded-lg px-4 py-2">
                                    <p className="text-green-300 text-sm">
                                        Free consultations: {MAX_FREE_CONSULTATIONS - usage.count}
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg px-4 py-2">
                                <p className="text-yellow-300 text-sm">
                                    Sign in for personalized recommendations
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-white font-semibold mb-2">Height (cm/ft)</label>
                            <input
                                type="text"
                                value={healthProfile.height}
                                onChange={(e) => setHealthProfile(prev => ({ ...prev, height: e.target.value }))}
                                placeholder="e.g., 170 cm or 5'7"
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-green-400 transition-colors"
                                disabled={!user || !canUseService()}
                            />
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2">Weight (kg/lbs)</label>
                            <input
                                type="text"
                                value={healthProfile.weight}
                                onChange={(e) => setHealthProfile(prev => ({ ...prev, weight: e.target.value }))}
                                placeholder="e.g., 70 kg or 154 lbs"
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-green-400 transition-colors"
                                disabled={!user || !canUseService()}
                            />
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2">Age</label>
                            <input
                                type="number"
                                value={healthProfile.age}
                                onChange={(e) => setHealthProfile(prev => ({ ...prev, age: e.target.value }))}
                                placeholder="e.g., 30"
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-green-400 transition-colors"
                                disabled={!user || !canUseService()}
                            />
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2">Gender</label>
                            <select
                                value={healthProfile.gender}
                                onChange={(e) => setHealthProfile(prev => ({ ...prev, gender: e.target.value }))}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-400 transition-colors"
                                disabled={!user || !canUseService()}
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2">Fitness Level</label>
                            <select
                                value={healthProfile.fitnessLevel}
                                onChange={(e) => setHealthProfile(prev => ({ ...prev, fitnessLevel: e.target.value }))}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-400 transition-colors"
                                disabled={!user || !canUseService()}
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2">Current Medications</label>
                            <input
                                type="text"
                                value={healthProfile.currentMedications}
                                onChange={(e) => setHealthProfile(prev => ({ ...prev, currentMedications: e.target.value }))}
                                placeholder="List any medications"
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-green-400 transition-colors"
                                disabled={!user || !canUseService()}
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-white font-semibold mb-3">Medical History (Select all that apply)</label>
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                {commonConditions.map((condition) => (
                                    <label key={condition} className="flex items-center gap-2 text-cosmic-200 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={healthProfile.medicalHistory.includes(condition)}
                                            onChange={(e) => handleMedicalHistoryChange(condition, e.target.checked)}
                                            className="rounded"
                                            disabled={!user || !canUseService()}
                                        />
                                        {condition}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-3">Dietary Restrictions</label>
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                {dietaryRestrictions.map((restriction) => (
                                    <label key={restriction} className="flex items-center gap-2 text-cosmic-200 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={healthProfile.dietaryRestrictions.includes(restriction)}
                                            onChange={(e) => handleDietaryRestrictionsChange(restriction, e.target.checked)}
                                            className="rounded"
                                            disabled={!user || !canUseService()}
                                        />
                                        {restriction}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-white font-semibold mb-2">Health Goals</label>
                            <input
                                type="text"
                                value={healthProfile.healthGoals}
                                onChange={(e) => setHealthProfile(prev => ({ ...prev, healthGoals: e.target.value }))}
                                placeholder="e.g., weight loss, muscle gain, better digestion, increased energy"
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-green-400 transition-colors"
                                disabled={!user || !canUseService()}
                            />
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2">Allergies</label>
                            <input
                                type="text"
                                value={healthProfile.allergies}
                                onChange={(e) => setHealthProfile(prev => ({ ...prev, allergies: e.target.value }))}
                                placeholder="List any food allergies or sensitivities"
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-green-400 transition-colors"
                                disabled={!user || !canUseService()}
                            />
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2">Detailed Description</label>
                            <textarea
                                value={healthProfile.description}
                                onChange={(e) => setHealthProfile(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe your current health concerns, symptoms, or specific goals you want to achieve..."
                                rows={4}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-green-400 transition-colors resize-none"
                                disabled={!user || !canUseService()}
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={generateRecommendations}
                            disabled={!user || !canUseService() || loading || !healthProfile.description.trim()}
                            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating Your Personalized Plan...
                                </>
                            ) : (
                                <>
                                    <Heart className="w-5 h-5" />
                                    {user ? (canUseService() ? 'Get My Wellness Plan' : 'Upgrade to Premium') : 'Sign in for Recommendations'}
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Recommendations Display */}
            {recommendations && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Overview */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                        <h3 className="text-2xl font-bold text-white mb-4">{recommendations.title}</h3>
                        <p className="text-cosmic-200 mb-6">{recommendations.description}</p>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recommendations.benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-2 text-green-300">
                                    <Zap className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Meal Timing */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                        <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-400" />
                            Daily Meal Timing
                        </h4>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-cosmic-200">Wake Up:</span>
                                    <span className="text-white font-semibold">{recommendations.timing.wakeUp}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-cosmic-200">Breakfast:</span>
                                    <span className="text-white font-semibold">{recommendations.timing.breakfast}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-cosmic-200">Lunch:</span>
                                    <span className="text-white font-semibold">{recommendations.timing.lunch}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-cosmic-200">Dinner:</span>
                                    <span className="text-white font-semibold">{recommendations.timing.dinner}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-cosmic-200">Sleep:</span>
                                    <span className="text-white font-semibold">{recommendations.timing.sleep}</span>
                                </div>
                            </div>
                            <div className="bg-yellow-500/20 rounded-lg p-4">
                                <h5 className="text-yellow-300 font-semibold mb-2">Important Notes:</h5>
                                <p className="text-cosmic-200 text-sm">{recommendations.timing.notes}</p>
                            </div>
                        </div>
                    </div>

                    {/* Meal Plan */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Utensils className="w-5 h-5 text-orange-400" />
                            Daily Meal Plan
                        </h4>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Object.entries(recommendations.mealPlan).map(([mealType, foods]) => (
                                <div key={mealType} className="bg-white/5 rounded-lg p-4">
                                    <h5 className="text-white font-semibold mb-3 capitalize">{mealType}</h5>
                                    <ul className="space-y-2">
                                        {foods.map((food, index) => (
                                            <li key={index} className="flex items-start gap-2 text-cosmic-200 text-sm">
                                                <Apple className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                                                {food}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recipes */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-400" />
                            Healthy Recipes
                        </h4>
                        <div className="grid md:grid-cols-3 gap-6">
                            {recommendations.recipes.map((recipe, index) => (
                                <div key={index} className="bg-white/5 rounded-lg p-4">
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${recipe.videoId}`}
                                            title={recipe.name}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="rounded-lg"
                                        ></iframe>
                                    </div>
                                    <h5 className="text-white font-semibold mb-2">{recipe.name}</h5>
                                    <p className="text-cosmic-200 text-sm mb-2">Duration: {recipe.duration}</p>
                                    <div className="text-xs text-green-300">
                                        <span className="font-semibold">Ingredients: </span>
                                        {recipe.ingredients.join(', ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ayurvedic Supplements */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Pill className="w-5 h-5 text-green-400" />
                            Recommended Supplements
                        </h4>
                        <div className="grid md:grid-cols-3 gap-6">
                            {recommendations.supplements.map((supplement, index) => (
                                <div key={index} className="bg-white/5 rounded-lg p-4">
                                    <h5 className="text-white font-semibold mb-2">{supplement.name}</h5>
                                    <p className="text-blue-300 text-sm mb-2">Dosage: {supplement.dosage}</p>
                                    <p className="text-cosmic-200 text-sm mb-4">{supplement.benefits}</p>
                                    <a
                                        href={supplement.amazonLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Buy on Amazon
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Exercise Recommendations */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-red-400" />
                            Exercise Routines
                        </h4>
                        <div className="grid md:grid-cols-3 gap-6">
                            {recommendations.exercises.map((exercise, index) => (
                                <div key={index} className="bg-white/5 rounded-lg p-4">
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${exercise.videoId}`}
                                            title={exercise.name}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="rounded-lg"
                                        ></iframe>
                                    </div>
                                    <h5 className="text-white font-semibold mb-2">{exercise.name}</h5>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-blue-300">{exercise.duration}</span>
                                        <span className={`px-2 py-1 rounded text-xs ${exercise.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-300' :
                                            exercise.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                                                'bg-red-500/20 text-red-300'
                                            }`}>
                                            {exercise.difficulty}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Healthy Juices */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Droplets className="w-5 h-5 text-cyan-400" />
                            Healing Juices & Drinks
                        </h4>
                        <div className="grid md:grid-cols-3 gap-6">
                            {recommendations.juices.map((juice, index) => (
                                <div key={index} className="bg-white/5 rounded-lg p-4">
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${juice.videoId}`}
                                            title={juice.name}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="rounded-lg"
                                        ></iframe>
                                    </div>
                                    <h5 className="text-white font-semibold mb-2">{juice.name}</h5>
                                    <p className="text-cosmic-200 text-sm mb-2">{juice.benefits}</p>
                                    <div className="text-xs text-cyan-300">
                                        <span className="font-semibold">Ingredients: </span>
                                        {juice.ingredients.join(', ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Yoga & Asanas */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-orange-400" />
                            Personalized Yoga Practice
                        </h4>

                        {/* Morning Routine */}
                        <div className="mb-8">
                            <h5 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Sunrise className="w-5 h-5 text-yellow-400" />
                                Morning Routine
                            </h5>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${recommendations.yoga.morningRoutine.videoId}`}
                                            title={recommendations.yoga.morningRoutine.name}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="rounded-lg"
                                        ></iframe>
                                    </div>
                                    <h6 className="text-white font-semibold mb-2">{recommendations.yoga.morningRoutine.name}</h6>
                                    <p className="text-blue-300 text-sm mb-2">Duration: {recommendations.yoga.morningRoutine.duration}</p>
                                    <p className="text-cosmic-200 text-sm mb-3">{recommendations.yoga.morningRoutine.benefits}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4">
                                    <h6 className="text-white font-semibold mb-3">Morning Asanas</h6>
                                    <ul className="space-y-2">
                                        {recommendations.yoga.morningRoutine.asanas.map((asana, index) => (
                                            <li key={index} className="flex items-start gap-2 text-cosmic-200 text-sm">
                                                <Star className="w-3 h-3 text-yellow-400 mt-1 flex-shrink-0" />
                                                {asana}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Therapeutic Poses */}
                        <div className="mb-8">
                            <h5 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Heart className="w-5 h-5 text-red-400" />
                                Therapeutic Yoga
                            </h5>
                            <div className="grid md:grid-cols-2 gap-6">
                                {recommendations.yoga.therapeuticPoses.map((therapy, index) => (
                                    <div key={index} className="bg-white/5 rounded-lg p-4">
                                        <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${therapy.videoId}`}
                                                title={`Therapeutic Yoga for ${therapy.condition}`}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="rounded-lg"
                                            ></iframe>
                                        </div>
                                        <h6 className="text-white font-semibold mb-2">For {therapy.condition}</h6>
                                        <p className="text-cosmic-200 text-sm mb-3">{therapy.instructions}</p>
                                        <div className="text-xs text-green-300">
                                            <span className="font-semibold">Poses: </span>
                                            {therapy.poses.join(', ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pranayama */}
                        <div className="mb-8">
                            <h5 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Wind className="w-5 h-5 text-cyan-400" />
                                Pranayama (Breathing Techniques)
                            </h5>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${recommendations.yoga.pranayama.videoId}`}
                                            title={recommendations.yoga.pranayama.technique}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="rounded-lg"
                                        ></iframe>
                                    </div>
                                    <h6 className="text-white font-semibold mb-2">{recommendations.yoga.pranayama.technique}</h6>
                                    <p className="text-blue-300 text-sm mb-2">Duration: {recommendations.yoga.pranayama.duration}</p>
                                    <p className="text-cosmic-200 text-sm">{recommendations.yoga.pranayama.benefits}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4">
                                    <h6 className="text-white font-semibold mb-3">Practice Steps</h6>
                                    <ol className="space-y-2">
                                        {recommendations.yoga.pranayama.steps.map((step, index) => (
                                            <li key={index} className="flex items-start gap-2 text-cosmic-200 text-sm">
                                                <span className="text-cyan-400 font-semibold">{index + 1}.</span>
                                                {step}
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        </div>

                        {/* Evening Practice */}
                        <div>
                            <h5 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Sunset className="w-5 h-5 text-orange-400" />
                                Evening Practice
                            </h5>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${recommendations.yoga.eveningPractice.videoId}`}
                                            title={recommendations.yoga.eveningPractice.name}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="rounded-lg"
                                        ></iframe>
                                    </div>
                                    <h6 className="text-white font-semibold mb-2">{recommendations.yoga.eveningPractice.name}</h6>
                                    <p className="text-blue-300 text-sm mb-2">Duration: {recommendations.yoga.eveningPractice.duration}</p>
                                    <p className="text-cosmic-200 text-sm mb-3">{recommendations.yoga.eveningPractice.benefits}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4">
                                    <h6 className="text-white font-semibold mb-3">Evening Poses</h6>
                                    <ul className="space-y-2">
                                        {recommendations.yoga.eveningPractice.poses.map((pose, index) => (
                                            <li key={index} className="flex items-start gap-2 text-cosmic-200 text-sm">
                                                <Sunset className="w-3 h-3 text-orange-400 mt-1 flex-shrink-0" />
                                                {pose}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Meditation & Mantras */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-400" />
                            Meditation & Healing Mantras
                        </h4>
                        <div className="bg-white/5 rounded-lg p-6">
                            <h5 className="text-white font-semibold mb-4">{recommendations.meditation.method}</h5>

                            {/* Meditation Video */}
                            <div className="mb-6">
                                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${recommendations.meditation.videoId}`}
                                        title={recommendations.meditation.method}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="rounded-lg"
                                    ></iframe>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <p className="text-cosmic-200 mb-2">
                                        <span className="font-semibold text-purple-300">Duration:</span> {recommendations.meditation.duration}
                                    </p>
                                    <p className="text-cosmic-200 mb-4">
                                        <span className="font-semibold text-purple-300">Benefits:</span> {recommendations.meditation.benefits}
                                    </p>
                                </div>
                                <div className="bg-purple-500/20 rounded-lg p-4">
                                    <p className="text-purple-300 font-semibold mb-2">Healing Mantra:</p>
                                    <p className="text-white text-lg font-serif italic">{recommendations.meditation.mantra}</p>
                                </div>
                            </div>

                            {/* Meditation Instructions */}
                            <div className="bg-white/5 rounded-lg p-4">
                                <h6 className="text-white font-semibold mb-3 flex items-center gap-2">
                                    <Brain className="w-4 h-4 text-purple-400" />
                                    Step-by-Step Guide
                                </h6>
                                <ol className="space-y-2">
                                    {recommendations.meditation.instructions.map((instruction, index) => (
                                        <li key={index} className="flex items-start gap-3 text-cosmic-200 text-sm">
                                            <span className="text-purple-400 font-semibold bg-purple-500/20 rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                                {index + 1}
                                            </span>
                                            {instruction}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Foods to Include/Avoid */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Leaf className="w-5 h-5 text-green-400" />
                            Food Guidelines
                        </h4>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-green-500/20 rounded-lg p-4">
                                <h5 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
                                    <Apple className="w-4 h-4" />
                                    Foods to Include
                                </h5>
                                <ul className="space-y-2">
                                    {recommendations.foods.include.map((food, index) => (
                                        <li key={index} className="flex items-start gap-2 text-cosmic-200 text-sm">
                                            <span className="text-green-400">•</span>
                                            {food}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-red-500/20 rounded-lg p-4">
                                <h5 className="text-red-300 font-semibold mb-3 flex items-center gap-2">
                                    <span className="text-red-400">⚠</span>
                                    Foods to Avoid
                                </h5>
                                <ul className="space-y-2">
                                    {recommendations.foods.avoid.map((food, index) => (
                                        <li key={index} className="flex items-start gap-2 text-cosmic-200 text-sm">
                                            <span className="text-red-400">•</span>
                                            {food}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}; 