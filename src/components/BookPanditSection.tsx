import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getPujaRecommendations } from '../services/aiService';
import { PujaRequest, PujaRecommendation } from '../types';
import VideoPlayer from './VideoPlayer';

interface BookPanditSectionProps {
    user: User | null;
}

const BookPanditSection: React.FC<BookPanditSectionProps> = ({ user }) => {
    const [pujaRequest, setPujaRequest] = useState<PujaRequest>({
        pujaType: '',
        occasion: '',
        deity: '',
        location: '',
        participants: 1,
        budget: '',
        specialRequirements: '',
        description: ''
    });
    const [recommendation, setRecommendation] = useState<PujaRecommendation | null>(null);
    const [loading, setLoading] = useState(false);
    const [usageCount, setUsageCount] = useState(0);
    const [maxUsage] = useState(3);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (user) {
            loadUsageCount();
        }
    }, [user]);

    const loadUsageCount = async () => {
        if (!user) return;

        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();
            setUsageCount(userData?.pujaBookingUsage || 0);
        } catch (error) {
            console.error('Error loading usage count:', error);
        }
    };

    const updateUsageCount = async () => {
        if (!user) return;

        try {
            const newCount = usageCount + 1;
            await updateDoc(doc(db, 'users', user.uid), {
                pujaBookingUsage: newCount
            });
            setUsageCount(newCount);
        } catch (error) {
            console.error('Error updating usage count:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPujaRequest(prev => ({
            ...prev,
            [name]: name === 'participants' ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert('Please log in to get puja recommendations');
            return;
        }

        if (usageCount >= maxUsage) {
            alert('You have reached the maximum number of puja consultations (3). Upgrade to premium for unlimited access.');
            return;
        }

        if (!pujaRequest.pujaType || !pujaRequest.deity || !pujaRequest.description) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const result = await getPujaRecommendations(pujaRequest);
            setRecommendation(result);
            setShowResults(true);
            await updateUsageCount();
        } catch (error) {
            console.error('Error getting puja recommendations:', error);
            alert('Failed to get recommendations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setPujaRequest({
            pujaType: '',
            occasion: '',
            deity: '',
            location: '',
            participants: 1,
            budget: '',
            specialRequirements: '',
            description: ''
        });
        setRecommendation(null);
        setShowResults(false);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-orange-800 mb-4 flex items-center justify-center gap-3">
                    🕉️ Book a Pandit & Puja Planning
                </h2>
                <p className="text-orange-600 text-lg max-w-3xl mx-auto">
                    Get personalized puja recommendations, essential items, procedures, and connect with qualified pandits for your spiritual ceremonies
                </p>
                <div className="flex justify-center items-center gap-4 mt-4">
                    <div className="bg-orange-100 px-4 py-2 rounded-full">
                        <span className="text-orange-700 font-semibold">
                            Consultations Used: {usageCount}/{maxUsage}
                        </span>
                    </div>
                    {usageCount >= maxUsage && (
                        <div className="bg-red-100 px-4 py-2 rounded-full">
                            <span className="text-red-700 font-semibold">Limit Reached - Upgrade to Premium</span>
                        </div>
                    )}
                </div>
            </div>

            {!showResults ? (
                <div className="bg-white rounded-xl p-8 shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-orange-700 font-semibold mb-2">
                                    Type of Puja *
                                </label>
                                <select
                                    name="pujaType"
                                    value={pujaRequest.pujaType}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    required
                                >
                                    <option value="">Select Puja Type</option>
                                    <option value="Ganesh Puja">Ganesh Puja</option>
                                    <option value="Lakshmi Puja">Lakshmi Puja</option>
                                    <option value="Saraswati Puja">Saraswati Puja</option>
                                    <option value="Durga Puja">Durga Puja</option>
                                    <option value="Shiva Puja">Shiva Puja</option>
                                    <option value="Vishnu Puja">Vishnu Puja</option>
                                    <option value="Hanuman Puja">Hanuman Puja</option>
                                    <option value="Navagraha Puja">Navagraha Puja</option>
                                    <option value="Griha Pravesh Puja">Griha Pravesh Puja</option>
                                    <option value="Vastu Shanti Puja">Vastu Shanti Puja</option>
                                    <option value="Wedding Ceremony">Wedding Ceremony</option>
                                    <option value="Naming Ceremony">Naming Ceremony</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-orange-700 font-semibold mb-2">
                                    Primary Deity *
                                </label>
                                <select
                                    name="deity"
                                    value={pujaRequest.deity}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    required
                                >
                                    <option value="">Select Deity</option>
                                    <option value="Lord Ganesha">Lord Ganesha</option>
                                    <option value="Goddess Lakshmi">Goddess Lakshmi</option>
                                    <option value="Goddess Saraswati">Goddess Saraswati</option>
                                    <option value="Goddess Durga">Goddess Durga</option>
                                    <option value="Lord Shiva">Lord Shiva</option>
                                    <option value="Lord Vishnu">Lord Vishnu</option>
                                    <option value="Lord Hanuman">Lord Hanuman</option>
                                    <option value="Lord Krishna">Lord Krishna</option>
                                    <option value="Lord Rama">Lord Rama</option>
                                    <option value="Multiple Deities">Multiple Deities</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-orange-700 font-semibold mb-2">
                                    Occasion
                                </label>
                                <input
                                    type="text"
                                    name="occasion"
                                    value={pujaRequest.occasion}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Festival, Wedding, Housewarming, etc."
                                    className="w-full p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-orange-700 font-semibold mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={pujaRequest.location}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Home, Temple, Community Hall"
                                    className="w-full p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-orange-700 font-semibold mb-2">
                                    Number of Participants
                                </label>
                                <input
                                    type="number"
                                    name="participants"
                                    value={pujaRequest.participants}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="1000"
                                    className="w-full p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-orange-700 font-semibold mb-2">
                                    Budget Range
                                </label>
                                <select
                                    name="budget"
                                    value={pujaRequest.budget}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Select Budget</option>
                                    <option value="Under $100">Under $100</option>
                                    <option value="$100-300">$100-300</option>
                                    <option value="$300-500">$300-500</option>
                                    <option value="$500-1000">$500-1000</option>
                                    <option value="Above $1000">Above $1000</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-orange-700 font-semibold mb-2">
                                Special Requirements
                            </label>
                            <input
                                type="text"
                                name="specialRequirements"
                                value={pujaRequest.specialRequirements}
                                onChange={handleInputChange}
                                placeholder="e.g., Vegetarian only, Specific regional traditions, etc."
                                className="w-full p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-orange-700 font-semibold mb-2">
                                Detailed Description *
                            </label>
                            <textarea
                                name="description"
                                value={pujaRequest.description}
                                onChange={handleInputChange}
                                placeholder="Please describe your puja requirements, purpose, any specific prayers needed, family traditions to follow, etc."
                                rows={4}
                                className="w-full p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>

                        <div className="flex justify-center">
                            <button
                                type="submit"
                                disabled={loading || usageCount >= maxUsage}
                                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        Getting Recommendations...
                                    </>
                                ) : (
                                    <>
                                        🕉️ Get Puja Plan & Pandit Recommendations
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="space-y-8">
                    {recommendation && (
                        <>
                            {/* Header */}
                            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                                <h3 className="text-3xl font-bold text-orange-800 mb-2">
                                    {recommendation.pujaName}
                                </h3>
                                <p className="text-orange-600 text-lg mb-4">{recommendation.description}</p>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="bg-orange-50 p-4 rounded-lg">
                                        <div className="text-orange-700 font-semibold">Duration</div>
                                        <div className="text-orange-600">{recommendation.duration}</div>
                                    </div>
                                    <div className="bg-orange-50 p-4 rounded-lg">
                                        <div className="text-orange-700 font-semibold">Primary Deity</div>
                                        <div className="text-orange-600">{recommendation.deity}</div>
                                    </div>
                                    <div className="bg-orange-50 p-4 rounded-lg">
                                        <div className="text-orange-700 font-semibold">Auspicious Time</div>
                                        <div className="text-orange-600">{recommendation.auspiciousTime}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <h4 className="text-2xl font-bold text-orange-800 mb-4 flex items-center gap-2">
                                    🌟 Spiritual Benefits
                                </h4>
                                <div className="grid md:grid-cols-2 gap-3">
                                    {recommendation.benefits.map((benefit, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                            <span className="text-orange-600">✨</span>
                                            <span className="text-orange-700">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Essential Items */}
                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <h4 className="text-2xl font-bold text-orange-800 mb-4 flex items-center gap-2">
                                    🛍️ Essential Puja Items
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {recommendation.essentialItems.map((item, index) => (
                                        <div key={index} className="border border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h5 className="font-semibold text-orange-800">{item.name}</h5>
                                                <span className="text-orange-600 font-semibold">{item.price}</span>
                                            </div>
                                            <p className="text-orange-600 text-sm mb-3">{item.purpose}</p>
                                            <a
                                                href={item.amazonLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
                                            >
                                                🛒 Buy on Amazon
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Puja Procedures */}
                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <h4 className="text-2xl font-bold text-orange-800 mb-4 flex items-center gap-2">
                                    📋 Puja Procedures
                                </h4>
                                <div className="space-y-4">
                                    {recommendation.procedures.map((procedure, index) => (
                                        <div key={index} className="border-l-4 border-orange-500 pl-6 py-3">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm">
                                                    {procedure.step}
                                                </span>
                                                <h5 className="font-semibold text-orange-800">{procedure.action}</h5>
                                            </div>
                                            <div className="ml-11">
                                                <p className="text-orange-600 mb-2">
                                                    <strong>Required Items:</strong> {procedure.items.join(', ')}
                                                </p>
                                                {procedure.mantra && (
                                                    <div className="bg-orange-50 p-3 rounded-lg">
                                                        <strong className="text-orange-700">Mantra:</strong>
                                                        <p className="text-orange-600 font-sanskrit">{procedure.mantra}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Video Guidance */}
                            {recommendation.videos.length > 0 && (
                                <div className="bg-white rounded-xl p-6 shadow-lg">
                                    <h4 className="text-2xl font-bold text-orange-800 mb-4 flex items-center gap-2">
                                        📺 Video Guidance
                                    </h4>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {recommendation.videos.map((video, index) => (
                                            <div key={index} className="border border-orange-200 rounded-lg p-4">
                                                <h5 className="font-semibold text-orange-800 mb-2">{video.title}</h5>
                                                <p className="text-orange-600 text-sm mb-3">{video.description}</p>
                                                <VideoPlayer videoId={video.videoId} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pandit Requirements */}
                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <h4 className="text-2xl font-bold text-orange-800 mb-4 flex items-center gap-2">
                                    👨‍🏫 Pandit Requirements
                                </h4>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h5 className="font-semibold text-orange-700 mb-2">Specialization Needed:</h5>
                                        <ul className="space-y-1">
                                            {recommendation.panditRequirements.specialization.map((spec, index) => (
                                                <li key={index} className="text-orange-600 flex items-center gap-2">
                                                    <span>•</span> {spec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-orange-700 mb-2">Languages:</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {recommendation.panditRequirements.languages.map((lang, index) => (
                                                <span key={index} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                                                    {lang}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-orange-700 mb-2">Experience:</h5>
                                        <p className="text-orange-600">{recommendation.panditRequirements.experience}</p>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-orange-700 mb-2">Estimated Cost:</h5>
                                        <p className="text-orange-600">{recommendation.panditRequirements.estimatedCost}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Preparation Steps */}
                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <h4 className="text-2xl font-bold text-orange-800 mb-4 flex items-center gap-2">
                                    📝 Preparation Checklist
                                </h4>
                                <div className="space-y-3">
                                    {recommendation.preparation.map((step, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                            <input type="checkbox" className="w-5 h-5 text-orange-600" />
                                            <span className="text-orange-700">{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                                <div className="space-y-4">
                                    <h4 className="text-xl font-bold text-orange-800">Ready to Book?</h4>
                                    <div className="flex flex-wrap justify-center gap-4">
                                        <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all">
                                            📞 Contact Local Pandits
                                        </button>
                                        <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all">
                                            💬 Chat with Expert
                                        </button>
                                        <button
                                            onClick={resetForm}
                                            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all"
                                        >
                                            🔄 Plan Another Puja
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default BookPanditSection; 