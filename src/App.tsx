import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, db } from './config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';

// Components
import { EmotionSelector } from './components/EmotionSelector';
import { VideoPlayer } from './components/VideoPlayer';
import { SoundTherapySection } from './components/SoundTherapySection';
import { MeditationSection } from './components/MeditationSection';
import { DietSupplementsSection } from './components/DietSupplementsSection';
import { AngelGuidanceSection } from './components/AngelGuidanceSection';
import { EmergencyPlansSection } from './components/EmergencyPlansSection';
import { PalmistryKundliSection } from './components/PalmistryKundliSection';
import { VedasSection } from './components/VedasSection';
import { EnhancedAstrologySection } from './components/EnhancedAstrologySection';
import { PremiumSection } from './components/PremiumSection';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { OshoQuotes } from './components/OshoQuotes';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import SubscriptionModal from './components/SubscriptionModal';

import { getVideoRecommendations } from './services/aiService';
import { Emotion, VideoRecommendation } from './types';
import { Sparkles, Moon, Star, Heart, Crown, Volume2, AlertTriangle, Hand, LogOut, User as UserIcon, BookOpen, Brain, Utensils } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "13214695469-rfc1tg3lftkkj9dq57js7rj5ugsinjaj.apps.googleusercontent.com";

// Cosmic Background Component
const CosmicBackground: React.FC = () => {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    // Generate random stars
    const generateStars = () => {
      const starArray = [];
      for (let i = 0; i < 150; i++) {
        starArray.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          delay: Math.random() * 5,
        });
      }
      setStars(starArray);
    };

    // Generate floating particles
    const generateParticles = () => {
      const particleArray = [];
      for (let i = 0; i < 50; i++) {
        particleArray.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 8 + 2,
          delay: Math.random() * 10,
          duration: Math.random() * 20 + 10,
        });
      }
      setParticles(particleArray);
    };

    generateStars();
    generateParticles();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 animate-pulse-slow"></div>

      {/* Secondary Gradient Layer */}
      <div className="absolute inset-0 bg-gradient-to-tl from-blue-950/50 via-violet-950/50 to-fuchsia-950/50 animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Nebula Clouds */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-purple-500/30 via-pink-500/20 to-transparent rounded-full filter blur-3xl animate-float opacity-70"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-radial from-cyan-500/30 via-blue-500/20 to-transparent rounded-full filter blur-3xl animate-float-reverse opacity-60" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-radial from-indigo-500/30 via-violet-500/20 to-transparent rounded-full filter blur-3xl animate-pulse-slow opacity-50" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 left-1/6 w-72 h-72 bg-gradient-radial from-emerald-500/25 via-teal-500/15 to-transparent rounded-full filter blur-3xl animate-float opacity-40" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-1/4 left-3/4 w-56 h-56 bg-gradient-radial from-orange-500/25 via-red-500/15 to-transparent rounded-full filter blur-3xl animate-bounce-slow opacity-50" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Twinkling Stars */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
            }}
          />
        ))}
      </div>

      {/* Floating Cosmic Particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 opacity-30 filter blur-sm"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, 25, -25, 0],
              scale: [1, 1.2, 0.8, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Galaxy Spiral Effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-screen h-screen">
        <div className="absolute inset-0 bg-gradient-conic from-transparent via-purple-500/10 via-pink-500/10 via-blue-500/10 to-transparent animate-spin-slow opacity-30"></div>
      </div>

      {/* Aurora-like Waves */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-0 w-full h-full bg-gradient-to-b from-green-400/20 via-transparent to-transparent transform rotate-12 animate-wave opacity-40"></div>
        <div className="absolute -bottom-1/2 right-0 w-full h-full bg-gradient-to-t from-purple-400/20 via-transparent to-transparent transform -rotate-12 animate-wave-reverse opacity-40" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Cosmic Dust Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-pulse-slow opacity-20"></div>
    </div>
  );
};

