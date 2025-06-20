import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PaymentModal } from './PaymentModal';
import { Crown, Star, Zap, CheckCircle, CreditCard, X } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  priceINR: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  free?: boolean;
  icon: React.ReactNode;
}

export const SubscriptionPlans: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [subscribedPlan, setSubscribedPlan] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Cosmic Explorer',
      price: 0,
      priceINR: 0,
      interval: 'month',
      free: true,
      icon: <Star className="w-6 h-6" />,
      features: [
        '3 Basic healing videos per day',
        'Daily horoscope for one sign',
        'Basic sound therapy access',
        'Limited Osho wisdom quotes',
        'Community support'
      ]
    },
    {
      id: 'premium',
      name: 'Mystical Master',
      price: 19.99,
      priceINR: 1599,
      interval: 'month',
      popular: true,
      icon: <Crown className="w-6 h-6" />,
      features: [
        'Unlimited healing videos & sound therapy',
        'Advanced AI horoscope for all signs',
        'Premium consultations (5 per month)',
        'Personalized meditation plans',
        'Full Osho wisdom library',
        'Priority support',
        'Exclusive content access'
      ]
    },
    {
      id: 'ultimate',
      name: 'Cosmic Sage',
      price: 39.99,
      priceINR: 3199,
      interval: 'month',
      icon: <Zap className="w-6 h-6" />,
      features: [
        'Everything in Mystical Master',
        'Unlimited premium consultations',
        'One-on-one spiritual coaching',
        'Custom healing frequency creation',
        'Advanced birth chart analysis',
        'VIP community access',
        '24/7 priority support',
        'Early access to new features'
      ]
    }
  ];

  const handleSubscribe = (plan: Plan) => {
    if (plan.free) {
      setSubscribedPlan(plan.id);
      return;
    }
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    if (selectedPlan) {
      setSubscribedPlan(selectedPlan.id);
      setShowPayment(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          Choose Your Cosmic Journey
        </h2>
        <p className="text-cosmic-200 text-lg max-w-2xl mx-auto">
          Start free and upgrade anytime to unlock the full power of AI-guided spiritual transformation
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 ${
              plan.popular
                ? 'border-golden-400 shadow-lg shadow-golden-400/25 scale-105'
                : plan.free
                ? 'border-green-400 shadow-lg shadow-green-400/25'
                : 'border-white/20 hover:border-white/30'
            } ${
              subscribedPlan === plan.id
                ? 'ring-2 ring-green-400'
                : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-golden-500 to-golden-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              </div>
            )}

            {plan.free && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Free Forever
                </div>
              </div>
            )}

            {subscribedPlan === plan.id && (
              <div className="absolute -top-4 right-4">
                <div className="bg-green-500 text-white p-2 rounded-full">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                plan.popular 
                  ? 'bg-golden-500/20 text-golden-400' 
                  : plan.free
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-mystical-500/20 text-mystical-400'
              }`}>
                {plan.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              
              <div className="mb-4">
                {plan.free ? (
                  <div className="text-4xl font-bold text-green-400">FREE</div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-4xl font-bold text-white">${plan.price}</span>
                      <span className="text-cosmic-300">/{plan.interval}</span>
                    </div>
                    <div className="text-sm text-cosmic-300 mt-1">
                      or ₹{plan.priceINR}/{plan.interval}
                    </div>
                  </>
                )}
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-cosmic-200 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSubscribe(plan)}
              disabled={subscribedPlan === plan.id}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                subscribedPlan === plan.id
                  ? 'bg-green-500 text-white cursor-default'
                  : plan.free
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                  : plan.popular
                  ? 'bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700 text-white'
                  : 'bg-gradient-to-r from-mystical-500 to-mystical-600 hover:from-mystical-600 hover:to-mystical-700 text-white'
              }`}
            >
              {subscribedPlan === plan.id ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Active Plan
                </>
              ) : plan.free ? (
                <>
                  <Star className="w-4 h-4" />
                  Start Free
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Subscribe Now
                </>
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Plan Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-xl font-bold text-white mb-6 text-center">Why Upgrade?</h3>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <Star className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h4 className="text-white font-semibold mb-2">Free Tier</h4>
            <p className="text-cosmic-200 text-sm">Perfect for exploring cosmic wellness basics</p>
          </div>
          <div>
            <Crown className="w-8 h-8 text-golden-400 mx-auto mb-2" />
            <h4 className="text-white font-semibold mb-2">Premium Plans</h4>
            <p className="text-cosmic-200 text-sm">Unlock unlimited AI-powered healing and guidance</p>
          </div>
          <div>
            <Zap className="w-8 h-8 text-mystical-400 mx-auto mb-2" />
            <h4 className="text-white font-semibold mb-2">Ultimate Experience</h4>
            <p className="text-cosmic-200 text-sm">Complete spiritual transformation with personal coaching</p>
          </div>
        </div>
      </motion.div>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          amount={selectedPlan.price}
          description={`${selectedPlan.name} - Monthly Subscription`}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};