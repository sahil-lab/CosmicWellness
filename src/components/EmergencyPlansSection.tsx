import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Mail,
    Phone,
    Clock,
    Heart,
    Shield,
    Send,
    CheckCircle,
    Loader
} from 'lucide-react';

interface EmergencyContact {
    name: string;
    email: string;
    phone?: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    description: string;
}

const emergencyPlans = [
    {
        id: 'spiritual_crisis',
        title: 'Spiritual Crisis',
        icon: '🌟',
        urgency: 'high' as const,
        description: 'Sudden spiritual awakening, dark night of the soul, or overwhelming psychic experiences',
        color: 'from-mystical-500 to-purple-600'
    },
    {
        id: 'relationship_emergency',
        title: 'Relationship Emergency',
        icon: '💔',
        urgency: 'medium' as const,
        description: 'Urgent relationship issues, breakups, or family conflicts needing immediate guidance',
        color: 'from-pink-500 to-red-600'
    },
    {
        id: 'career_crisis',
        title: 'Career Crisis',
        icon: '💼',
        urgency: 'medium' as const,
        description: 'Job loss, career confusion, or urgent professional decisions',
        color: 'from-blue-500 to-indigo-600'
    },
    {
        id: 'health_concern',
        title: 'Health & Wellness Crisis',
        icon: '🏥',
        urgency: 'high' as const,
        description: 'Urgent health concerns, mental health crisis, or wellness emergencies',
        color: 'from-green-500 to-emerald-600'
    },
    {
        id: 'financial_emergency',
        title: 'Financial Emergency',
        icon: '💰',
        urgency: 'high' as const,
        description: 'Urgent financial decisions, money problems, or investment guidance needed',
        color: 'from-yellow-500 to-orange-600'
    },
    {
        id: 'general_emergency',
        title: 'General Life Emergency',
        icon: '🆘',
        urgency: 'critical' as const,
        description: 'Any other urgent life situation requiring immediate spiritual or astrological guidance',
        color: 'from-red-500 to-red-700'
    }
];