// Main App Component
const MainApp: React.FC<{ user: User | null }> = ({ user }) => {
  const navigate = useNavigate();
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [problem, setProblem] = useState('');
  const [videos, setVideos] = useState<VideoRecommendation[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [activeSection, setActiveSection] = useState<'emotion' | 'sound' | 'meditation' | 'diet' | 'angel' | 'emergency' | 'palmistry' | 'vedas' | 'horoscope' | 'premium' | 'subscription' | 'quotes'>('emotion');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionFeature, setSubscriptionFeature] = useState('');

  const handleEmotionSelect = async (emotion: Emotion) => {
    setSelectedEmotion(emotion);
    if (problem.trim()) {
      await fetchRecommendations(emotion.name, problem);
    }
  };

  const fetchRecommendations = async (emotion: string, userProblem: string) => {
    setLoadingVideos(true);
    try {
      const recommendations = await getVideoRecommendations(emotion, userProblem);
      setVideos(recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleProblemSubmit = async () => {
    if (selectedEmotion && problem.trim()) {
      await fetchRecommendations(selectedEmotion.name, problem);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProtectedSectionClick = (sectionId: string, featureName: string) => {
    if (!user) {
      setSubscriptionFeature(featureName);
      setShowSubscriptionModal(true);
    } else {
      setActiveSection(sectionId as any);
    }
  };

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'sound':
        return <SoundTherapySection />;
      case 'meditation':
        return <MeditationSection user={user} />;
      case 'diet':
        return <DietSupplementsSection user={user} />;
      case 'angel':
        return user ? <AngelGuidanceSection /> : <div className="text-center text-cosmic-200">Please sign in to access angel guidance</div>;
      case 'emergency':
        return user ? <EmergencyPlansSection /> : <div className="text-center text-cosmic-200">Please sign in to access emergency consultations</div>;
      case 'palmistry':
        return user ? <PalmistryKundliSection user={user} /> : <div className="text-center text-cosmic-200">Please sign in to access palmistry & kundli analysis</div>;
      case 'vedas':
        return <VedasSection />;
      case 'horoscope':
        return <EnhancedAstrologySection />;
      case 'premium':
        return user ? <PremiumSection /> : <div className="text-center text-cosmic-200">Please sign in to access premium features</div>;
      case 'subscription':
        return <SubscriptionPlans />;
      case 'quotes':
        return <OshoQuotes emotion={selectedEmotion?.name} context={problem} />;
      default:
        return (
          <div className="space-y-12">
            <EmotionSelector
              selectedEmotion={selectedEmotion?.id || ''}
              onEmotionSelect={handleEmotionSelect}
            />

            {selectedEmotion && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Tell us more about what you're experiencing
                  </h3>
                  <textarea
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="Describe your situation, feelings, or what you'd like help with..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-mystical-400 transition-colors resize-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleProblemSubmit}
                    disabled={!problem.trim() || loadingVideos}
                    className="mt-4 bg-gradient-to-r from-mystical-500 to-mystical-600 hover:from-mystical-600 hover:to-mystical-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
                  >
                    {loadingVideos ? 'Finding Your Healing...' : 'Get Recommendations'}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {(videos.length > 0 || loadingVideos) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <VideoPlayer videos={videos} />
              </motion.div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Background */}
      <CosmicBackground />

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-8 h-8 text-mystical-400 drop-shadow-lg" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">Cosmic Wellness</h1>
            </motion.div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-cosmic-200">
                    <UserIcon className="w-5 h-5" />
                    <span className="hidden md:inline">{user.displayName || user.email}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-cosmic-200 hover:text-white backdrop-blur-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-cosmic-200 hover:text-white transition-colors backdrop-blur-sm rounded-lg hover:bg-white/10"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-4 py-2 bg-gradient-to-r from-golden-500 to-mystical-500 text-white rounded-lg hover:from-golden-600 hover:to-mystical-600 transition-all backdrop-blur-sm shadow-lg"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'emotion', icon: Heart, label: 'Healing', requiresAuth: false },
              { id: 'sound', icon: Volume2, label: 'Sound Therapy', requiresAuth: false },
              { id: 'meditation', icon: Brain, label: 'Meditation', requiresAuth: false },
              { id: 'diet', icon: Utensils, label: 'Diet & Supplements', requiresAuth: false },
              { id: 'angel', icon: Sparkles, label: 'Angel Guidance', requiresAuth: true },
              { id: 'emergency', icon: AlertTriangle, label: 'Emergency', requiresAuth: true },
              { id: 'palmistry', icon: Hand, label: 'Palm & Kundli', requiresAuth: true },
              { id: 'vedas', icon: BookOpen, label: 'Vedas', requiresAuth: false },
              { id: 'horoscope', icon: Star, label: 'Astrology', requiresAuth: false },
              { id: 'premium', icon: Crown, label: 'Premium', requiresAuth: true },
              { id: 'subscription', icon: Crown, label: 'Plans', requiresAuth: false },
              { id: 'quotes', icon: Moon, label: 'Wisdom', requiresAuth: false }
            ].map(({ id, icon: Icon, label, requiresAuth }) => (
              <motion.button
                key={id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (requiresAuth && !user) {
                    handleProtectedSectionClick(id, label);
                  } else {
                    setActiveSection(id as any);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 text-sm backdrop-blur-sm shadow-lg ${activeSection === id
                  ? 'bg-mystical-500 text-white shadow-mystical-500/25'
                  : 'bg-white/10 text-cosmic-200 hover:bg-white/20 hover:text-white'
                  } ${requiresAuth && !user ? 'opacity-75' : ''}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
                {requiresAuth && !user && <span className="text-xs">🔒</span>}
              </motion.button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {renderCurrentSection()}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-cosmic-300 text-sm backdrop-blur-sm">
        <p>© 2025 Cosmic Wellness. Transforming lives through AI-powered healing frequencies.</p>
      </footer>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        feature={subscriptionFeature}
      />
    </div>
  );
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      // If user is logged in, check if they have a document in Firestore
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          // If user document doesn't exist, it will be created during login/register
          if (!userDoc.exists()) {
            console.log('User document will be created on next action');
          }
        } catch (error) {
          console.error('Error checking user document:', error);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <CosmicBackground />
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-12 h-12 text-golden-400 drop-shadow-lg" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-12 h-12 text-mystical-400 drop-shadow-lg" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Moon className="w-12 h-12 text-cosmic-400 drop-shadow-lg" />
            </motion.div>
          </motion.div>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white text-xl font-semibold drop-shadow-lg cosmic-glow"
          >
            Loading your cosmic journey...
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-4 h-1 bg-gradient-to-r from-golden-400 via-mystical-400 to-cosmic-400 rounded-full mx-auto max-w-xs"
          />
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/" element={<MainApp user={user} />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;