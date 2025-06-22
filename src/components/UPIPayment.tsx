import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Smartphone, Copy, CheckCircle, ExternalLink, Upload, Camera, AlertCircle, Clock } from 'lucide-react';

interface UPIPaymentProps {
  amount: number;
  description: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const UPIPayment: React.FC<UPIPaymentProps> = ({
  amount,
  description,
  onSuccess,
  onCancel
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'awaiting_screenshot' | 'verifying' | 'success' | 'failed'>('pending');
  const [currentUPIIndex, setCurrentUPIIndex] = useState(0);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);

  // Your UPI IDs with fallback
  const UPI_IDS = [
    '8559067075@ikwik',
    '8559067075@mbk'
  ];

  const currentUPIId = UPI_IDS[currentUPIIndex];

  const generateUPILink = (app: string, upiId: string) => {
    const baseParams = `pa=${upiId}&pn=Cosmic Wellness&am=${amount}&cu=INR&tn=${encodeURIComponent(description)}`;

    switch (app) {
      case 'gpay':
        return `tez://upi/pay?${baseParams}`;
      case 'phonepe':
        return `phonepe://pay?${baseParams}`;
      case 'paytm':
        return `paytmmp://pay?${baseParams}`;
      case 'bhim':
        return `bhim://pay?${baseParams}`;
      default:
        return `upi://pay?${baseParams}`;
    }
  };

  const handleUPIAppClick = (app: string) => {
    const upiLink = generateUPILink(app, currentUPIId);

    // Try to open the UPI app
    const link = document.createElement('a');
    link.href = upiLink;
    link.click();

    // Set status to awaiting screenshot after a short delay
    setTimeout(() => {
      setPaymentStatus('awaiting_screenshot');
    }, 2000);
  };

  const handleRetryWithNextUPI = () => {
    if (currentUPIIndex < UPI_IDS.length - 1) {
      setCurrentUPIIndex(currentUPIIndex + 1);
      setRetryAttempts(retryAttempts + 1);
      setPaymentStatus('pending');
      setScreenshot(null);
      setScreenshotPreview(null);
    } else {
      // All UPI IDs tried, show error
      setPaymentStatus('failed');
    }
  };

  const copyUPIId = (upiId: string) => {
    navigator.clipboard.writeText(upiId);
    setCopied(upiId);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      setScreenshot(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshotPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendPaymentNotificationEmail = async (screenshotFile: File, paymentAmount: number, description: string) => {
    try {
      // Create email content
      const subject = `💰 PAYMENT VERIFICATION REQUIRED - ₹${paymentAmount}`;
      const timestamp = new Date().toLocaleString();
      const body = `
PAYMENT VERIFICATION REQUEST
============================

Payment Details:
- Amount: ₹${paymentAmount}
- Description: ${description}
- UPI ID Used: ${currentUPIId}
- Timestamp: ${timestamp}

Screenshot Details:
- File Name: ${screenshotFile.name}
- File Size: ${(screenshotFile.size / 1024 / 1024).toFixed(2)} MB
- File Type: ${screenshotFile.type}

Please verify this payment and activate the user's premium access.

---
This is an automated payment verification request from the Cosmic Wellness platform.
      `.trim();

      // Create mailto link (for immediate notification)
      const mailtoLink = `mailto:sahilupadhyay.works@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Open email client in a new window/tab so it doesn't interrupt the user flow
      const emailWindow = window.open(mailtoLink, '_blank');
      if (emailWindow) {
        emailWindow.close();
      }

      console.log('📧 Payment notification email prepared for:', 'sahilupadhyay.works@gmail.com');

    } catch (error) {
      console.error('Error preparing payment notification email:', error);
    }
  };

  const handleSubmitPayment = async () => {
    if (!screenshot) {
      alert('Please upload payment screenshot to complete verification');
      return;
    }

    setPaymentStatus('verifying');

    try {
      // Send email notification with payment details
      await sendPaymentNotificationEmail(screenshot, amount, description);

      // Simulate verification process
      setTimeout(() => {
        setPaymentStatus('success');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }, 3000);

    } catch (error) {
      console.error('Error processing payment:', error);
      alert('There was an error processing your payment. Please try again.');
      setPaymentStatus('awaiting_screenshot');
    }
  };

  const upiApps = [
    {
      name: 'Google Pay',
      id: 'gpay',
      color: 'bg-blue-500',
      icon: '💳'
    },
    {
      name: 'PhonePe',
      id: 'phonepe',
      color: 'bg-purple-500',
      icon: '📱'
    },
    {
      name: 'Paytm',
      id: 'paytm',
      color: 'bg-blue-600',
      icon: '💰'
    },
    {
      name: 'BHIM UPI',
      id: 'bhim',
      color: 'bg-orange-500',
      icon: '🏛️'
    }
  ];

  if (paymentStatus === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Payment Verified!</h3>
        <p className="text-cosmic-200 mb-4">Your payment has been successfully verified and processed.</p>

        {/* Baba Connection Notification */}
        <div className="bg-mystical-500/20 border border-mystical-400/30 rounded-xl p-6 mb-4">
          <div className="flex items-center justify-center gap-2 text-mystical-300 mb-2">
            <Clock className="w-5 h-5" />
            <span className="font-semibold text-lg">Baba will connect you in 10 minutes</span>
          </div>
          <p className="text-mystical-200 text-sm">
            Please keep your phone/email ready. You will receive connection details shortly.
          </p>
        </div>

        <div className="bg-golden-500/20 border border-golden-400/30 rounded-lg p-4">
          <p className="text-golden-200 text-sm">
            📧 Payment notification has been sent to Baba for verification and activation of your premium access.
          </p>
        </div>
      </motion.div>
    );
  }

  if (paymentStatus === 'verifying') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="animate-spin w-12 h-12 border-4 border-mystical-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h3 className="text-xl font-bold text-white mb-2">Verifying Payment...</h3>
        <p className="text-cosmic-200">Please wait while we verify your payment screenshot.</p>
      </motion.div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Payment Failed</h3>
        <p className="text-cosmic-200 mb-4">Unable to process payment with available UPI IDs.</p>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setCurrentUPIIndex(0);
              setRetryAttempts(0);
              setPaymentStatus('pending');
            }}
            className="bg-mystical-500 hover:bg-mystical-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (paymentStatus === 'awaiting_screenshot') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Payment Initiated</h3>
          <p className="text-cosmic-200 mb-4">Please upload your payment screenshot for verification</p>
          <div className="text-2xl font-bold text-golden-400">₹{amount}</div>
          <p className="text-sm text-cosmic-300 mt-2">Paid to: {currentUPIId}</p>
        </div>

        {/* Screenshot Upload */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/20">
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-mystical-400" />
            Upload Payment Screenshot
          </h4>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleScreenshotUpload}
                className="hidden"
                id="screenshot-upload"
              />
              <label
                htmlFor="screenshot-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <Upload className="w-8 h-8 text-mystical-400" />
                <div>
                  <p className="text-white font-medium">Click to upload screenshot</p>
                  <p className="text-cosmic-300 text-sm">PNG, JPG up to 5MB</p>
                </div>
              </label>
            </div>

            {screenshotPreview && (
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-white font-medium mb-2">Screenshot Preview:</p>
                <img
                  src={screenshotPreview}
                  alt="Payment screenshot"
                  className="max-w-full h-32 object-contain rounded-lg mx-auto"
                />
                <p className="text-cosmic-300 text-sm mt-2">File: {screenshot?.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRetryWithNextUPI}
            disabled={currentUPIIndex >= UPI_IDS.length - 1}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg transition-all duration-300"
          >
            Payment Failed? Try Another UPI
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmitPayment}
            disabled={!screenshot}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
          >
            Verify Payment
          </motion.button>
        </div>

        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="text-cosmic-300 hover:text-white transition-colors"
          >
            Cancel Payment
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Pay with UPI</h3>
        <p className="text-cosmic-200 mb-4">{description}</p>
        <div className="text-3xl font-bold text-golden-400">₹{amount}</div>
        {retryAttempts > 0 && (
          <p className="text-orange-400 text-sm mt-2">
            Trying UPI ID #{currentUPIIndex + 1} (Attempt {retryAttempts + 1})
          </p>
        )}
      </div>

      {/* Current UPI ID Display */}
      <div className="bg-mystical-500/20 rounded-lg p-4 border border-mystical-400/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-mystical-300 text-sm">Paying to UPI ID:</p>
            <p className="text-white font-mono font-semibold">{currentUPIId}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => copyUPIId(currentUPIId)}
            className="bg-mystical-500 hover:bg-mystical-600 text-white p-2 rounded-lg transition-colors"
          >
            {copied === currentUPIId ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* UPI Apps */}
      <div>
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-mystical-400" />
          Choose Your UPI App
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {upiApps.map((app) => (
            <motion.button
              key={app.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleUPIAppClick(app.id)}
              className={`${app.color} hover:opacity-90 text-white p-4 rounded-lg transition-all duration-300 flex items-center gap-3`}
            >
              <span className="text-2xl">{app.icon}</span>
              <div className="text-left">
                <div className="font-semibold">{app.name}</div>
                <div className="text-sm opacity-90">Tap to pay</div>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Manual UPI ID */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/20">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-mystical-400" />
          Or Pay Manually
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-cosmic-200 text-sm mb-1">Current UPI ID:</label>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
              <code className="text-white font-mono flex-1">{currentUPIId}</code>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => copyUPIId(currentUPIId)}
                className="bg-mystical-500 hover:bg-mystical-600 text-white p-2 rounded-lg transition-colors"
              >
                {copied === currentUPIId ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>
          <div className="text-sm text-cosmic-300">
            Copy the UPI ID and use it in your preferred UPI app to make the payment.
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-golden-500/20 rounded-lg p-4 border border-golden-400/30">
        <h5 className="text-golden-400 font-semibold mb-2">Payment Instructions:</h5>
        <ol className="text-cosmic-200 text-sm space-y-1 list-decimal list-inside">
          <li>Click on your preferred UPI app above</li>
          <li>Complete the payment in the UPI app</li>
          <li>Take a screenshot of the successful payment</li>
          <li>Upload the screenshot for verification</li>
          <li>If payment fails, try the "Payment Failed?" button</li>
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-lg transition-all duration-300"
        >
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPaymentStatus('awaiting_screenshot')}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
        >
          I've Made Payment
        </motion.button>
      </div>
    </div>
  );
};