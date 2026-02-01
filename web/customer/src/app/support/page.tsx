"use client";

import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, HelpCircle, Clock, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { Input } from '@/components/shared/Input';
import AuthGuard from '@shared/components/AuthGuard';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'support';
    timestamp: Date;
    isBot?: boolean;
}

export default function SupportPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: '👋 Hi! How can I help you with your order today?',
            sender: 'support',
            timestamp: new Date(),
            isBot: true
        }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const quickQuestions = [
        'Track my order',
        'Change delivery address',
        'Report an issue',
        'Refund request',
        'Menu questions',
        'Account settings'
    ];

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: newMessage,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');
        setIsTyping(true);

        // Simulate bot response
        setTimeout(() => {
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: getBotResponse(newMessage),
                sender: 'support',
                timestamp: new Date(),
                isBot: true
            };
            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 1000);
    };

    const getBotResponse = (userMessage: string): string => {
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes('track') || lowerMessage.includes('where')) {
            return '📦 I can help you track your order! Please provide your order number, and I\'ll show you the current status.';
        }
        if (lowerMessage.includes('change') || lowerMessage.includes('address')) {
            return '🏠 To change your delivery address, you can update it in your order details within 10 minutes of placing the order. Would you like me to guide you there?';
        }
        if (lowerMessage.includes('refund') || lowerMessage.includes('money')) {
            return '💰 For refund requests, please contact our support team directly. Refunds are processed within 3-5 business days.';
        }
        if (lowerMessage.includes('menu') || lowerMessage.includes('food')) {
            return '🍽️ Our menu is updated regularly! All items are prepared fresh. Do you have questions about specific dishes or dietary requirements?';
        }

        return '🤖 I\'m here to help! For complex issues, our human support team is available 24/7. Try asking about order tracking, delivery changes, or menu questions!';
    };

    const handleQuickQuestion = (question: string) => {
        setNewMessage(question);
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-background-light p-6 max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary-dark mb-2">Customer Support</h1>
                    <p className="text-text-secondary">Get instant help with your orders and account</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Options */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="p-6">
                            <h3 className="font-bold text-lg text-primary-dark mb-4">Contact Methods</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <MessageCircle size={20} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-green-800">Live Chat</p>
                                        <p className="text-sm text-green-600">Instant response</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Phone size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-blue-800">Phone Support</p>
                                        <p className="text-sm text-blue-600">24/7 available</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <Mail size={20} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-purple-800">Email Support</p>
                                        <p className="text-sm text-purple-600">support@nilelink.app</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="font-bold text-lg text-primary-dark mb-4">Support Hours</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Monday - Friday</span>
                                    <span className="font-medium">24/7</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Saturday</span>
                                    <span className="font-medium">24/7</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Sunday</span>
                                    <span className="font-medium">24/7</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Chat Interface */}
                    <div className="lg:col-span-2">
                        <Card className="p-0 h-[600px] flex flex-col">
                            {/* Chat Header */}
                            <div className="p-4 bg-primary text-white rounded-t-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                        <Bot size={16} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">NileLink Support</h3>
                                        <p className="text-xs text-white/80">Online now</p>
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
                                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                message.sender === 'user'
                                                    ? 'bg-primary text-white'
                                                    : message.isBot
                                                        ? 'bg-gray-100 text-gray-800'
                                                        : 'bg-blue-100 text-blue-800'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                {message.sender === 'support' && (
                                                    message.isBot ? <Bot size={14} /> : <User size={14} />
                                                )}
                                                <span className="text-xs opacity-70">
                                                    {message.timestamp.toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-sm">{message.text}</p>
                                        </div>
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Bot size={14} />
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Quick Questions */}
                            <div className="p-4 border-t border-border-light">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {quickQuestions.map((question) => (
                                        <button
                                            key={question}
                                            onClick={() => handleQuickQuestion(question)}
                                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                                        >
                                            {question}
                                        </button>
                                    ))}
                                </div>

                                {/* Message Input */}
                                <div className="flex gap-2">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim() || isTyping}
                                        rightIcon={<Send size={16} />}
                                    >
                                        Send
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
