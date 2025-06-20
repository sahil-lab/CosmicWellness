import { useState } from 'react';
import { motion } from 'framer-motion';
import { EmotionSelector } from './components/EmotionSelector';
import { VideoPlayer } from './components/VideoPlayer';
import { SoundTherapySection } from './components/SoundTherapySection';
import { EnhancedAstrologySection } from './components/EnhancedAstrologySection';
import { PremiumSection } from './components/PremiumSection';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { OshoQuotes } from './components/OshoQuotes';
import { getVideoRecommendations } from './services/aiService';
import { Emotion, VideoRecommendation } from './types';
import { Sparkles, Moon, Star, Heart, Crown, Volume2, Music } from 'lucide-react';

function App() {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [problem, setProblem] = useState('');
  const [videos, setVideos] = useState<VideoRecommendation[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [activeSection, setActiveSection] = useState<'emotion' | 'sound' | 'horoscope' | 'premium' | 'subscription' | 'quotes'>('emotion');

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-900 via-cosmic-800 to-mystical-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-mystical-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-golden-500/20 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cosmic-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-8 h-8 text-mystical-400" />
              <h1 className="text-2xl font-bold text-white">Cosmic Wellness</h1>
            </motion.div>
            
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'emotion', icon: Heart, label: 'Healing' },
                { id: 'sound', icon: Volume2, label: 'Sound Therapy' },
                { id: 'horoscope', icon: Star, label: 'Astrology' },
                { id: 'premium', icon: Sparkles, label: 'Premium' },
                { id: 'subscription', icon: Crown, label: 'Plans' },
                { id: 'quotes', icon: Moon, label: 'Wisdom' }
              ].map(({ id, icon: Icon, label }) => (
                <motion.button
                  key={id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSection(id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 text-sm ${
                    activeSection === id
                      ? 'bg-mystical-500 text-white'
                      : 'bg-white/10 text-cosmic-200 hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {activeSection === 'emotion' && (
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
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
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
          )}

          {activeSection === 'sound' && <SoundTherapySection />}
          {activeSection === 'horoscope' && <EnhancedAstrologySection />}
          {activeSection === 'premium' && <PremiumSection />}
          {activeSection === 'subscription' && <SubscriptionPlans />}
          {activeSection === 'quotes' && (
            <OshoQuotes 
              emotion={selectedEmotion?.name} 
              context={problem} 
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-cosmic-300 text-sm">
        <p>© 2025 Cosmic Wellness. Transforming lives through AI-powered healing frequencies.</p>
      </footer>
    </div>
  );
}

export default App;