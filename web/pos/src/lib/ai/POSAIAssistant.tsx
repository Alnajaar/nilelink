// AI Assistant for POS Operations
// Intelligent assistant that learns user behavior, provides recommendations, and handles voice commands

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { eventBus, createEvent, EventTypes } from '../core/EventBus';
import { productInventoryEngine } from '../core/ProductInventoryEngine';

export enum AIAssistantMode {
    PASSIVE = 'passive',     // Only responds when spoken to
    ACTIVE = 'active',       // Provides proactive suggestions
    TUTORIAL = 'tutorial',   // Guides new users
    EXPERT = 'expert'        // Advanced features for power users
}

export enum AIMessageType {
    SUGGESTION = 'suggestion',
    WARNING = 'warning',
    CONFIRMATION = 'confirmation',
    QUESTION = 'question',
    INFORMATION = 'information',
    ERROR = 'error',
    SUCCESS = 'success'
}

export interface AIMessage {
    id: string;
    type: AIMessageType;
    content: string;
    timestamp: number;
    actions?: AIAction[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
    persistent: boolean;
    metadata?: Record<string, any>;
}

export interface AIAction {
    id: string;
    label: string;
    action: () => void;
    primary?: boolean;
}

export interface AIContext {
    currentTransaction?: any;
    recentProducts: string[];
    customerHistory?: any[];
    timeOfDay: string;
    dayOfWeek: string;
    staffId: string;
    businessType: string;
    location: string;
}

class POSAIAssistant {
    private messages: AIMessage[] = [];
    private context: AIContext = {
        recentProducts: [],
        timeOfDay: 'morning',
        dayOfWeek: 'monday',
        staffId: 'unknown',
        businessType: 'retail',
        location: 'main'
    };
    private mode: AIAssistantMode = AIAssistantMode.ACTIVE;
    private isListening = false;
    private speechRecognition?: any;
    private learningData = {
        userPreferences: new Map<string, number>(),
        commonSequences: new Map<string, string[]>(),
        peakHours: new Map<string, number>(),
        popularProducts: new Map<string, number>()
    };
    private speechSynthesis: any = null;
    private statusTimer: any = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.speechSynthesis = window.speechSynthesis;
            this.initializeSpeechRecognition();
            this.initializeEventListeners();
            this.loadLearningData();
        }
    }

    /**
     * Initialize speech recognition
     */
    private initializeSpeechRecognition(): void {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.speechRecognition = new SpeechRecognition();

            this.speechRecognition.continuous = false;
            this.speechRecognition.interimResults = false;
            this.speechRecognition.lang = 'en-US';

            this.speechRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.processVoiceCommand(transcript);
            };

            this.speechRecognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.addMessage({
                    type: AIMessageType.ERROR,
                    content: `Voice recognition error: ${event.error}`,
                    priority: 'low',
                    persistent: false
                });
            };
        }
    }

    /**
     * Initialize event listeners
     */
    private initializeEventListeners(): void {
        // Listen to POS events for context and learning
        eventBus.subscribe('TRANSACTION_ITEM_ADDED', (event) => {
            this.onProductAdded(event.payload.item);
        });

        eventBus.subscribe(EventTypes.TRANSACTION_COMPLETED, (event) => {
            this.onTransactionCompleted(event.payload.transaction);
        });

        eventBus.subscribe('HARDWARE_DATA_SCANNER', (event) => {
            this.onBarcodeScanned(event.payload.data);
        });

        eventBus.subscribe('INVENTORY_ALERT', (event) => {
            this.onInventoryAlert(event.payload.alert);
        });

        // Update context periodically
        if (typeof window !== 'undefined') {
            setInterval(() => {
                this.updateContext();
            }, 60000); // Every minute
        }
    }

    /**
     * Update AI context
     */
    private updateContext(): void {
        const now = new Date();
        this.context.timeOfDay = this.getTimeOfDay(now.getHours());
        this.context.dayOfWeek = now.toLocaleLowerCase('en-US', { weekday: 'long' });

        // Update peak hours data
        const timeSlot = `${this.context.dayOfWeek}_${this.context.timeOfDay}`;
        const current = this.learningData.peakHours.get(timeSlot) || 0;
        this.learningData.peakHours.set(timeSlot, current + 1);
    }

    /**
     * Get time of day category
     */
    private getTimeOfDay(hour: number): string {
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }

    /**
     * Add a message to the assistant
     */
    addMessage(message: Omit<AIMessage, 'id' | 'timestamp'>): string {
        const aiMessage: AIMessage = {
            id: `ai_msg_${Date.now()}_${Math.random()}`,
            timestamp: Date.now(),
            ...message
        };

        this.messages.push(aiMessage);

        // Keep only last 50 messages
        if (this.messages.length > 50) {
            this.messages = this.messages.slice(-50);
        }

        // Publish event
        eventBus.publish(createEvent('AI_ASSISTANT_MESSAGE', {
            message: aiMessage
        }, {
            source: 'POSAIAssistant'
        }));

        return aiMessage.id;
    }

    /**
     * Get recent messages
     */
    getMessages(limit = 10): AIMessage[] {
        return this.messages.slice(-limit);
    }

    /**
     * Clear messages
     */
    clearMessages(): void {
        this.messages = [];
    }

    /**
     * Set assistant mode
     */
    setMode(mode: AIAssistantMode): void {
        this.mode = mode;
        this.addMessage({
            type: AIMessageType.INFORMATION,
            content: `Switched to ${mode} mode`,
            priority: 'low',
            persistent: false
        });
    }

    /**
     * Start voice listening
     */
    startListening(): void {
        if (this.speechRecognition && !this.isListening) {
            try {
                this.speechRecognition.start();
                this.isListening = true;

                this.addMessage({
                    type: AIMessageType.INFORMATION,
                    content: 'Listening for voice commands...',
                    priority: 'low',
                    persistent: false
                });
            } catch (error) {
                console.error('Failed to start speech recognition:', error);
            }
        }
    }

    /**
     * Stop voice listening
     */
    stopListening(): void {
        if (this.speechRecognition && this.isListening) {
            this.speechRecognition.stop();
            this.isListening = false;
        }
    }

    /**
     * Speak text
     */
    speak(text: string): void {
        if (this.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 0.8;

            this.speechSynthesis.speak(utterance);
        }
    }

    /**
     * Process voice command
     */
    private processVoiceCommand(transcript: string): void {
        const command = transcript.toLowerCase().trim();

        this.addMessage({
            type: AIMessageType.INFORMATION,
            content: `Heard: "${transcript}"`,
            priority: 'low',
            persistent: false
        });

        // Process different command types
        if (command.includes('add') || command.includes('scan')) {
            this.processAddCommand(command);
        } else if (command.includes('void') || command.includes('remove') || command.includes('cancel')) {
            this.processVoidCommand(command);
        } else if (command.includes('discount') || command.includes('promo')) {
            this.processDiscountCommand(command);
        } else if (command.includes('total') || command.includes('checkout') || command.includes('pay')) {
            this.processPaymentCommand(command);
        } else if (command.includes('customer') || command.includes('loyalty')) {
            this.processCustomerCommand(command);
        } else if (command.includes('help') || command.includes('what can you do')) {
            this.showHelp();
        } else {
            // Try to find product by name
            this.searchProductByVoice(command);
        }

        this.isListening = false;
    }

    /**
     * Process add/scan commands
     */
    private processAddCommand(command: string): void {
        // Extract product name or barcode
        const productQuery = command.replace(/(add|scan|get me|give me)/g, '').trim();

        if (productQuery) {
            this.searchProductByVoice(productQuery);
        } else {
            this.addMessage({
                type: AIMessageType.QUESTION,
                content: 'What product would you like to add?',
                priority: 'medium',
                persistent: true,
                actions: [
                    {
                        id: 'start_scan',
                        label: 'Scan Barcode',
                        action: () => eventBus.publish({ type: 'TOGGLE_SCAN_MODE', payload: {} }),
                        primary: true
                    },
                    {
                        id: 'search_products',
                        label: 'Search Products',
                        action: () => eventBus.publish({ type: 'OPEN_PRODUCT_SEARCH', payload: {} })
                    }
                ]
            });
        }
    }

    /**
     * Process void/remove commands
     */
    private processVoidCommand(command: string): void {
        this.addMessage({
            type: AIMessageType.CONFIRMATION,
            content: 'Are you sure you want to void the last item?',
            priority: 'high',
            persistent: true,
            actions: [
                {
                    id: 'confirm_void',
                    label: 'Yes, Void Item',
                    action: () => eventBus.publish({ type: 'VOID_LAST_ITEM', payload: {} }),
                    primary: true
                },
                {
                    id: 'cancel',
                    label: 'Cancel',
                    action: () => { }
                }
            ]
        });
    }

    /**
     * Process discount commands
     */
    private processDiscountCommand(command: string): void {
        eventBus.publish({ type: 'OPEN_DISCOUNT_PANEL', payload: {} });

        this.addMessage({
            type: AIMessageType.INFORMATION,
            content: 'Opening discount panel...',
            priority: 'low',
            persistent: false
        });
    }

    /**
     * Process payment commands
     */
    private processPaymentCommand(command: string): void {
        eventBus.publish({ type: 'INITIATE_PAYMENT', payload: {} });

        this.speak('Proceeding to payment');
        this.addMessage({
            type: AIMessageType.SUCCESS,
            content: 'Opening payment interface...',
            priority: 'medium',
            persistent: false
        });
    }

    /**
     * Process customer commands
     */
    private processCustomerCommand(command: string): void {
        eventBus.publish({ type: 'OPEN_CUSTOMER_PANEL', payload: {} });

        this.addMessage({
            type: AIMessageType.INFORMATION,
            content: 'Opening customer management...',
            priority: 'low',
            persistent: false
        });
    }

    /**
     * Search product by voice
     */
    private searchProductByVoice(query: string): void {
        // Search products by name
        const products = productInventoryEngine.searchProducts({
            searchTerm: query,
            limit: 5
        });

        if (products.length === 1) {
            // Direct match
            const product = products[0];
            eventBus.publish({
                type: 'VOICE_PRODUCT_FOUND',
                payload: { product, variant: product.variants[0] }
            });

            this.speak(`Adding ${product.name}`);
            this.addMessage({
                type: AIMessageType.SUCCESS,
                content: `Added ${product.name} to transaction`,
                priority: 'medium',
                persistent: false
            });

        } else if (products.length > 1) {
            // Multiple matches
            this.addMessage({
                type: AIMessageType.QUESTION,
                content: `Found ${products.length} products matching "${query}". Which one?`,
                priority: 'medium',
                persistent: true,
                actions: products.slice(0, 3).map(product => ({
                    id: `select_${product.id}`,
                    label: product.name,
                    action: () => {
                        eventBus.publish({
                            type: 'VOICE_PRODUCT_FOUND',
                            payload: { product, variant: product.variants[0] }
                        });
                        this.speak(`Added ${product.name}`);
                    }
                }))
            });

        } else {
            // No matches
            this.addMessage({
                type: AIMessageType.WARNING,
                content: `No products found matching "${query}". Try scanning the barcode instead.`,
                priority: 'medium',
                persistent: true,
                actions: [
                    {
                        id: 'scan_instead',
                        label: 'Scan Barcode',
                        action: () => eventBus.publish({ type: 'TOGGLE_SCAN_MODE', payload: {} }),
                        primary: true
                    },
                    {
                        id: 'search_manually',
                        label: 'Manual Search',
                        action: () => eventBus.publish({ type: 'OPEN_PRODUCT_SEARCH', payload: {} })
                    }
                ]
            });
        }
    }

    /**
     * Show help
     */
    private showHelp(): void {
        this.addMessage({
            type: AIMessageType.INFORMATION,
            content: 'I can help you with: adding products, applying discounts, managing customers, processing payments, and more. Try saying "add milk" or "apply discount"!',
            priority: 'low',
            persistent: false
        });
    }

    /**
     * Event handlers for learning and suggestions
     */
    private onProductAdded(item: any): void {
        // Learn user preferences
        const productId = item.productId;
        const current = this.learningData.userPreferences.get(productId) || 0;
        this.learningData.userPreferences.set(productId, current + 1);

        // Add to recent products
        this.context.recentProducts.unshift(productId);
        this.context.recentProducts = this.context.recentProducts.slice(0, 10);

        // Provide suggestions based on learning
        if (this.mode === AIAssistantMode.ACTIVE) {
            this.provideSmartSuggestions();
        }
    }

    private onTransactionCompleted(transaction: any): void {
        // Learn common sequences (bundles)
        const items = transaction.items || [];
        if (items.length > 1) {
            const productIds = items.map((i: any) => i.productId || i.id).filter(Boolean);

            productIds.forEach((id: string, index: number) => {
                const others = productIds.filter((_, i) => i !== index);
                const current = this.learningData.commonSequences.get(id) || [];
                // Add unique associated products
                const updated = Array.from(new Set([...current, ...others]));
                this.learningData.commonSequences.set(id, updated.slice(0, 5)); // Keep top 5
            });
        }

        // Update popular products in this time slot
        const timeSlot = `${this.context.dayOfWeek}_${this.context.timeOfDay}`;
        items.forEach((item: any) => {
            const id = item.productId || item.id;
            const key = `${timeSlot}_${id}`;
            const count = (this.learningData.popularProducts.get(key) || 0) + 1;
            this.learningData.popularProducts.set(key, count);
        });

        this.saveLearningData();

        if (this.mode === AIAssistantMode.ACTIVE) {
            this.analyzeTransactionPatterns(transaction);
        }
    }

    private onBarcodeScanned(data: any): void {
        if (this.mode === AIAssistantMode.ACTIVE) {
            this.speak('Product scanned successfully');
        }
    }

    private onInventoryAlert(alert: any): void {
        if (alert.type === 'low_stock') {
            this.addMessage({
                type: AIMessageType.WARNING,
                content: `Low stock alert: ${alert.message}`,
                priority: 'high',
                persistent: true,
                actions: [
                    {
                        id: 'view_inventory',
                        label: 'View Inventory',
                        action: () => eventBus.publish({ type: 'OPEN_INVENTORY_PANEL', payload: {} })
                    }
                ]
            });
        }
    }

    /**
     * Provide smart suggestions based on learning
     */
    private provideSmartSuggestions(): void {
        // Suggest frequently bought together items
        if (this.context.recentProducts.length >= 2) {
            const lastTwo = this.context.recentProducts.slice(0, 2);
            const suggestions = this.findFrequentlyBoughtTogether(lastTwo);

            if (suggestions.length > 0) {
                const suggestion = suggestions[0];
                this.addMessage({
                    type: AIMessageType.SUGGESTION,
                    content: `Customers also buy ${suggestion.name} with these items. Add it?`,
                    priority: 'low',
                    persistent: true,
                    actions: [
                        {
                            id: 'add_suggestion',
                            label: `Add ${suggestion.name}`,
                            action: () => {
                                eventBus.publish({
                                    type: 'VOICE_PRODUCT_FOUND',
                                    payload: { product: suggestion, variant: suggestion.variants[0] }
                                });
                            },
                            primary: true
                        },
                        {
                            id: 'dismiss',
                            label: 'No Thanks',
                            action: () => { }
                        }
                    ]
                });
            }
        }

        // Suggest popular items for current time
        const timeSlot = `${this.context.dayOfWeek}_${this.context.timeOfDay}`;
        const popularItems = this.getPopularItemsForTimeSlot(timeSlot);

        if (popularItems.length > 0 && Math.random() < 0.3) { // 30% chance to suggest
            const item = popularItems[0];
            this.addMessage({
                type: AIMessageType.SUGGESTION,
                content: `${item.name} is popular right now. Would you like to add it?`,
                priority: 'low',
                persistent: true,
                actions: [
                    {
                        id: 'add_popular',
                        label: `Add ${item.name}`,
                        action: () => {
                            eventBus.publish({
                                type: 'VOICE_PRODUCT_FOUND',
                                payload: { product: item, variant: item.variants[0] }
                            });
                        },
                        primary: true
                    },
                    {
                        id: 'dismiss',
                        label: 'No Thanks',
                        action: () => { }
                    }
                ]
            });
        }
    }

    /**
     * Analyze transaction patterns
     */
    private analyzeTransactionPatterns(transaction: any): void {
        // Analyze transaction for insights
        const itemCount = transaction.items?.length || 0;
        const totalValue = transaction.total || 0;
        const paymentMethod = transaction.payments?.[0]?.method;

        if (itemCount > 10) {
            this.addMessage({
                type: AIMessageType.INFORMATION,
                content: 'Large transaction completed! Consider offering a loyalty discount for future purchases.',
                priority: 'low',
                persistent: false
            });
        }

        if (paymentMethod === 'cash' && totalValue > 50) {
            this.addMessage({
                type: AIMessageType.SUGGESTION,
                content: 'Large cash transaction. Would you like to suggest card payment for future convenience?',
                priority: 'low',
                persistent: false
            });
        }
    }

    /**
     * Helper methods for learning
     */
    private findFrequentlyBoughtTogether(productIds: string[]): any[] {
        const results: any[] = [];
        productIds.forEach(id => {
            const associated = this.learningData.commonSequences.get(id) || [];
            const products = productInventoryEngine.getProductsByIds(associated);
            results.push(...products);
        });
        return results;
    }

    private getPopularItemsForTimeSlot(timeSlot: string): any[] {
        // Filter product keys that match this time slot
        const slotProducts = Array.from(this.learningData.popularProducts.entries())
            .filter(([key]) => key.startsWith(timeSlot))
            .sort((a, b) => b[1] - a[1]) // Sort by count desc
            .slice(0, 3)
            .map(([key]) => key.split(`${timeSlot}_`)[1]);

        return productInventoryEngine.getProductsByIds(slotProducts);
    }

    /**
     * Load learning data from localStorage
     */
    private loadLearningData(): void {
        try {
            const stored = localStorage.getItem('pos_ai_learning');
            if (stored) {
                const data = JSON.parse(stored);
                this.learningData = {
                    userPreferences: new Map(data.userPreferences || []),
                    commonSequences: new Map(data.commonSequences || []),
                    peakHours: new Map(data.peakHours || []),
                    popularProducts: new Map(data.popularProducts || [])
                };
            }
        } catch (error) {
            console.error('Failed to load AI learning data:', error);
        }
    }

    /**
     * Save learning data to localStorage
     */
    private saveLearningData(): void {
        try {
            const data = {
                userPreferences: Array.from(this.learningData.userPreferences.entries()),
                commonSequences: Array.from(this.learningData.commonSequences.entries()),
                peakHours: Array.from(this.learningData.peakHours.entries()),
                popularProducts: Array.from(this.learningData.popularProducts.entries())
            };
            localStorage.setItem('pos_ai_learning', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save AI learning data:', error);
        }
    }

    /**
     * Get assistant status
     */
    getStatus() {
        return {
            mode: this.mode,
            isListening: this.isListening,
            messageCount: this.messages.length,
            learningEnabled: true,
            voiceEnabled: !!this.speechRecognition,
            speechEnabled: !!this.speechSynthesis
        };
    }
}

