import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OshoQuote } from '../types';
import { getOshoQuote } from '../services/aiService';
import { Quote, RefreshCw, Heart } from 'lucide-react';

interface OshoQuotesProps {
  emotion?: string;
  context?: string;
}

export const OshoQuotes: React.FC<OshoQuotesProps> = ({ emotion, context }) => {
  const [quote, setQuote] = useState<OshoQuote | null>(null);
  const [loading, setLoading] = useState(false);

  const defaultQuotes: OshoQuote[] = [
    {
      text: "Be realistic: Plan for a miracle.",
      category: "Hope",
      relevance: 90
    },
    {
      text: "The moment you accept yourself, you become beautiful.",
      category: "Self-Love",
      relevance: 95
    },
    {
      text: "Drop the idea of becoming someone, because you are already a masterpiece.",
      category: "Self-Worth",
      relevance: 92
    },
    {
      text: "Life begins where fear ends.",
      category: "Courage",
      relevance: 88
    },
    {
      text: "The real question is not whether life exists after death. The real question is whether you are alive before death.",
      category: "Presence",
      relevance: 94
    }
  ];

  const fetchQuote = async () => {
    setLoading(true);
    try {
      if (emotion && context) {
        const aiQuote = await getOshoQuote(emotion, context);
        setQuote(aiQuote);
      } else {
        const randomQuote = defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
        setQuote(randomQuote);
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      const fallbackQuote = defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
      setQuote(fallbackQuote);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, [emotion, context]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Quote className="w-8 h-8 text-mystical-400" />
          <h2 className="text-3xl font-bold text-white">Wisdom from Osho</h2>
        </div>
        <p className="text-cosmic-200 text-lg">
          Ancient wisdom for modern hearts
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-mystical-500/20 to-golden-500/20 backdrop-blur-sm rounded-2xl p-8 border border-mystical-400/30 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 left-4 w-24 h-24 border border-white rounded-full"></div>
          <div className="absolute bottom-4 right-4 w-32 h-32 border border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white rounded-full"></div>
        </div>

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="animate-pulse-slow">
                  <Heart className="w-12 h-12 text-mystical-400 mx-auto mb-4" />
                </div>
                <p className="text-cosmic-300">Channeling wisdom...</p>
              </motion.div>
            ) : quote ? (
              <motion.div
                key="quote"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <Quote className="w-12 h-12 text-mystical-400 mx-auto mb-6 opacity-50" />
                
                <blockquote className="text-xl md:text-2xl text-white font-light leading-relaxed mb-8 italic">
                  "{quote.text}"
                </blockquote>
                
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="bg-mystical-500/30 px-4 py-2 rounded-full">
                    <span className="text-mystical-300 text-sm">
                      Category: {quote.category}
                    </span>
                  </div>
                  <div className="bg-golden-500/30 px-4 py-2 rounded-full">
                    <span className="text-golden-300 text-sm">
                      Relevance: {quote.relevance}%
                    </span>
                  </div>
                </div>
                
                <p className="text-golden-400 text-lg font-semibold">
                  — Osho
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
          
          <div className="flex justify-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchQuote}
              disabled={loading}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              New Wisdom
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};