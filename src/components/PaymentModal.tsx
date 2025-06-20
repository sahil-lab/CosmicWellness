import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '../config/stripe';
import { UPIPayment } from './UPIPayment';
import { X, CreditCard, Lock, CheckCircle, Smartphone } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  onSuccess: () => void;
}

const CheckoutForm: React.FC<{
  amount: number;
  description: string;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ amount, description, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setLoading(false);
      return;
    }

    try {
      // Create payment method
      const { error: paymentError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (paymentError) {
        setError(paymentError.message || 'Payment failed');
        setLoading(false);
        return;
      }

      // In a real app, you would send the payment method to your backend
      // For demo purposes, we'll simulate a successful payment
      setTimeout(() => {
        setSucceeded(true);
        setLoading(false);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }, 2000);

    } catch (err) {
      setError('Payment processing failed');
      setLoading(false);
    }
  };

  if (succeeded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
        <p className="text-cosmic-200">Your premium consultation is now available.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Complete Your Payment</h3>
        <p className="text-cosmic-200 mb-4">{description}</p>
        <div className="text-2xl font-bold text-golden-400">${amount}</div>
      </div>

      <div className="bg-white/5 rounded-lg p-4 border border-white/20">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#ffffff',
                '::placeholder': {
                  color: '#94a3b8',
                },
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-lg transition-all duration-300"
        >
          Cancel
        </motion.button>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!stripe || loading}
          className="flex-1 bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Pay ${amount}
            </>
          )}
        </motion.button>
      </div>

      <div className="flex items-center justify-center gap-2 text-cosmic-300 text-sm">
        <Lock className="w-4 h-4" />
        <span>Secured by Stripe</span>
      </div>
    </form>
  );
};

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  description,
  onSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');

  // Convert USD to INR for UPI (approximate rate)
  const amountINR = Math.round(amount * 83);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-cosmic-900 border border-white/20 rounded-2xl p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-cosmic-300 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-6 h-6 text-mystical-400" />
              <h2 className="text-xl font-bold text-white">Secure Payment</h2>
            </div>

            {/* Payment Method Selector */}
            <div className="flex gap-2 mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  paymentMethod === 'card'
                    ? 'bg-mystical-500 text-white'
                    : 'bg-white/10 text-cosmic-200 hover:bg-white/20'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Card
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMethod('upi')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  paymentMethod === 'upi'
                    ? 'bg-mystical-500 text-white'
                    : 'bg-white/10 text-cosmic-200 hover:bg-white/20'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                UPI
              </motion.button>
            </div>

            {/* Payment Forms */}
            <AnimatePresence mode="wait">
              {paymentMethod === 'card' ? (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Elements stripe={stripePromise}>
                    <CheckoutForm
                      amount={amount}
                      description={description}
                      onSuccess={onSuccess}
                      onClose={onClose}
                    />
                  </Elements>
                </motion.div>
              ) : (
                <motion.div
                  key="upi"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <UPIPayment
                    amount={amountINR}
                    description={description}
                    onSuccess={onSuccess}
                    onCancel={onClose}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};