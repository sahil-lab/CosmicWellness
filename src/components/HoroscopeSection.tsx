import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HoroscopeReading, ZodiacSign } from '../types';
import { getHoroscope } from '../services/aiService';
import { zodiacSigns } from '../data/zodiacSigns';
import { Star, Heart, Palette, Hash, Calendar, Sparkles, TrendingUp } from 'lucide-react';

export const HoroscopeSection: React.FC = () => {
  const [horoscope, setHoroscope] = useState<HoroscopeReading | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);
  const [activeDay, setActiveDay] = useState<'yesterday' | 'today' | 'tomorrow'>('today');

  const handleGetHoroscope = async (sign: ZodiacSign) => {
    setSelectedSign(sign);
    setLoading(true);
    try {
      const reading = await getHoroscope(sign.name);
      setHoroscope(reading);
    } catch (error) {
      console.error('Error getting horoscope:', error);
    } finally {
      setLoading(false);
    }
  };

  const getElementColor = (element: string) => {
    switch (element.toLowerCase()) {
      case 'fire': return 'text-red-400 bg-red-500/20';
      case 'earth': return 'text-green-400 bg-green-500/20';
      case 'air': return 'text-blue-400 bg-blue-500/20';
      case 'water': return 'text-cyan-400 bg-cyan-500/20';
      default: return 'text-mystical-400 bg-mystical-500/20';
    }
  };

  const getDayLabel = (day: string) => {
    switch (day) {
      case 'yesterday': return 'Yesterday';
      case 'today': return 'Today';
      case 'tomorrow': return 'Tomorrow';
      default: return day;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          AI Astrology Reading
        </h2>
        <p className="text-cosmic-200 text-lg">
          Discover your cosmic blueprint with advanced astrological analysis
        </p>
      </motion.div>

      {!selectedSign ? (
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h3 className="text-xl font-bold text-white mb-6">Choose Your Zodiac Sign</h3>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {zodiacSigns.map((sign, index) => (
              <motion.button
                key={sign.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleGetHoroscope(sign)}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 group"
              >
                <div className="text-3xl mb-2">{sign.symbol}</div>
                <h4 className="text-white font-semibold text-sm mb-1">{sign.name}</h4>
                <p className="text-cosmic-300 text-xs mb-2">{sign.dates}</p>
                <div className={`inline-block px-2 py-1 rounded-full text-xs ${getElementColor(sign.element)}`}>
                  {sign.element}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Header with selected sign */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{selectedSign.symbol}</div>
                <div>
                  <h3 className="text-2xl font-bold text-mystical-400">{selectedSign.name}</h3>
                  <p className="text-cosmic-200">{selectedSign.dates}</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${getElementColor(selectedSign.element)}`}>
                    {selectedSign.element} Sign
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedSign(null);
                  setHoroscope(null);
                }}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-300"
              >
                Change Sign
              </motion.button>
            </div>
          </motion.div>

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="animate-pulse-slow">
                <Star className="w-16 h-16 text-mystical-400 mx-auto mb-4" />
              </div>
              <p className="text-cosmic-300">Reading the stars for {selectedSign.name}...</p>
            </motion.div>
          ) : horoscope ? (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* 3-Day Navigation */}
              <div className="lg:col-span-3">
                <div className="flex justify-center gap-2 mb-6">
                  {horoscope.readings.map((reading) => (
                    <motion.button
                      key={reading.day}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveDay(reading.day)}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                        activeDay === reading.day
                          ? 'bg-mystical-500 text-white'
                          : 'bg-white/10 text-cosmic-200 hover:bg-white/20'
                      }`}
                    >
                      {getDayLabel(reading.day)}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Daily Reading */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {horoscope.readings
                    .filter(reading => reading.day === activeDay)
                    .map((reading) => (
                      <motion.div
                        key={reading.day}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Calendar className="w-5 h-5 text-mystical-400" />
                          <h4 className="text-xl font-bold text-white">
                            {getDayLabel(reading.day)} - {new Date(reading.date).toLocaleDateString()}
                          </h4>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-white/5 rounded-lg p-4">
                            <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                              <Star className="w-4 h-4 text-golden-400" />
                              Cosmic Prediction
                            </h5>
                            <p className="text-cosmic-200 leading-relaxed">
                              {reading.prediction}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Palette className="w-4 h-4 text-mystical-400" />
                                <span className="text-white text-sm font-medium">Lucky Color</span>
                              </div>
                              <p className="text-cosmic-200 text-sm">{reading.luckyColor}</p>
                            </div>
                            
                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Hash className="w-4 h-4 text-golden-400" />
                                <span className="text-white text-sm font-medium">Lucky Number</span>
                              </div>
                              <p className="text-cosmic-200 text-sm">{reading.luckyNumber}</p>
                            </div>
                          </div>

                          <div className="bg-white/5 rounded-lg p-4">
                            <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-green-400" />
                              Mood Forecast: {reading.mood}
                            </h5>
                            <p className="text-cosmic-200 text-sm leading-relaxed">
                              {reading.advice}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>

              {/* Weekly Overview & Compatibility */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                >
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-mystical-400" />
                    Weekly Overview
                  </h4>
                  <p className="text-cosmic-200 text-sm leading-relaxed">
                    {horoscope.weeklyOverview}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                >
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    Compatibility
                  </h4>
                  <p className="text-cosmic-200 text-sm">
                    Best cosmic match: <span className="text-pink-400 font-semibold">{horoscope.compatibility}</span>
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-mystical-500/20 to-golden-500/20 rounded-xl p-6 border border-mystical-400/30"
                >
                  <h4 className="text-white font-semibold mb-3">Key Traits</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSign.traits.map((trait, index) => (
                      <span
                        key={index}
                        className="bg-white/10 text-cosmic-200 px-3 py-1 rounded-full text-xs"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};