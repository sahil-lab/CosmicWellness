import React from 'react';
import { motion } from 'framer-motion';
import { emotions } from '../data/emotions';
import { Emotion } from '../types';

interface EmotionSelectorProps {
  selectedEmotion: string;
  onEmotionSelect: (emotion: Emotion) => void;
}

export const EmotionSelector: React.FC<EmotionSelectorProps> = ({
  selectedEmotion,
  onEmotionSelect
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          How are you feeling today?
        </h2>
        <p className="text-cosmic-200 text-lg">
          Share your emotional state and let our AI guide you to healing frequencies
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {emotions.map((emotion, index) => (
          <motion.button
            key={emotion.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEmotionSelect(emotion)}
            className={`
              p-6 rounded-xl backdrop-blur-sm border transition-all duration-300
              ${selectedEmotion === emotion.id
                ? 'bg-white/20 border-golden-400 shadow-lg shadow-golden-400/25'
                : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30'
              }
            `}
          >
            <div className="text-4xl mb-3">{emotion.icon}</div>
            <h3 className="text-white font-semibold text-lg mb-2">
              {emotion.name}
            </h3>
            <p className="text-cosmic-200 text-sm">
              {emotion.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};