export const EmergencyPlansSection: React.FC = () => {
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        phone: '',
        situation: '',
        urgency: 'medium' as 'low' | 'medium' | 'high' | 'critical'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handlePlanSelect = (planId: string) => {
        setSelectedPlan(planId);
        const plan = emergencyPlans.find(p => p.id === planId);
        if (plan) {
            setContactForm(prev => ({
                ...prev,
                urgency: plan.urgency,
                situation: plan.description
            }));
        }
    };

    const sendEmergencyEmail = async (contactData: EmergencyContact) => {
        // Create email content
        const subject = `🚨 EMERGENCY CONSULTATION REQUEST - ${contactData.urgency.toUpperCase()} PRIORITY`;
        const body = `
EMERGENCY CONSULTATION REQUEST
==============================

Client Information:
- Name: ${contactData.name}
- Email: ${contactData.email}
- Phone: ${contactData.phone || 'Not provided'}

Emergency Details:
- Urgency Level: ${contactData.urgency.toUpperCase()}
- Situation: ${contactData.description}

Detailed Description:
${contactData.description}

---
This is an automated emergency consultation request from the Cosmic Wellness platform.
Please respond as soon as possible based on the urgency level.

Timestamp: ${new Date().toLocaleString()}
    `.trim();

        // Create mailto link
        const mailtoLink = `mailto:sahilupadhyay.works@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Open email client
        window.location.href = mailtoLink;

        // Also try to send via web API if available (fallback)
        try {
            const response = await fetch('/api/send-emergency-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: 'sahilupadhyay.works@gmail.com',
                    subject,
                    body,
                    urgency: contactData.urgency
                })
            });

            if (!response.ok) {
                console.log('Web API email failed, using mailto as fallback');
            }
        } catch (error) {
            console.log('Web API not available, using mailto');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!contactForm.name || !contactForm.email || !contactForm.situation) {
            alert('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);

        try {
            await sendEmergencyEmail({
                name: contactForm.name,
                email: contactForm.email,
                phone: contactForm.phone,
                urgency: contactForm.urgency,
                description: contactForm.situation
            });

            setSubmitted(true);

            // Reset form after 5 seconds
            setTimeout(() => {
                setSubmitted(false);
                setSelectedPlan('');
                setContactForm({
                    name: '',
                    email: '',
                    phone: '',
                    situation: '',
                    urgency: 'medium'
                });
            }, 5000);

        } catch (error) {
            console.error('Error sending emergency email:', error);
            alert('There was an error sending your emergency request. Please try again or contact directly at sahilupadhyay.works@gmail.com');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
            case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
            case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
            case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
        }
    };

    if (submitted) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                >
                    <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-4">Emergency Request Sent!</h2>
                    <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6 mb-6">
                        <p className="text-green-200 text-lg mb-2">
                            Your emergency consultation request has been sent to Baba.
                        </p>
                        <p className="text-green-300 font-semibold">
                            📧 Email sent to: sahilupadhyay.works@gmail.com
                        </p>
                    </div>
                    <div className="bg-mystical-500/20 border border-mystical-400/30 rounded-xl p-6">
                        <p className="text-mystical-200 text-lg">
                            <Clock className="w-5 h-5 inline mr-2" />
                            Expected response time based on urgency:
                        </p>
                        <div className="mt-3">
                            {contactForm.urgency === 'critical' && (
                                <span className="text-red-300 font-bold">Within 15-30 minutes</span>
                            )}
                            {contactForm.urgency === 'high' && (
                                <span className="text-orange-300 font-bold">Within 1-2 hours</span>
                            )}
                            {contactForm.urgency === 'medium' && (
                                <span className="text-yellow-300 font-bold">Within 2-6 hours</span>
                            )}
                            {contactForm.urgency === 'low' && (
                                <span className="text-green-300 font-bold">Within 24 hours</span>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="flex items-center justify-center gap-2 mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                    <h2 className="text-3xl font-bold text-white">Emergency Spiritual Consultation</h2>
                </div>
                <p className="text-cosmic-200 text-lg max-w-3xl mx-auto">
                    Need urgent spiritual guidance? Connect directly with Baba for immediate consultation on critical life situations
                </p>

                <div className="mt-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-center gap-2 text-red-300 mb-2">
                        <Mail className="w-5 h-5" />
                        <span className="font-semibold">Direct Contact: sahilupadhyay.works@gmail.com</span>
                    </div>
                    <p className="text-red-200 text-sm">
                        For immediate assistance, you can also email directly at the above address
                    </p>
                </div>
            </motion.div>

            {!selectedPlan ? (
                <div>
                    <h3 className="text-xl font-bold text-white mb-6 text-center">
                        Select Your Emergency Type
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {emergencyPlans.map((plan, index) => (
                            <motion.button
                                key={plan.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handlePlanSelect(plan.id)}
                                className={`bg-gradient-to-br ${plan.color} rounded-xl p-6 text-white text-left hover:shadow-lg hover:shadow-white/10 transition-all duration-300`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="text-4xl">{plan.icon}</div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(plan.urgency)}`}>
                                        {plan.urgency.toUpperCase()}
                                    </div>
                                </div>
                                <h4 className="text-lg font-bold mb-2">{plan.title}</h4>
                                <p className="text-sm opacity-90">{plan.description}</p>
                            </motion.button>
                        ))}
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => setSelectedPlan('')}
                            className="text-cosmic-300 hover:text-white transition-colors"
                        >
                            ← Back to Emergency Types
                        </button>
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getUrgencyColor(contactForm.urgency)}`}>
                            {contactForm.urgency.toUpperCase()} PRIORITY
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-white font-semibold mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={contactForm.name}
                                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-mystical-400 transition-colors"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={contactForm.email}
                                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-mystical-400 transition-colors"
                                    placeholder="your.email@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">
                                    Phone Number (Optional)
                                </label>
                                <input
                                    type="tel"
                                    value={contactForm.phone}
                                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-mystical-400 transition-colors"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">
                                    Urgency Level
                                </label>
                                <select
                                    value={contactForm.urgency}
                                    onChange={(e) => setContactForm(prev => ({ ...prev, urgency: e.target.value as any }))}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-mystical-400 transition-colors"
                                >
                                    <option value="low" className="bg-cosmic-800">Low - Within 24 hours</option>
                                    <option value="medium" className="bg-cosmic-800">Medium - Within 2-6 hours</option>
                                    <option value="high" className="bg-cosmic-800">High - Within 1-2 hours</option>
                                    <option value="critical" className="bg-cosmic-800">Critical - Within 15-30 minutes</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2">
                                Describe Your Emergency Situation *
                            </label>
                            <textarea
                                value={contactForm.situation}
                                onChange={(e) => setContactForm(prev => ({ ...prev, situation: e.target.value }))}
                                rows={6}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-cosmic-400 focus:outline-none focus:border-mystical-400 transition-colors resize-none"
                                placeholder="Please describe your situation in detail. Include any relevant background information, specific questions, and what kind of guidance you're seeking..."
                                required
                            />
                        </div>

                        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                            <h4 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Privacy & Confidentiality
                            </h4>
                            <p className="text-yellow-200 text-sm">
                                All emergency consultations are completely confidential. Your information will only be used to provide you with the spiritual guidance you need.
                            </p>
                        </div>

                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Sending Emergency Request...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Send Emergency Consultation Request
                                </>
                            )}
                        </motion.button>
                    </form>
                </motion.div>
            )}
        </div>
    );
}; 