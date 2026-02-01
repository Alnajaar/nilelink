/**
 * Enhanced Decentralized AI Assistant
 * 
 * Features:
 * - Natural language understanding
 * - Wallet-based learning and preferences
 * - Intelligent restaurant recommendations
 * - Order placement from chat
 * - Personalized offers
 * - Client-side encrypted data
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, X, Send, Bot, User, Sparkles,
    Search, ShoppingCart, MapPin, Clock, Star,
    HelpCircle, Zap, Brain, MessageSquare, TrendingUp, Utensils
} from 'lucide-react';
import { useAuth } from '@shared/contexts/AuthContext';
import { useAccount, useSignMessage } from 'wagmi';
import { useRestaurants } from '@/hooks/useRestaurants';
import { decentralizedAI } from '@/lib/services/DecentralizedAIService';
import { useRouter } from 'next/navigation';
import { useLocation } from '@shared/hooks/useLocation';

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    type?: 'text' | 'suggestion' | 'action' | 'restaurant-list';
    actions?: Array<{
        label: string;
        action: () => void;
        icon?: React.ReactNode;
    }>;
    restaurants?: any[];
}

export default function AIAssistant() {
    const { user } = useAuth();
    const { address } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const { restaurants, isLoading: restaurantsLoading } = useRestaurants();
    const { latitude, longitude, city, country, loading: locationLoading } = useLocation();
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize with personalized welcome
    useEffect(() => {
        if (user && messages.length === 0) {
            const userName = user.displayName || user.email?.split('@')[0] || 'there';
            const welcomeMessage: Message = {
                id: 'welcome',
                content: `Hi ${userName}! 👋 I'm NileAI, your intelligent food discovery assistant. I learn from your preferences to give you personalized recommendations. Try asking me:\n\n• "Find me Italian restaurants"\n• "What's good for dinner?"\n• "Show me budget-friendly options"\n• "I want pizza with pepperoni"`,
                sender: 'ai',
                timestamp: new Date(),
                type: 'suggestion',
                actions: [
                    {
                        label: 'Find Restaurants',
                        action: () => handleSendMessage('Find me restaurants nearby'),
                        icon: <Search className="w-4 h-4" />
                    },
                    {
                        label: 'Get Recommendations',
                        action: () => handleSendMessage('What do you recommend?'),
                        icon: <Star className="w-4 h-4" />
                    },
                    {
                        label: 'View Deals',
                        action: () => handleSendMessage('Show me current deals'),
                        icon: <Zap className="w-4 h-4" />
                    }
                ]
            };
            setMessages([welcomeMessage]);
        }
    }, [user, messages.length]);

    const handleSendMessage = async (messageText?: string) => {
        const text = messageText || inputMessage.trim();
        if (!text) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            content: text,
            sender: 'user',
            timestamp: new Date(),
            type: 'text'
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        try {
            // Generate AI response
            const response = await generateIntelligentResponse(text);
            setMessages(prev => [...prev, response]);
        } catch (error) {
            console.error('AI Error:', error);
            const errorMessage: Message = {
                id: Date.now().toString(),
                content: "I'm having trouble processing that right now. Please try again!",
                sender: 'ai',
                timestamp: new Date(),
                type: 'text'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const generateIntelligentResponse = async (userMessage: string): Promise<Message> => {
        const message = userMessage.toLowerCase();

        // Get wallet address for personalization
        const walletAddress = address || user?.uid || 'guest';
        const signMessage = async (msg: string) => {
            if (signMessageAsync) {
                return await signMessageAsync({ message: msg });
            }
            return 'fallback-key'; // Fallback for non-wallet users
        };

        // Parse natural language intent
        const parsed = decentralizedAI.parseNaturalLanguageOrder(userMessage);

        // ========================================================================
        // RESTAURANT SEARCH & RECOMMENDATIONS
        // ========================================================================
        if (parsed.intent === 'search' || message.includes('find') || message.includes('show') || message.includes('restaurant')) {
            try {
                // Use semantic search
                const filtered = await decentralizedAI.semanticSearch(
                    userMessage,
                    restaurants,
                    walletAddress,
                    signMessage
                );

                // Get personalized recommendations
                const recommendations = await decentralizedAI.getRestaurantRecommendations(
                    walletAddress,
                    filtered.length > 0 ? filtered : restaurants,
                    signMessage,
                    latitude && longitude ? { lat: latitude, lng: longitude } : undefined
                );

                if (recommendations.length > 0) {
                    const topPicks = recommendations.slice(0, 5);
                    let responseText = `I found ${topPicks.length} great options for you!\n\n`;

                    topPicks.forEach((rec, idx) => {
                        responseText += `${idx + 1}. **${rec.name}** (${rec.cuisine})\n`;
                        responseText += `   ${rec.reasons.join(' • ')}\n`;
                        if (idx < topPicks.length - 1) responseText += '\n';
                    });

                    return {
                        id: Date.now().toString(),
                        content: responseText,
                        sender: 'ai',
                        timestamp: new Date(),
                        type: 'restaurant-list',
                        restaurants: topPicks.map(r => ({ id: r.id, name: r.name })),
                        actions: topPicks.slice(0, 3).map(rec => ({
                            label: rec.name,
                            action: () => router.push(`/shop/${rec.id}`),
                            icon: <Utensils className="w-4 h-4" />
                        }))
                    };
                }
            } catch (error) {
                console.error('Search error:', error);
            }
        }

        // ========================================================================
        // ORDER PLACEMENT
        // ========================================================================
        if (parsed.intent === 'order' && parsed.items && parsed.items.length > 0) {
            const items = parsed.items.map(item => `• ${item.name}`).join('\n');
            return {
                id: Date.now().toString(),
                content: `Great! I understand you want to order:\n\n${items}\n\nLet me find restaurants that serve these items.`,
                sender: 'ai',
                timestamp: new Date(),
                type: 'action',
                actions: [
                    {
                        label: 'Find Restaurants',
                        action: () => handleSendMessage(`Find restaurants serving ${parsed.items![0].name}`),
                        icon: <Search className="w-4 h-4" />
                    }
                ]
            };
        }

        // ========================================================================
        // PAYMENT & COD INQUIRIES
        // ========================================================================
        if (parsed.intent === 'payment') {
            return {
                id: Date.now().toString(),
                content: "Yes, we support flexible payment options!\n\n• **Cash on Delivery (COD)**\n• Credit/Debit Cards\n• Digital Wallets (Crypto)\n\nYou can choose your validation method at checkout.",
                sender: 'ai',
                timestamp: new Date(),
                type: 'action',
                actions: [
                    {
                        label: 'Start Order',
                        action: () => router.push('/shop'),
                        icon: <ShoppingCart className="w-4 h-4" />
                    }
                ]
            };
        }

        // ========================================================================
        // PERSONALIZED RECOMMENDATIONS
        // ========================================================================
        if (message.includes('recommend') || message.includes('suggest') || message.includes('what') && message.includes('good')) {
            try {
                const recommendations = await decentralizedAI.getRestaurantRecommendations(
                    walletAddress,
                    restaurants,
                    signMessage,
                    latitude && longitude ? { lat: latitude, lng: longitude } : undefined
                );

                if (recommendations.length > 0) {
                    const top3 = recommendations.slice(0, 3);
                    let content = `Based on your preferences, here are my top picks:\n\n`;

                    top3.forEach((rec, idx) => {
                        content += `**${idx + 1}. ${rec.name}**\n`;
                        content += `${rec.reasons[0]}\n`;
                        if (idx < 2) content += '\n';
                    });

                    return {
                        id: Date.now().toString(),
                        content,
                        sender: 'ai',
                        timestamp: new Date(),
                        type: 'suggestion',
                        actions: top3.map(rec => ({
                            label: rec.name,
                            action: () => router.push(`/shop/${rec.id}`),
                            icon: <Star className="w-4 h-4" />
                        }))
                    };
                }
            } catch (error) {
                console.error('Recommendation error:', error);
            }
        }

        // ========================================================================
        // DEALS & OFFERS
        // ========================================================================
        if (message.includes('deal') || message.includes('offer') || message.includes('discount') || message.includes('promo')) {
            return {
                id: Date.now().toString(),
                content: `🎁 Check out our Flash Deals section for the best current offers! I'll keep learning your preferences to show you even more personalized deals.`,
                sender: 'ai',
                timestamp: new Date(),
                type: 'action',
                actions: [
                    {
                        label: 'View Flash Deals',
                        action: () => router.push('/#deals'),
                        icon: <Zap className="w-4 h-4" />
                    }
                ]
            };
        }

        // ========================================================================
        // ORDERS & TRACKING
        // ========================================================================
        if (message.includes('order') && (message.includes('track') || message.includes('status') || message.includes('where'))) {
            return {
                id: Date.now().toString(),
                content: "I can help you track your orders! Check your order history to see the status of all your deliveries.",
                sender: 'ai',
                timestamp: new Date(),
                type: 'action',
                actions: [
                    {
                        label: 'View Orders',
                        action: () => router.push('/orders'),
                        icon: <ShoppingCart className="w-4 h-4" />
                    }
                ]
            };
        }

        // ========================================================================
        // GREETINGS
        // ========================================================================
        if (message.match(/^(hi|hello|hey|sup|yo)/)) {
            return {
                id: Date.now().toString(),
                content: `Hello! 👋 I'm here to help you discover amazing food. I learn from your preferences to give you better recommendations over time. What are you craving today?`,
                sender: 'ai',
                timestamp: new Date(),
                type: 'text'
            };
        }

        // ========================================================================
        // THANKS
        // ========================================================================
        if (message.includes('thank')) {
            return {
                id: Date.now().toString(),
                content: "You're very welcome! I'm always learning to serve you better. 😊",
                sender: 'ai',
                timestamp: new Date(),
                type: 'text'
            };
        }

        // ========================================================================
        // DEFAULT INTELLIGENT RESPONSE
        // ========================================================================
        return {
            id: Date.now().toString(),
            content: `I can help you with:\n\n🔍 **Finding Restaurants** - "Find me Italian food"\n⭐ **Recommendations** - "What's good for dinner?"\n🎁 **Deals & Offers** - "Show me current deals"\n📦 **Order Tracking** - "Track my order"\n\nWhat would you like to know?`,
            sender: 'ai',
            timestamp: new Date(),
            type: 'suggestion',
            actions: [
                {
                    label: 'Find Food',
                    action: () => handleSendMessage('Find me restaurants'),
                    icon: <Search className="w-4 h-4" />
                },
                {
                    label: 'Get Recommendations',
                    action: () => handleSendMessage('Recommend something'),
                    icon: <Star className="w-4 h-4" />
                }
            ]
        };
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X size={28} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            className="relative"
                        >
                            <Brain size={28} />
                            <motion.div
                                className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-28 right-6 z-50 w-96 h-[600px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Brain size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-lg tracking-tight">NileAI Assistant</h3>
                                    <p className="text-xs text-primary-100 font-medium">Intelligent • Personalized • Learning</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                                        <div className={`rounded-2xl p-4 ${msg.sender === 'user'
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-white border border-gray-200 text-gray-900'
                                            }`}>
                                            <p className="text-sm whitespace-pre-wrap font-medium leading-relaxed">
                                                {msg.content}
                                            </p>

                                            {msg.actions && msg.actions.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {msg.actions.map((action, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={action.action}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            {action.icon}
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                                        <div className="flex gap-1">
                                            <motion.div
                                                className="w-2 h-2 bg-primary-400 rounded-full"
                                                animate={{ y: [0, -8, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                                            />
                                            <motion.div
                                                className="w-2 h-2 bg-primary-400 rounded-full"
                                                animate={{ y: [0, -8, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                            />
                                            <motion.div
                                                className="w-2 h-2 bg-primary-400 rounded-full"
                                                animate={{ y: [0, -8, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Ask me anything..."
                                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm font-medium"
                                />
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!inputMessage.trim()}
                                    className="w-12 h-12 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-200 text-white rounded-xl transition-colors flex items-center justify-center"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}