import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PremiumConsultation } from '../types';
import { getPremiumConsultation } from '../services/aiService';
import { PaymentModal } from './PaymentModal';
import { Crown, MessageCircle, Clock, Star, CheckCircle, CreditCard } from 'lucide-react';

export const PremiumSection: React.FC = () => {
  const [consultation, setConsultation] = useState<PremiumConsultation | null>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [complexity, setComplexity] = useState<'simple' | 'moderate' | 'complex'>('simple');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const complexityPricing = {
    simple: 9.99,
    moderate: 19.99,
    complex: 39.99
  };

  const handlePaymentSuccess = async () => {
    setPaymentCompleted(true);
    setShowPayment(false);
    
    // Now process the consultation
    setLoading(true);
    try {
      const response = await getPremiumConsultation(question, complexity);
      const newConsultation: PremiumConsultation = {
        id: Date.now().toString(),
        question,
        complexity,
        price: complexityPricing[complexity],
        response,
        status: 'answered',
        timestamp: new Date()
      };
      setConsultation(newConsultation);
    } catch (error) {
      console.error('Error getting consultation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = () => {
    if (!question.trim()) return;
    setShowPayment(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="w-8 h-8 text-golden-400" />
          <h2 className="text-3xl font-bold text-white">Premium Consultation</h2>
        </div>
        <p className="text-cosmic-200 text-lg max-w-2xl mx-auto">
          Ask anything and receive the most reliable, personalized solutions from our advanced AI wisdom
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* Pricing Cards */}
        {Object.entries(complexityPricing).map(([level, price], index) => (
          <motion.div
            key={level}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 cursor-pointer ${
              complexity === level 
                ? 'border-golden-400 shadow-lg shadow-golden-400/25' 
                : 'border-white/20 hover:border-white/30'
            }`}
            onClick={() => setComplexity(level as any)}
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2 capitalize">
                {level} Question
              </h3>
              <div className="text-3xl font-bold text-golden-400 mb-4">
                ${price}
              </div>
              <div className="space-y-2 text-sm text-cosmic-200">
                {level === 'simple' && (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Quick insights
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Basic guidance
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      5-minute response
                    </div>
                  </>
                )}
                {level === 'moderate' && (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Detailed analysis
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Action plan included
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      10-minute response
                    </div>
                  </>
                )}
                {level === 'complex' && (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Comprehensive solution
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Multi-perspective analysis
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      15-minute deep dive
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Question Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-mystical-400" />
            Ask Your Question
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-cosmic-200 text-sm font-medium mb-2">
                What would you like guidance on?
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Share your situation, challenge, or question. The more details you provide, the better our AI can help you..."
                rows={6}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-mystical-400 transition-colors resize-none"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-cosmic-200">
                Selected: <span className="text-golden-400 font-semibold capitalize">
                  {complexity} - ${complexityPricing[complexity]}
                </span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitQuestion}
                disabled={loading || !question.trim()}
                className="bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                {loading ? 'Processing...' : 'Pay & Get Answer'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Answer Display */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-golden-400" />
            Your Personal Guidance
          </h3>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse-slow">
                <Crown className="w-16 h-16 text-golden-400 mx-auto mb-4" />
              </div>
              <p className="text-cosmic-300">
                Processing your premium consultation...
              </p>
            </div>
          ) : consultation ? (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Your Question:</h4>
                <p className="text-cosmic-200 text-sm italic">
                  "{consultation.question}"
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-mystical-500/20 to-golden-500/20 rounded-lg p-4 border border-mystical-400/30">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-golden-400" />
                  Premium Guidance
                </h4>
                <div className="text-cosmic-100 leading-relaxed whitespace-pre-wrap">
                  {consultation.response}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-cosmic-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {consultation.timestamp.toLocaleTimeString()}
                </div>
                <div className="text-golden-400 font-semibold">
                  ${consultation.price}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="animate-pulse-slow">
                <Crown className="w-16 h-16 text-golden-400 mx-auto mb-4" />
              </div>
              <p className="text-cosmic-300">
                Ask your question and complete payment to receive personalized wisdom and guidance
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        amount={complexityPricing[complexity]}
        description={`${complexity.charAt(0).toUpperCase() + complexity.slice(1)} Premium Consultation`}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};