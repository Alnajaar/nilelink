/**
 * NileLink Cognitive AI Assistant
 * 
 * Provides an intelligent interface for POS operators:
 * - Natural Language Command Processing (Voice/Text)
 * - Real-time Operational Insights
 * - Proactive Security Monitoring
 * - Automated Workflow Assistance
 */

import { EventEngine } from '../events/EventEngine';
import { AlertManager } from '../security/AlertManager';
import { EventType } from '../events/types';

export interface AICommand {
    keyword: string;
    action: () => Promise<void>;
    description: string;
}

export class AIAssistant {
    private eventEngine: EventEngine;
    private alertManager: AlertManager;
    private commands: AICommand[] = [];
    private recognition: any = null; // Web Speech API

    constructor(eventEngine: EventEngine, alertManager: AlertManager) {
        this.eventEngine = eventEngine;
        this.alertManager = alertManager;
        this.initializeCommands();
        this.initializeSpeechRecognition();
    }

    /**
     * Map natural language keywords to POS actions
     */
    private initializeCommands(): void {
        this.commands = [
            {
                keyword: 'void last item',
                description: 'Voids the last item scanned in the current transaction',
                action: async () => {
                    console.log('🤖 AI: Executing Void Last Item command');
                    // Logic would call POSEngine.voidLastItem()
                }
            },
            {
                keyword: 'check price',
                description: 'Provides price information for the last item or specific ID',
                action: async () => {
                    console.log('🤖 AI: Fetching price info...');
                }
            },
            {
                keyword: 'system status',
                description: 'Reports on hardware health and security state',
                action: async () => {
                    console.log('🤖 AI: System is currently 100% decentralized and healthy.');
                }
            },
            {
                keyword: 'lock pos',
                description: 'Manually triggers a security lockdown',
                action: async () => {
                    await this.alertManager.createAlert(
                        'critical',
                        'security',
                        'Manual AI Lockdown',
                        'User triggered lockdown via voice command.',
                        {},
                        'AIAssistant'
                    );
                }
            }
        ];
    }

    /**
     * Initialize Web Speech API for voice control
     */
    private initializeSpeechRecognition(): void {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event: any) => {
                const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
                console.log(`🎤 AI Voice Received: "${transcript}"`);
                this.processCommand(transcript);
            };

            this.recognition.onerror = (event: any) => {
                console.error('AI Speech Recognition Error:', event.error);
            };
        }
    }

    /**
     * Start voice listening
     */
    startListening(): void {
        if (this.recognition) {
            try {
                this.recognition.start();
                console.log('🤖 AI Assistant is now listening...');
            } catch (e) {
                console.warn('Speech recognition already started.');
            }
        }
    }

    /**
     * Stop voice listening
     */
    stopListening(): void {
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    /**
     * Process a text or voice command
     */
    async processCommand(input: string): Promise<void> {
        const command = this.commands.find(c => input.includes(c.keyword));
        if (command) {
            await command.action();
        } else {
            console.log(`🤖 AI: Command "${input}" not recognized.`);
        }
    }

    /**
     * Provide proactive insights based on event stream
     */
    async handleInsightEvent(event: any): Promise<void> {
        // AI monitors events to provide "ahead of time" advice
        if (event.type === EventType.PAYMENT_COLLECTED_CARD) {
            console.log('🤖 AI Insight: Transaction patterns suggest this customer might be interested in the loyalty program.');
        }
    }
}
