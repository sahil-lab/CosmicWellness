import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { VideoPlayer } from './VideoPlayer';
import { getVideoRecommendations } from '../services/aiService';
import { VideoRecommendation } from '../types';
import { Volume2, Music, Headphones, Waves, Play } from 'lucide-react';

const soundTherapyEmotions = [
  { id: 'stress', name: 'Stress Relief', icon: '😤', description: 'Calm your mind and release tension' },
  { id: 'anxiety', name: 'Anxiety', icon: '😰', description: 'Find peace and reduce worry' },
  { id: 'depression', name: 'Depression', icon: '😔', description: 'Lift your mood and find hope' },
  { id: 'insomnia', name: 'Sleep Issues', icon: '😴', description: 'Deep relaxation for better sleep' },
  { id: 'focus', name: 'Focus & Concentration', icon: '🧠', description: 'Enhance mental clarity' },
  { id: 'healing', name: 'Physical Healing', icon: '💚', description: 'Support body recovery' },
  { id: 'chakra', name: 'Chakra Balancing', icon: '🌈', description: 'Align your energy centers' },
  { id: 'meditation', name: 'Deep Meditation', icon: '🧘', description: 'Transcendental states' }
];

export const SoundTherapySection: React.FC = () => {
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [customDescription, setCustomDescription] = useState('');
  const [videos, setVideos] = useState<VideoRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const handleEmotionSelect = async (emotionId: string, emotionName: string) => {
    setSelectedEmotion(emotionId);
    await fetchSoundTherapy(emotionName, customDescription);
  };

  const fetchSoundTherapy = async (emotion: string, description: string) => {
    setLoading(true);
    try {
      const prompt = description.trim() 
        ? `${emotion} - ${description}` 
        : emotion;
      
      const recommendations = await getVideoRecommendations(emotion, `Sound therapy and healing frequencies for ${prompt}. Focus on binaural beats, solfeggio frequencies, nature sounds, and therapeutic music.`);
      setVideos(recommendations);
    } catch (error) {
      console.error('Error fetching sound therapy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async () => {
    if (!selectedEmotion || !customDescription.trim()) return;
    
    const selectedEmotionData = soundTherapyEmotions.find(e => e.id === selectedEmotion);
    if (selectedEmotionData) {
      await fetchSoundTherapy(selectedEmotionData.name, customDescription);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Volume2 className="w-8 h-8 text-mystical-400" />
          <h2 className="text-3xl font-bold text-white">Sound Therapy Healing</h2>
        </div>
        <p className="text-cosmic-200 text-lg max-w-2xl mx-auto">
          Harness the power of therapeutic frequencies, binaural beats, and healing sounds to transform your mental and physical well-being
        </p>
      </motion.div>

      {/* Emotion Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Music className="w-5 h-5 text-golden-400" />
          What do you need healing for?
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {soundTherapyEmotions.map((emotion, index) => (
            <motion.button
              key={emotion.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEmotionSelect(emotion.id, emotion.name)}
              className={`p-4 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
                selectedEmotion === emotion.id
                  ? 'bg-mystical-500/30 border-mystical-400 shadow-lg shadow-mystical-400/25'
                  : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30'
              }`}
            >
              <div className="text-3xl mb-2">{emotion.icon}</div>
              <h4 className="text-white font-semibold text-sm mb-1">{emotion.name}</h4>
              <p className="text-cosmic-200 text-xs">{emotion.description}</p>
            </motion.button>
          ))}
        </div>

        {/* Custom Description */}
        {selectedEmotion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Headphones className="w-5 h-5 text-mystical-400" />
              Describe your specific needs (optional)
            </h4>
            <div className="space-y-4">
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Tell us more about your situation, symptoms, or what specific healing you're seeking..."
                rows={3}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-mystical-400 transition-colors resize-none"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCustomSubmit}
                disabled={loading}
                className="bg-gradient-to-r from-mystical-500 to-mystical-600 hover:from-mystical-600 hover:to-mystical-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Waves className="w-4 h-4" />
                {loading ? 'Finding Healing Frequencies...' : 'Get Personalized Sound Therapy'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Video Results */}
      {(videos.length > 0 || loading) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <VideoPlayer videos={videos} />
        </motion.div>
      )}

      {/* Sound Therapy Benefits */}
      {!selectedEmotion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-3 gap-6 mt-12"
        >
          <div className="bg-gradient-to-br from-mystical-500/20 to-golden-500/20 rounded-xl p-6 border border-mystical-400/30">
            <Waves className="w-8 h-8 text-mystical-400 mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Binaural Beats</h3>
            <p className="text-cosmic-200 text-sm">
              Synchronize brainwaves for deep relaxation, focus, and healing states
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-golden-500/20 to-mystical-500/20 rounded-xl p-6 border border-golden-400/30">
            <Music className="w-8 h-8 text-golden-400 mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Solfeggio Frequencies</h3>
            <p className="text-cosmic-200 text-sm">
              Ancient healing tones that promote cellular repair and spiritual awakening
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-cosmic-500/20 to-mystical-500/20 rounded-xl p-6 border border-cosmic-400/30">
            <Volume2 className="w-8 h-8 text-cosmic-400 mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Nature Sounds</h3>
            <p className="text-cosmic-200 text-sm">
              Connect with Earth's natural rhythms for grounding and peace
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};