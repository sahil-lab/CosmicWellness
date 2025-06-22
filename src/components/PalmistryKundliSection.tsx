import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PaymentModal } from './PaymentModal';
import { analyzeHandReading, analyzeKundli } from '../services/aiService';
import { HandReading, PalmReadingAnalysis, KundliAnalysis } from '../types';
import { User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
    Hand,
    Star,
    Camera,
    Calendar,
    Clock,
    MapPin,
    User as UserIcon,
    Sparkles,
    Eye,
    Heart,
    TrendingUp,
    Gem,
    Shield,
    Sun,
    Moon,
    Lock
} from 'lucide-react';

const MAX_FREE_TRIES = 2;

interface UsageData {
    count: number;
    lastUsed: string;
}

interface PalmistryKundliSectionProps {
    user: User;
}

export const PalmistryKundliSection: React.FC<PalmistryKundliSectionProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'palmistry' | 'kundli'>('palmistry');

    // Palmistry State
    const [palmImage, setPalmImage] = useState<File | null>(null);
    const [palmImagePreview, setPalmImagePreview] = useState<string | null>(null);
    const [handReading, setHandReading] = useState<PalmReadingAnalysis | null>(null);
    const [palmistryLoading, setPalmistryLoading] = useState(false);
    const [palmistryUsage, setPalmistryUsage] = useState<UsageData>({ count: 0, lastUsed: '' });
    const [showPalmistryPayment, setShowPalmistryPayment] = useState(false);
    const [cameraMode, setCameraMode] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    // Kundli State
    const [kundliForm, setKundliForm] = useState({
        name: '',
        birthDate: '',
        birthTime: '',
        birthPlace: ''
    });
    const [kundliAnalysis, setKundliAnalysis] = useState<KundliAnalysis | null>(null);
    const [kundliLoading, setKundliLoading] = useState(false);
    const [kundliUsage, setKundliUsage] = useState<UsageData>({ count: 0, lastUsed: '' });
    const [showKundliPayment, setShowKundliPayment] = useState(false);

    React.useEffect(() => {
        // Load usage data from Firestore
        const loadUsageData = async () => {
            if (!user) return;

            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();

                    // Set palmistry usage
                    if (userData.palmistryUsage) {
                        setPalmistryUsage(userData.palmistryUsage);
                    } else {
                        setPalmistryUsage({ count: 0, lastUsed: '' });
                    }

                    // Set kundli usage
                    if (userData.kundliUsage) {
                        setKundliUsage(userData.kundliUsage);
                    } else {
                        setKundliUsage({ count: 0, lastUsed: '' });
                    }
                }
            } catch (error) {
                console.error('Error loading usage data:', error);
                // Fallback to zero usage
                setPalmistryUsage({ count: 0, lastUsed: '' });
                setKundliUsage({ count: 0, lastUsed: '' });
            }
        };

        loadUsageData();
    }, [user]);

    const updateUsage = async (type: 'palmistry' | 'kundli') => {
        const newUsage = {
            count: (type === 'palmistry' ? palmistryUsage.count : kundliUsage.count) + 1,
            lastUsed: new Date().toISOString()
        };

        if (type === 'palmistry') {
            setPalmistryUsage(newUsage);
            // Update in Firestore
            try {
                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, {
                    palmistryUsage: newUsage
                });
            } catch (error) {
                console.error('Error updating palmistry usage:', error);
            }
        } else {
            setKundliUsage(newUsage);
            // Update in Firestore
            try {
                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, {
                    kundliUsage: newUsage
                });
            } catch (error) {
                console.error('Error updating kundli usage:', error);
            }
        }
    };

    const canUseService = (type: 'palmistry' | 'kundli') => {
        const usage = type === 'palmistry' ? palmistryUsage : kundliUsage;
        return usage.count < MAX_FREE_TRIES;
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                alert('File size should be less than 10MB');
                return;
            }

            setPalmImage(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setPalmImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const startCamera = async () => {
        try {
            console.log('📸 Requesting camera access...');

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user', // Start with front camera for easier testing
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            console.log('✅ Camera access granted, stream:', mediaStream);

            setStream(mediaStream);
            setCameraMode(true);

            // Set video stream with a small delay to ensure element is rendered
            setTimeout(() => {
                if (videoRef.current) {
                    console.log('🎥 Setting video source...');
                    videoRef.current.srcObject = mediaStream;

                    videoRef.current.onloadedmetadata = () => {
                        console.log('📹 Video metadata loaded, playing...');
                        videoRef.current?.play().catch(console.error);
                    };

                    videoRef.current.onerror = (e) => {
                        console.error('❌ Video element error:', e);
                    };
                }
            }, 100);
        } catch (error) {
            console.error('❌ Error accessing camera:', error);
            alert(`Unable to access camera: ${error instanceof Error ? error.message : 'Unknown error'}. Please check permissions or use upload instead.`);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraMode(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob and create file
        canvas.toBlob((blob) => {
            if (blob) {
                const timestamp = new Date().getTime();
                const file = new File([blob], `palm-capture-${timestamp}.jpg`, { type: 'image/jpeg' });

                setPalmImage(file);
                setPalmImagePreview(canvas.toDataURL('image/jpeg', 0.8));

                // Stop camera after capture
                stopCamera();
            }
        }, 'image/jpeg', 0.8);
    };

    // Cleanup camera on unmount
    React.useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const handlePalmistryAnalysis = async () => {
        if (!canUseService('palmistry')) {
            setShowPalmistryPayment(true);
            return;
        }

        if (!palmImage) {
            alert('Please upload a palm image first');
            return;
        }

        setPalmistryLoading(true);
        try {
            const reading = await analyzeHandReading(palmImage);
            setHandReading(reading);
            await updateUsage('palmistry');
        } catch (error) {
            console.error('Error analyzing palm:', error);
            alert('Sorry, there was an error analyzing your palm. Please try again.');
        } finally {
            setPalmistryLoading(false);
        }
    };

    const handleKundliAnalysis = async () => {
        if (!canUseService('kundli')) {
            setShowKundliPayment(true);
            return;
        }

        if (!kundliForm.name || !kundliForm.birthDate || !kundliForm.birthTime || !kundliForm.birthPlace) {
            alert('Please fill in all required fields');
            return;
        }

        setKundliLoading(true);
        try {
            const analysis = await analyzeKundli(
                kundliForm.name,
                kundliForm.birthDate,
                kundliForm.birthTime,
                kundliForm.birthPlace
            );
            setKundliAnalysis(analysis);
            await updateUsage('kundli');
        } catch (error) {
            console.error('Error analyzing kundli:', error);
            alert('Sorry, there was an error analyzing your kundli. Please try again.');
        } finally {
            setKundliLoading(false);
        }
    };

    const handlePaymentSuccess = async (type: 'palmistry' | 'kundli') => {
        const resetUsage = { count: 0, lastUsed: new Date().toISOString() };

        if (type === 'palmistry') {
            setPalmistryUsage(resetUsage);
            // Update in Firestore
            try {
                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, {
                    palmistryUsage: resetUsage
                });
            } catch (error) {
                console.error('Error resetting palmistry usage:', error);
            }
            setShowPalmistryPayment(false);
            handlePalmistryAnalysis();
        } else {
            setKundliUsage(resetUsage);
            // Update in Firestore
            try {
                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, {
                    kundliUsage: resetUsage
                });
            } catch (error) {
                console.error('Error resetting kundli usage:', error);
            }
            setShowKundliPayment(false);
            handleKundliAnalysis();
        }
    };

    const formatBirthDate = (value: string) => {
        const digits = value.replace(/\D/g, '');
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

    return (
        <div className="w-full max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Hand className="w-8 h-8 text-mystical-400" />
                    <Star className="w-8 h-8 text-golden-400" />
                    <h2 className="text-3xl font-bold text-white">Palmistry & Kundli Analysis</h2>
                </div>
                <p className="text-cosmic-200 text-lg max-w-3xl mx-auto">
                    Discover your destiny through ancient sciences - AI-powered palm reading and comprehensive Vedic astrology analysis
                </p>
            </motion.div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab('palmistry')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === 'palmistry'
                            ? 'bg-mystical-500 text-white'
                            : 'text-cosmic-200 hover:text-white'
                            }`}
                    >
                        <Hand className="w-5 h-5" />
                        Palm Reading
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab('kundli')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === 'kundli'
                            ? 'bg-golden-500 text-white'
                            : 'text-cosmic-200 hover:text-white'
                            }`}
                    >
                        <Star className="w-5 h-5" />
                        Kundli Analysis
                    </motion.button>
                </div>
            </div>

            {/* Palmistry Section */}
            {activeTab === 'palmistry' && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                >
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Hand className="w-6 h-6 text-mystical-400" />
                                AI Palm Reading
                            </h3>

                            {!canUseService('palmistry') ? (
                                <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2">
                                    <p className="text-red-300 text-sm flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Free tries exhausted
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-mystical-500/20 border border-mystical-400/30 rounded-lg px-4 py-2">
                                    <p className="text-mystical-300 text-sm">
                                        Free tries: {MAX_FREE_TRIES - palmistryUsage.count}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Image Upload/Camera */}
                        <div className="mb-6">
                            <label className="block text-white font-semibold mb-4">
                                Capture or Upload Palm Image *
                            </label>

                            {/* Mode Selection */}
                            <div className="flex gap-3 mb-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={startCamera}
                                    disabled={cameraMode}
                                    className="flex-1 bg-mystical-500/20 hover:bg-mystical-500/30 disabled:bg-mystical-500/40 border border-mystical-400/30 text-mystical-300 py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <Camera className="w-5 h-5" />
                                    {cameraMode ? 'Camera Active' : 'Use Camera'}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => document.getElementById('palm-upload')?.click()}
                                    className="flex-1 bg-golden-500/20 hover:bg-golden-500/30 border border-golden-400/30 text-golden-300 py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <Star className="w-5 h-5" />
                                    Upload Image
                                </motion.button>
                            </div>

                            {/* Camera View */}
                            {cameraMode && (
                                <div className="mb-4 bg-black/30 rounded-lg p-6 border border-white/20">
                                    <div className="relative">
                                        <div className="bg-black rounded-lg overflow-hidden relative">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full max-w-lg mx-auto block"
                                                style={{
                                                    minHeight: '300px',
                                                    maxHeight: '500px',
                                                    objectFit: 'cover'
                                                }}
                                            />

                                            {/* Loading overlay */}
                                            {!stream && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                    <div className="text-center text-white">
                                                        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                                                        <p>Starting camera...</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <canvas ref={canvasRef} className="hidden" />

                                        {/* Camera Status */}
                                        <div className="text-center mt-3">
                                            <p className="text-green-400 text-sm flex items-center justify-center gap-2">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                Camera Active - Position your palm clearly in view
                                            </p>
                                        </div>

                                        <div className="flex gap-3 mt-4 justify-center">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={capturePhoto}
                                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                                            >
                                                <Camera className="w-5 h-5" />
                                                Capture Palm
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={stopCamera}
                                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold"
                                            >
                                                Cancel
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Upload Area */}
                            {!cameraMode && (
                                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="palm-upload"
                                    />
                                    <label htmlFor="palm-upload" className="cursor-pointer">
                                        {palmImagePreview ? (
                                            <div className="space-y-4">
                                                <img
                                                    src={palmImagePreview}
                                                    alt="Palm preview"
                                                    className="max-w-xs max-h-64 object-contain rounded-lg mx-auto"
                                                />
                                                <p className="text-green-400 font-medium">
                                                    ✓ Image ready for analysis
                                                </p>
                                                <p className="text-cosmic-300 text-sm">
                                                    Click to change image
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <Camera className="w-16 h-16 text-mystical-400 mx-auto" />
                                                <div>
                                                    <p className="text-white font-medium">Click to upload palm image</p>
                                                    <p className="text-cosmic-300 text-sm">
                                                        JPG, PNG up to 10MB. Ensure good lighting and clear palm lines.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            )}

                            {/* Preview for captured image */}
                            {palmImagePreview && cameraMode && (
                                <div className="mt-4 text-center">
                                    <img
                                        src={palmImagePreview}
                                        alt="Captured palm"
                                        className="max-w-xs max-h-64 object-contain rounded-lg mx-auto"
                                    />
                                    <p className="text-green-400 font-medium mt-2">
                                        ✓ Palm captured successfully
                                    </p>
                                </div>
                            )}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handlePalmistryAnalysis}
                            disabled={palmistryLoading || !palmImage}
                            className="w-full bg-gradient-to-r from-mystical-500 to-mystical-600 hover:from-mystical-600 hover:to-mystical-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {palmistryLoading ? (
                                <>
                                    <Eye className="w-5 h-5 animate-pulse" />
                                    AI Analyzing Your Palm...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    {canUseService('palmistry') ? 'Analyze Palm' : 'Upgrade to Premium'}
                                </>
                            )}
                        </motion.button>
                    </div>

                    {/* Palm Reading Results */}
                    {handReading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Character Reading */}
                            <div className="bg-gradient-to-br from-mystical-500/20 to-golden-500/20 rounded-xl p-6 border border-mystical-400/30">
                                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-mystical-400" />
                                    Character & Spiritual Analysis
                                </h4>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-mystical-300 font-semibold mb-2">Personality:</p>
                                        <p className="text-cosmic-100 text-sm leading-relaxed">{handReading.characterReading.personality}</p>
                                    </div>
                                    <div>
                                        <p className="text-green-300 font-semibold mb-2">Strengths:</p>
                                        <p className="text-cosmic-100 text-sm leading-relaxed">{handReading.characterReading.strengths}</p>
                                    </div>
                                    <div>
                                        <p className="text-orange-300 font-semibold mb-2">Challenges:</p>
                                        <p className="text-cosmic-100 text-sm leading-relaxed">{handReading.characterReading.challenges}</p>
                                    </div>
                                    <div>
                                        <p className="text-purple-300 font-semibold mb-2">Talents:</p>
                                        <p className="text-cosmic-100 text-sm leading-relaxed">{handReading.characterReading.talents}</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-300 font-semibold mb-2">Spiritual Nature:</p>
                                        <p className="text-cosmic-100 text-sm leading-relaxed">{handReading.characterReading.spiritualNature}</p>
                                    </div>
                                    <div>
                                        <p className="text-golden-300 font-semibold mb-2">Karma Analysis:</p>
                                        <p className="text-cosmic-100 text-sm leading-relaxed">{handReading.characterReading.karmaAnalysis}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Palm Lines and Mounts */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                        <Heart className="w-4 h-4 text-red-400" />
                                        Palm Lines Analysis
                                    </h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-mystical-300 font-semibold">Life Line:</p>
                                                <p className="text-cosmic-200 text-sm">{handReading.majorLines.lifeLine}</p>
                                            </div>
                                            <div>
                                                <p className="text-red-300 font-semibold">Heart Line:</p>
                                                <p className="text-cosmic-200 text-sm">{handReading.majorLines.heartLine}</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-300 font-semibold">Head Line:</p>
                                                <p className="text-cosmic-200 text-sm">{handReading.majorLines.headLine}</p>
                                            </div>
                                            <div>
                                                <p className="text-golden-300 font-semibold">Fate Line:</p>
                                                <p className="text-cosmic-200 text-sm">{handReading.majorLines.fateLine}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-pink-300 font-semibold">Marriage Line:</p>
                                                <p className="text-cosmic-200 text-sm">{handReading.majorLines.marriageLine}</p>
                                            </div>
                                            <div>
                                                <p className="text-green-300 font-semibold">Travel Line:</p>
                                                <p className="text-cosmic-200 text-sm">{handReading.majorLines.travelLine}</p>
                                            </div>
                                            <div>
                                                <p className="text-orange-300 font-semibold">Children Line:</p>
                                                <p className="text-cosmic-200 text-sm">{handReading.majorLines.childrenLine}</p>
                                            </div>
                                            <div>
                                                <p className="text-yellow-300 font-semibold">Money Line:</p>
                                                <p className="text-cosmic-200 text-sm">{handReading.majorLines.moneyLine}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                        Mount Analysis (Vedic Palmistry)
                                    </h4>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                                        <div>
                                            <p className="text-pink-300 font-semibold">Venus:</p>
                                            <p className="text-cosmic-200">{handReading.mountAnalysis.mountOfVenus}</p>
                                        </div>
                                        <div>
                                            <p className="text-blue-300 font-semibold">Jupiter:</p>
                                            <p className="text-cosmic-200">{handReading.mountAnalysis.mountOfJupiter}</p>
                                        </div>
                                        <div>
                                            <p className="text-purple-300 font-semibold">Saturn:</p>
                                            <p className="text-cosmic-200">{handReading.mountAnalysis.mountOfSaturn}</p>
                                        </div>
                                        <div>
                                            <p className="text-yellow-300 font-semibold">Sun:</p>
                                            <p className="text-cosmic-200">{handReading.mountAnalysis.mountOfSun}</p>
                                        </div>
                                        <div>
                                            <p className="text-green-300 font-semibold">Mercury:</p>
                                            <p className="text-cosmic-200">{handReading.mountAnalysis.mountOfMercury}</p>
                                        </div>
                                        <div>
                                            <p className="text-red-300 font-semibold">Mars:</p>
                                            <p className="text-cosmic-200">{handReading.mountAnalysis.mountOfMars}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-300 font-semibold">Moon:</p>
                                            <p className="text-cosmic-200">{handReading.mountAnalysis.mountOfMoon}</p>
                                        </div>
                                        <div className="bg-orange-500/20 p-3 rounded-lg">
                                            <p className="text-orange-300 font-semibold">Rahu (North Node):</p>
                                            <p className="text-cosmic-200">{handReading.mountAnalysis.mountOfRahu}</p>
                                        </div>
                                        <div className="bg-indigo-500/20 p-3 rounded-lg">
                                            <p className="text-indigo-300 font-semibold">Ketu (South Node):</p>
                                            <p className="text-cosmic-200">{handReading.mountAnalysis.mountOfKetu}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Life Predictions */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                    Life Predictions & Destiny
                                </h4>
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-blue-300 font-semibold">Career:</p>
                                        <p className="text-cosmic-200 text-sm">{handReading.lifePredictions.career}</p>
                                    </div>
                                    <div>
                                        <p className="text-pink-300 font-semibold">Relationships:</p>
                                        <p className="text-cosmic-200 text-sm">{handReading.lifePredictions.relationships}</p>
                                    </div>
                                    <div>
                                        <p className="text-green-300 font-semibold">Health:</p>
                                        <p className="text-cosmic-200 text-sm">{handReading.lifePredictions.health}</p>
                                    </div>
                                    <div>
                                        <p className="text-yellow-300 font-semibold">Wealth:</p>
                                        <p className="text-cosmic-200 text-sm">{handReading.lifePredictions.wealth}</p>
                                    </div>
                                    <div>
                                        <p className="text-orange-300 font-semibold">Family:</p>
                                        <p className="text-cosmic-200 text-sm">{handReading.lifePredictions.family}</p>
                                    </div>
                                    <div>
                                        <p className="text-purple-300 font-semibold">Education:</p>
                                        <p className="text-cosmic-200 text-sm">{handReading.lifePredictions.education}</p>
                                    </div>
                                    <div>
                                        <p className="text-mystical-300 font-semibold">Spiritual Journey:</p>
                                        <p className="text-cosmic-200 text-sm">{handReading.lifePredictions.spiritualJourney}</p>
                                    </div>
                                    <div>
                                        <p className="text-golden-300 font-semibold">Karma:</p>
                                        <p className="text-cosmic-200 text-sm">{handReading.lifePredictions.karma}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Finger Analysis */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Hand className="w-4 h-4 text-mystical-400" />
                                    Finger Analysis
                                </h4>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-mystical-300 font-semibold">Thumb:</p>
                                        <p className="text-cosmic-200">{handReading.fingerAnalysis.thumb}</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-300 font-semibold">Index:</p>
                                        <p className="text-cosmic-200">{handReading.fingerAnalysis.indexFinger}</p>
                                    </div>
                                    <div>
                                        <p className="text-purple-300 font-semibold">Middle:</p>
                                        <p className="text-cosmic-200">{handReading.fingerAnalysis.middleFinger}</p>
                                    </div>
                                    <div>
                                        <p className="text-golden-300 font-semibold">Ring:</p>
                                        <p className="text-cosmic-200">{handReading.fingerAnalysis.ringFinger}</p>
                                    </div>
                                    <div>
                                        <p className="text-green-300 font-semibold">Little:</p>
                                        <p className="text-cosmic-200">{handReading.fingerAnalysis.littleFinger}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Indian Astrology Section */}
                            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-400/30">
                                <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-orange-400" />
                                    Indian Astrology Analysis
                                </h4>

                                {/* Rahu & Ketu Influence */}
                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-orange-500/20 rounded-lg p-4">
                                        <h5 className="text-orange-300 font-bold mb-3 flex items-center gap-2">
                                            <Sun className="w-4 h-4" />
                                            Rahu Influence (North Node)
                                        </h5>
                                        <p className="text-cosmic-200 text-sm leading-relaxed">{handReading.indianAstrology.rahuInfluence}</p>
                                    </div>
                                    <div className="bg-indigo-500/20 rounded-lg p-4">
                                        <h5 className="text-indigo-300 font-bold mb-3 flex items-center gap-2">
                                            <Moon className="w-4 h-4" />
                                            Ketu Influence (South Node)
                                        </h5>
                                        <p className="text-cosmic-200 text-sm leading-relaxed">{handReading.indianAstrology.ketuInfluence}</p>
                                    </div>
                                </div>

                                {/* Vedic Remedies */}
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div>
                                        <h5 className="text-green-300 font-bold mb-3 flex items-center gap-2">
                                            <Shield className="w-4 h-4" />
                                            Vedic Remedies
                                        </h5>
                                        <ul className="space-y-2">
                                            {handReading.indianAstrology.vedicRemedies.map((remedy, index) => (
                                                <li key={index} className="text-cosmic-200 text-sm flex items-start gap-2">
                                                    <span className="text-green-400 text-xs">•</span>
                                                    {remedy}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h5 className="text-golden-300 font-bold mb-3 flex items-center gap-2">
                                            <Star className="w-4 h-4" />
                                            Yantra Recommendations
                                        </h5>
                                        <ul className="space-y-2">
                                            {handReading.indianAstrology.yantraRecommendations.map((yantra, index) => (
                                                <li key={index} className="text-cosmic-200 text-sm bg-golden-500/10 px-2 py-1 rounded">
                                                    {yantra}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h5 className="text-red-300 font-bold mb-3 flex items-center gap-2">
                                            <Heart className="w-4 h-4" />
                                            Rudraksha Guidance
                                        </h5>
                                        <p className="text-cosmic-200 text-sm bg-red-500/10 p-3 rounded-lg">{handReading.indianAstrology.rudrakshaGuidance}</p>
                                    </div>
                                </div>

                                {/* Additional Spiritual Practices */}
                                <div className="grid md:grid-cols-3 gap-4 mt-6">
                                    <div>
                                        <h6 className="text-blue-300 font-semibold mb-2">Fasting Days:</h6>
                                        <div className="flex flex-wrap gap-1">
                                            {handReading.indianAstrology.fasting.map((day, index) => (
                                                <span key={index} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                                    {day}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h6 className="text-purple-300 font-semibold mb-2">Recommended Donations:</h6>
                                        <div className="flex flex-wrap gap-1">
                                            {handReading.indianAstrology.donations.map((donation, index) => (
                                                <span key={index} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                                                    {donation}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h6 className="text-mystical-300 font-semibold mb-2">Temple Visits:</h6>
                                        <div className="flex flex-wrap gap-1">
                                            {handReading.indianAstrology.templeVisits.map((temple, index) => (
                                                <span key={index} className="bg-mystical-500/20 text-mystical-300 px-2 py-1 rounded text-xs">
                                                    {temple}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Gem className="w-4 h-4 text-mystical-400" />
                                    General Recommendations
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-green-300 font-semibold mb-2">Gemstones:</p>
                                        <p className="text-cosmic-200 text-sm">{handReading.recommendations.gemstones}</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-300 font-semibold mb-2">Lucky Colors:</p>
                                        <p className="text-cosmic-200 text-sm">{handReading.recommendations.colors}</p>
                                    </div>
                                    <div>
                                        <p className="text-purple-300 font-semibold mb-2">Mantras:</p>
                                        <p className="text-cosmic-200 text-sm">{handReading.recommendations.mantras}</p>
                                    </div>
                                    <div>
                                        <p className="text-orange-300 font-semibold mb-2">Lifestyle:</p>
                                        <p className="text-cosmic-200 text-sm">{handReading.recommendations.lifestyle}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-mystical-300 font-semibold mb-2">Spiritual Practices:</p>
                                        <p className="text-cosmic-200 text-sm">{handReading.recommendations.spiritual}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* Kundli Section */}
            {activeTab === 'kundli' && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                >
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Star className="w-6 h-6 text-golden-400" />
                                Kundli Analysis
                            </h3>

                            {!canUseService('kundli') ? (
                                <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2">
                                    <p className="text-red-300 text-sm flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Free tries exhausted
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-golden-500/20 border border-golden-400/30 rounded-lg px-4 py-2">
                                    <p className="text-golden-300 text-sm">
                                        Free tries: {MAX_FREE_TRIES - kundliUsage.count}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                                    <UserIcon className="w-4 h-4 text-golden-400" />
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={kundliForm.name}
                                    onChange={(e) => setKundliForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-golden-400 transition-colors"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-golden-400" />
                                    Birth Date *
                                </label>
                                <input
                                    type="text"
                                    value={kundliForm.birthDate}
                                    onChange={(e) => setKundliForm(prev => ({ ...prev, birthDate: formatBirthDate(e.target.value) }))}
                                    placeholder="DD/MM/YYYY"
                                    maxLength={10}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-golden-400 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-golden-400" />
                                    Birth Time *
                                </label>
                                <input
                                    type="time"
                                    value={kundliForm.birthTime}
                                    onChange={(e) => setKundliForm(prev => ({ ...prev, birthTime: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-golden-400 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-golden-400" />
                                    Birth Place *
                                </label>
                                <input
                                    type="text"
                                    value={kundliForm.birthPlace}
                                    onChange={(e) => setKundliForm(prev => ({ ...prev, birthPlace: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-golden-400 transition-colors"
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleKundliAnalysis}
                            disabled={kundliLoading || !kundliForm.name || !kundliForm.birthDate || !kundliForm.birthTime || !kundliForm.birthPlace}
                            className="w-full bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {kundliLoading ? (
                                <>
                                    <Star className="w-5 h-5 animate-spin" />
                                    Analyzing Your Kundli...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    {canUseService('kundli') ? 'Generate Kundli' : 'Upgrade to Premium'}
                                </>
                            )}
                        </motion.button>
                    </div>

                    {/* Kundli Results */}
                    {kundliAnalysis && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Basic Info */}
                            <div className="bg-gradient-to-br from-golden-500/20 to-mystical-500/20 rounded-xl p-6 border border-golden-400/30">
                                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <UserIcon className="w-5 h-5 text-golden-400" />
                                    Birth Chart for {kundliAnalysis.basicInfo.name}
                                </h4>
                                <div className="grid md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-golden-300 font-semibold">Birth Date:</p>
                                        <p className="text-cosmic-200">{kundliAnalysis.basicInfo.birthDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-golden-300 font-semibold">Birth Time:</p>
                                        <p className="text-cosmic-200">{kundliAnalysis.basicInfo.birthTime}</p>
                                    </div>
                                    <div>
                                        <p className="text-golden-300 font-semibold">Birth Place:</p>
                                        <p className="text-cosmic-200">{kundliAnalysis.basicInfo.birthPlace}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Planetary Positions */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Sun className="w-4 h-4 text-yellow-400" />
                                    Planetary Positions
                                </h4>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(kundliAnalysis.planetaryPositions).map(([planet, position]) => (
                                        <div key={planet} className="bg-white/5 rounded-lg p-3">
                                            <p className="text-golden-300 font-semibold capitalize">{planet}:</p>
                                            <p className="text-cosmic-200 text-sm">{position}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Doshas */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-red-400" />
                                    Dosha Analysis
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-cosmic-300">Manglik Dosha:</span>
                                            <span className={kundliAnalysis.doshas.manglik ? 'text-red-400' : 'text-green-400'}>
                                                {kundliAnalysis.doshas.manglik ? 'Present' : 'Absent'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-cosmic-300">Kal Sarp Dosha:</span>
                                            <span className={kundliAnalysis.doshas.kalSarp ? 'text-red-400' : 'text-green-400'}>
                                                {kundliAnalysis.doshas.kalSarp ? 'Present' : 'Absent'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-cosmic-300">Pitru Dosha:</span>
                                            <span className={kundliAnalysis.doshas.pitruDosh ? 'text-red-400' : 'text-green-400'}>
                                                {kundliAnalysis.doshas.pitruDosh ? 'Present' : 'Absent'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-cosmic-200 text-sm">{kundliAnalysis.doshas.description}</p>
                                </div>
                            </div>

                            {/* Life Predictions */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                        Life Predictions
                                    </h4>
                                    <div className="space-y-3">
                                        {Object.entries(kundliAnalysis.predictions).map(([area, prediction]) => (
                                            <div key={area}>
                                                <p className="text-golden-300 font-semibold capitalize">{area}:</p>
                                                <p className="text-cosmic-200 text-sm">{prediction}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                        <Gem className="w-4 h-4 text-mystical-400" />
                                        Remedies & Gemstones
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-mystical-300 font-semibold mb-2">Remedies:</p>
                                            <ul className="space-y-1">
                                                {kundliAnalysis.remedies.map((remedy, index) => (
                                                    <li key={index} className="text-cosmic-200 text-sm flex items-start gap-2">
                                                        <span className="text-mystical-400">•</span>
                                                        {remedy}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="text-green-300 font-semibold mb-2">Gemstones:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {kundliAnalysis.gemstones.map((gem, index) => (
                                                    <span key={index} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                                                        {gem}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* Payment Modals */}
            {showPalmistryPayment && (
                <PaymentModal
                    isOpen={showPalmistryPayment}
                    onClose={() => setShowPalmistryPayment(false)}
                    onSuccess={() => handlePaymentSuccess('palmistry')}
                    amount={299}
                    description="Premium Palm Reading - Unlimited AI-powered palmistry analysis with detailed insights"
                />
            )}

            {showKundliPayment && (
                <PaymentModal
                    isOpen={showKundliPayment}
                    onClose={() => setShowKundliPayment(false)}
                    onSuccess={() => handlePaymentSuccess('kundli')}
                    amount={399}
                    description="Premium Kundli Analysis - Comprehensive Vedic astrology reading with detailed predictions"
                />
            )}
        </div>
    );
}; 