// Global AI Assistant instance
export const posAIAssistant = new POSAIAssistant();

// React hook for using AI Assistant
export const useAIAssistant = () => {
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [status, setStatus] = useState(posAIAssistant.getStatus());

    useEffect(() => {
        // Listen for AI messages
        const unsubscribe = eventBus.subscribe('AI_ASSISTANT_MESSAGE', (event) => {
            setMessages(prev => [...prev.slice(-9), event.payload.message]);
        });

        // Initial messages
        setMessages(posAIAssistant.getMessages(10));

        // Update status periodically
        const statusInterval = setInterval(() => {
            setStatus(posAIAssistant.getStatus());
            setIsListening(posAIAssistant.getStatus().isListening);
        }, 1000);

        return () => {
            unsubscribe();
            clearInterval(statusInterval);
        };
    }, []);

    const sendMessage = useCallback((content: string) => {
        // Process as voice command for now
        posAIAssistant.processVoiceCommand(content);
    }, []);

    const startListening = useCallback(() => {
        posAIAssistant.startListening();
    }, []);

    const stopListening = useCallback(() => {
        posAIAssistant.stopListening();
    }, []);

    const clearMessages = useCallback(() => {
        posAIAssistant.clearMessages();
        setMessages([]);
    }, []);

    return {
        messages,
        isListening,
        status,
        sendMessage,
        startListening,
        stopListening,
        clearMessages
    };
};
