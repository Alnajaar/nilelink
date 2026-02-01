// Advanced POS Layout - Integration of all POS Systems
// Brings together all the modular components into a cohesive POS experience

import React, { useState, useEffect } from 'react';
import { usePOSPersonality } from '../../lib/ui/AdaptivePOSPersonality';
import { posKernel, KernelState } from '../../lib/core/POSKernel';
import { feedbackSystem, FeedbackType } from '../../lib/ui/FeedbackSystem';
import AIAssistantPanel, { AIAssistantFAB } from '../ai/AIAssistantPanel';
import { eventBus } from '../../lib/core/EventBus';

interface AdvancedPOSLayoutProps {
    businessId?: string;
    className?: string;
}

const AdvancedPOSLayout: React.FC<AdvancedPOSLayoutProps> = ({
    businessId = 'demo_business',
    className = ''
}) => {
    const { personality, posEngine, mode } = usePOSPersonality();
    const [isAIOpen, setIsAIOpen] = useState(false);
    const [hasNewAIMessages, setHasNewAIMessages] = useState(false);
    const [currentView, setCurrentView] = useState<'transaction' | 'inventory' | 'reports' | 'settings'>('transaction');

    const [kernelState, setKernelState] = useState<KernelState>(KernelState.UNINITIALIZED);
    const [bootMessage, setBootMessage] = useState('Initializing...');

    useEffect(() => {
        const bootKernel = async () => {
            try {
                setKernelState(KernelState.BOOTING);

                // Subscribe to kernel events for progress
                const unsubscribeBoot = eventBus.subscribe('KERNEL_BOOT_PROGRESS', (event) => {
                    setBootMessage(event.payload.message);
                });

                await posKernel.boot();
                setKernelState(KernelState.RUNNING);

                unsubscribeBoot();

                // Provide welcome feedback
                feedbackSystem.triggerFeedback(FeedbackType.INFO, {
                    message: 'NileLink POS Kernel active. Welcome back.'
                });
            } catch (error: any) {
                setKernelState(KernelState.ERROR);
                setBootMessage(`Kernel Panic: ${error.message}`);
            }
        };

        if (posKernel.getStatus().state === KernelState.UNINITIALIZED) {
            bootKernel();
        } else {
            setKernelState(posKernel.getStatus().state);
        }

        // Listen for AI messages
        const unsubscribe = eventBus.subscribe('AI_ASSISTANT_MESSAGE', () => {
            setHasNewAIMessages(true);
        });

        // Provide welcome feedback
        setTimeout(() => {
            feedbackSystem.triggerFeedback(FeedbackType.INFO, {
                message: 'POS system ready. How can I help you today?'
            });
        }, 1000);

        return () => {
            unsubscribe();
        };
    }, [businessId, posEngine]);

    const handleAIOpen = () => {
        setIsAIOpen(true);
        setHasNewAIMessages(false);
    };

    const handleAIClose = () => {
        setIsAIOpen(false);
    };

    if (kernelState !== KernelState.RUNNING && kernelState !== KernelState.SAFE_MODE) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center">
                    <div className="relative mb-8">
                        <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400 font-bold">
                            NILE
                        </div>
                    </div>
                    <h1 className="text-xl font-mono text-gray-100 mb-2 uppercase tracking-widest">Booting NileLink OS</h1>
                    <p className="text-gray-500 font-mono text-sm animate-pulse">{bootMessage}</p>
                    {kernelState === KernelState.ERROR && (
                        <button
                            onClick={() => posKernel.forceRestart()}
                            className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-all"
                        >
                            Force Kernel Restart
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (!personality) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-400">
                Initializing Dynamic Personality...
            </div>
        );
    }

    // Dynamically load personality components
    const HeaderComponent = personality.components.header;
    const ProductGridComponent = personality.components.productGrid;
    const CartComponent = personality.components.cart;
    const PaymentComponent = personality.components.payment;
    const ReceiptComponent = personality.components.receipt;

    return (
        <div className={`min-h-screen bg-gray-900 text-white ${className}`}>
            {/* Header */}
            <div className="sticky top-0 z-40">
                <HeaderComponent
                    orderType="dine_in"
                    onOrderTypeChange={(type) => console.log('Order type:', type)}
                    onTableSelect={(tableId) => console.log('Table selected:', tableId)}
                />
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Product Categories & Search */}
                <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
                    <div className="p-4 border-b border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-200 mb-3">Products</h2>
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        feedbackSystem.triggerFeedback(FeedbackType.KEY_PRESS);
                                    }
                                }}
                            />
                            <div className="flex space-x-2">
                                {['All', 'Food', 'Beverages', 'Desserts'].map((category) => (
                                    <button
                                        key={category}
                                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors duration-200"
                                        onClick={() => feedbackSystem.triggerFeedback(FeedbackType.NAVIGATION)}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 overflow-y-auto">
                        <ProductGridComponent
                            onProductSelect={(product, variant) => {
                                feedbackSystem.triggerFeedback(FeedbackType.ADD_ITEM, {
                                    message: `Added ${product.name} to transaction`
                                });
                                console.log('Product selected:', product, variant);
                            }}
                            searchTerm=""
                        />
                    </div>
                </div>

                {/* Center - Transaction/Cart Area */}
                <div className="flex-1 flex flex-col bg-gray-900">
                    <div className="flex-1 p-6">
                        <div className="bg-gray-800 rounded-lg p-6 h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Current Transaction</h2>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-3 py-1 rounded-full text-sm ${mode === 'sale' ? 'bg-green-600' :
                                            mode === 'return' ? 'bg-blue-600' :
                                                mode === 'void' ? 'bg-red-600' : 'bg-yellow-600'
                                        }`}>
                                        {mode?.toUpperCase() || 'SALE'}
                                    </span>
                                </div>
                            </div>

                            {/* Transaction Items */}
                            <div className="space-y-3 mb-6">
                                {/* Mock transaction items */}
                                <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                                    <div>
                                        <p className="font-medium">Margherita Pizza</p>
                                        <p className="text-sm text-gray-400">Large • Extra Cheese</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">$18.99</p>
                                        <button
                                            className="text-red-400 hover:text-red-300 text-sm"
                                            onClick={() => feedbackSystem.triggerFeedback('remove_item')}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                                    <div>
                                        <p className="font-medium">Caesar Salad</p>
                                        <p className="text-sm text-gray-400">Side</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">$8.99</p>
                                        <button
                                            className="text-red-400 hover:text-red-300 text-sm"
                                            onClick={() => feedbackSystem.triggerFeedback('remove_item')}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Summary */}
                            <div className="border-t border-gray-600 pt-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>$27.98</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax (8.5%):</span>
                                        <span>$2.38</span>
                                    </div>
                                    <div className="flex justify-between font-semibold text-lg border-t border-gray-600 pt-2">
                                        <span>Total:</span>
                                        <span>$30.36</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6 border-t border-gray-700">
                        <div className="grid grid-cols-3 gap-4">
                            <button
                                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                                onClick={() => {
                                    feedbackSystem.triggerFeedback('payment');
                                    console.log('Payment initiated');
                                }}
                            >
                                💳 Pay Now
                            </button>
                            <button
                                className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                                onClick={() => {
                                    feedbackSystem.triggerFeedback('navigation');
                                    console.log('Hold transaction');
                                }}
                            >
                                ⏸️ Hold
                            </button>
                            <button
                                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                                onClick={() => {
                                    feedbackSystem.triggerFeedback('void');
                                    console.log('Void transaction');
                                }}
                            >
                                ❌ Void
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Quick Actions & Info */}
                <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
                    <div className="p-4 border-b border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-200">Quick Actions</h2>
                    </div>

                    <div className="flex-1 p-4 space-y-4">
                        {/* Hardware Status */}
                        <div className="bg-gray-700 rounded-lg p-4">
                            <h3 className="font-medium mb-3">Hardware Status</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span>Scanner:</span>
                                    <span className="text-green-400">🟢 Connected</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Printer:</span>
                                    <span className="text-green-400">🟢 Ready</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Card Reader:</span>
                                    <span className="text-green-400">🟢 Online</span>
                                </div>
                            </div>
                        </div>

                        {/* Today's Summary */}
                        <div className="bg-gray-700 rounded-lg p-4">
                            <h3 className="font-medium mb-3">Today&apos;s Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Transactions:</span>
                                    <span>47</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total Sales:</span>
                                    <span>$2,847.32</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Avg Transaction:</span>
                                    <span>$60.58</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Shortcuts */}
                        <div className="bg-gray-700 rounded-lg p-4">
                            <h3 className="font-medium mb-3">Shortcuts</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {['Discount', 'Customer', 'Loyalty', 'Reports', 'Settings', 'Logout'].map((action) => (
                                    <button
                                        key={action}
                                        className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded text-sm transition-colors duration-200"
                                        onClick={() => feedbackSystem.triggerFeedback('navigation')}
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Assistant Panel */}
            <AIAssistantPanel
                isOpen={isAIOpen}
                onClose={handleAIClose}
            />

            {/* AI Assistant FAB */}
            <AIAssistantFAB
                onClick={handleAIOpen}
                hasNewMessages={hasNewAIMessages}
                isActive={true}
            />

            {/* Visual Feedback Overlay */}
            <VisualFeedbackOverlay />
        </div>
    );
};

// Visual Feedback Overlay Component
const VisualFeedbackOverlay: React.FC = () => {
    const [feedbackQueue, setFeedbackQueue] = useState<Array<{
        id: string;
        type: string;
        timestamp: number;
    }>>([]);

    useEffect(() => {
        const unsubscribe = eventBus.subscribe('VISUAL_FEEDBACK', (event) => {
            const feedback = {
                id: `feedback_${Date.now()}`,
                type: event.payload.type,
                timestamp: Date.now()
            };

            setFeedbackQueue(prev => [...prev, feedback]);

            // Remove after animation
            setTimeout(() => {
                setFeedbackQueue(prev => prev.filter(f => f.id !== feedback.id));
            }, 1000);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {feedbackQueue.map((feedback) => (
                <div
                    key={feedback.id}
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping ${feedback.type === 'success' ? 'text-green-400' :
                            feedback.type === 'error' ? 'text-red-400' :
                                feedback.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                        }`}
                >
                    <div className="text-6xl opacity-75">
                        {feedback.type === 'success' ? '✅' :
                            feedback.type === 'error' ? '❌' :
                                feedback.type === 'warning' ? '⚠️' : 'ℹ️'}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdvancedPOSLayout;