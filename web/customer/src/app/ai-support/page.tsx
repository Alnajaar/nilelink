"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Mic, MicOff, Send, Phone, MessageCircle, Zap, Brain, Sparkles, Volume2, VolumeX, Settings } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { Input } from '@/components/shared/Input';
import AuthGuard from '@shared/components/AuthGuard';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    type?: 'text' | 'voice' | 'suggestion' | 'action';
    actions?: Action[];
    confidence?: number;
}

interface Action {
    label: string;
    action: string;
    type: 'link' | 'function' | 'order';
}

interface AISuggestion {
    id: string;
    title: string;
    description: string;
    category: string;
    urgency: 'low' | 'medium' | 'high';
}

export default function AISupportPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: '👋 Hi! I\'m NileAI, your intelligent food ordering assistant. How can I help you today?',
            sender: 'ai',
            timestamp: new Date(),
            type: 'text'
        }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [smartSuggestions, setSmartSuggestions] = useState<AISuggestion[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize voice recognition
    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setNewMessage(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = () => {
                setIsListening(false);
            };
        }
    }, []);

    const handleVoiceInput = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: newMessage,
            sender: 'user',
            timestamp: new Date(),
            type: 'text'
        };

        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');
        setIsTyping(true);

        // Simulate AI processing
        setTimeout(() => {
            const aiResponse = generateAIResponse(newMessage);
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);

            // Generate smart suggestions based on conversation
            updateSmartSuggestions(newMessage);
        }, 1500);
    };

    const generateAIResponse = (userInput: string): Message => {
        const input = userInput.toLowerCase();
        const actions: Action[] = [];

        let response = '';
        let confidence = 0.85;

        // Order-related queries
        if (input.includes('order') || input.includes('track')) {
            response = '📦 I can help you track your orders! Let me check your recent activity...';
            actions.push(
                { label: 'View Orders', action: '/orders', type: 'link' },
                { label: 'Track Latest', action: '/track', type: 'link' }
            );
        }
        // Payment queries
        else if (input.includes('payment') || input.includes('pay') || input.includes('card')) {
            response = '💳 I can assist with payment methods and billing. Your payments are secure with bank-level encryption.';
            actions.push(
                { label: 'Payment Methods', action: '/profile', type: 'link' },
                { label: 'Billing History', action: '/history', type: 'link' }
            );
        }
        // Restaurant queries
        else if (input.includes('restaurant') || input.includes('food') || input.includes('menu')) {
            response = '🍽️ Looking for great food? I can help you discover amazing restaurants based on your preferences!';
            actions.push(
                { label: 'Browse Restaurants', action: '/restaurants', type: 'link' },
                { label: 'Search Food', action: '/search', type: 'link' }
            );
        }
        // Support queries
        else if (input.includes('help') || input.includes('support') || input.includes('problem')) {
            response = '🆘 I\'m here to help! Let me provide some quick solutions for common issues.';
            actions.push(
                { label: 'Contact Support', action: '/support', type: 'link' },
                { label: 'FAQ', action: '/help', type: 'link' }
            );
        }
        // Loyalty queries
        else if (input.includes('points') || input.includes('loyalty') || input.includes('rewards')) {
            response = '🎁 Your loyalty points are valuable! You can earn and redeem points on every order.';
            actions.push(
                { label: 'View Rewards', action: '/loyalty', type: 'link' },
                { label: 'Earn Points', action: '/orders', type: 'link' }
            );
        }
        else {
            response = '🤖 I\'m learning to better assist you! For complex questions, our human support team is available 24/7. Try asking about orders, payments, restaurants, or loyalty points!';
        }

        return {
            id: (Date.now() + 1).toString(),
            text: response,
            sender: 'ai',
            timestamp: new Date(),
            type: 'text',
            actions,
            confidence
        };
    };

    const updateSmartSuggestions = (userInput: string) => {
        const suggestions: AISuggestion[] = [];

        if (userInput.toLowerCase().includes('order')) {
            suggestions.push({
                id: '1',
                title: 'Reorder Favorite Meal',
                description: 'Quick reorder from your order history',
                category: 'Orders',
                urgency: 'low'
            });
        }

        if (userInput.toLowerCase().includes('track')) {
            suggestions.push({
                id: '2',
                title: 'Real-time Order Tracking',
                description: 'Get live updates on your delivery',
                category: 'Orders',
                urgency: 'high'
            });
        }

        if (userInput.toLowerCase().includes('payment')) {
            suggestions.push({
                id: '3',
                title: 'Update Payment Method',
                description: 'Add or change your payment options',
                category: 'Account',
                urgency: 'medium'
            });
        }

        setSmartSuggestions(suggestions);
    };

    const handleAction = (action: Action) => {
        if (action.type === 'link') {
            window.location.href = action.action;
        }
        // Add more action types as needed
    };

    const quickPrompts = [
        'Track my order',
        'Help with payment',
        'Find restaurants nearby',
        'Check my rewards',
        'Report an issue'
    ];

    return (
        <AuthGuard>
            <div className="min-h-screen bg-background-light">
                <div className="max-w-6xl mx-auto p-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-primary-dark mb-2 flex items-center gap-3">
                            <Brain size={32} className="text-purple-600" />
                            NileAI Support
                        </h1>
                        <p className="text-text-secondary">Advanced AI assistant for all your food ordering needs</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* AI Capabilities Sidebar */}
                        <div className="lg:col-span-1 space-y-4">
                            <Card className="p-4">
                                <h3 className="font-bold text-lg text-primary-dark mb-4 flex items-center gap-2">
                                    <Sparkles size={20} />
                                    AI Features
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Bot size={16} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Smart Responses</p>
                                            <p className="text-text-secondary text-xs">Context-aware answers</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <Mic size={16} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Voice Support</p>
                                            <p className="text-text-secondary text-xs">Speak your questions</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                            <Zap size={16} className="text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Quick Actions</p>
                                            <p className="text-text-secondary text-xs">Direct solutions</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Smart Suggestions */}
                            {smartSuggestions.length > 0 && (
                                <Card className="p-4">
                                    <h3 className="font-bold text-lg text-primary-dark mb-4">💡 Smart Suggestions</h3>
                                    <div className="space-y-3">
                                        {smartSuggestions.map(suggestion => (
                                            <div
                                                key={suggestion.id}
                                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                    suggestion.urgency === 'high'
                                                        ? 'border-red-200 bg-red-50 hover:bg-red-100'
                                                        : suggestion.urgency === 'medium'
                                                        ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
                                                        : 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                                                }`}
                                                onClick={() => setNewMessage(suggestion.title)}
                                            >
                                                <p className="font-medium text-sm">{suggestion.title}</p>
                                                <p className="text-xs text-text-secondary mt-1">{suggestion.description}</p>
                                                <span className={`text-xs px-2 py-1 rounded mt-2 inline-block ${
                                                    suggestion.urgency === 'high'
                                                        ? 'bg-red-200 text-red-800'
                                                        : suggestion.urgency === 'medium'
                                                        ? 'bg-yellow-200 text-yellow-800'
                                                        : 'bg-blue-200 text-blue-800'
                                                }`}>
                                                    {suggestion.category}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Voice Settings */}
                            <Card className="p-4">
                                <h3 className="font-bold text-lg text-primary-dark mb-4 flex items-center gap-2">
                                    <Settings size={20} />
                                    Settings
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Voice Responses</span>
                                        <button
                                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                                            className={`w-12 h-6 rounded-full transition-colors ${
                                                voiceEnabled ? 'bg-green-500' : 'bg-gray-300'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                                voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Voice Input</span>
                                        <button
                                            onClick={handleVoiceInput}
                                            className={`w-12 h-6 rounded-full transition-colors ${
                                                isListening ? 'bg-red-500' : 'bg-gray-300'
                                            }`}
                                            disabled={!recognitionRef.current}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                                isListening ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                        </button>
                                    </div>

                                    {!recognitionRef.current && (
                                        <p className="text-xs text-orange-600">
                                            Voice input requires browser support
                                        </p>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Chat Interface */}
                        <div className="lg:col-span-3">
                            <Card className="p-0 h-[600px] flex flex-col">
                                {/* Chat Header */}
                                <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                            <Brain size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">NileAI Assistant</h3>
                                            <p className="text-sm text-white/80">Advanced AI • Online 24/7</p>
                                        </div>
                                        <div className="ml-auto flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                            <span className="text-sm">AI Active</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-lg px-4 py-3 rounded-2xl ${
                                                    message.sender === 'user'
                                                        ? 'bg-primary text-white'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    {message.sender === 'ai' && <Brain size={16} />}
                                                    {message.sender === 'user' && <User size={16} />}
                                                    <span className="text-xs opacity-70">
                                                        {message.timestamp.toLocaleTimeString()}
                                                    </span>
                                                    {message.confidence && (
                                                        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                                                            {Math.round(message.confidence * 100)}% confident
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm leading-relaxed">{message.text}</p>

                                                {/* Action Buttons */}
                                                {message.actions && message.actions.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {message.actions.map((action, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => handleAction(action)}
                                                                className="px-3 py-1 bg-white/20 hover:bg-white/30 text-xs rounded-full transition-colors"
                                                            >
                                                                {action.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {isTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl">
                                                <div className="flex items-center gap-2">
                                                    <Brain size={16} />
                                                    <div className="flex gap-1">
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                                    </div>
                                                    <span className="text-sm text-gray-500">NileAI is thinking...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Quick Prompts */}
                                <div className="p-4 border-t border-border-light">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {quickPrompts.map((prompt) => (
                                            <button
                                                key={prompt}
                                                onClick={() => setNewMessage(prompt)}
                                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Message Input */}
                                    <div className="flex gap-2">
                                        <Input
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Ask NileAI anything..."
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            className="flex-1"
                                        />

                                        <button
                                            onClick={handleVoiceInput}
                                            className={`p-3 rounded-lg transition-colors ${
                                                isListening
                                                    ? 'bg-red-100 text-red-600 animate-pulse'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                            disabled={!recognitionRef.current}
                                        >
                                            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                                        </button>

                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim() || isTyping}
                                            rightIcon={<Send size={16} />}
                                        >
                                            Send
                                        </Button>
                                    </div>

                                    {isListening && (
                                        <div className="mt-2 text-center">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full">
                                                <Mic size={16} className="animate-pulse" />
                                                <span className="text-sm">Listening...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
