/**
 * Feedback Service - Multisensory Output for POS Operators
 * Manages Audio cues and Haptic feedback via EventBus triggers
 */

import { eventBus, Event } from '../core/EventBus';

export class FeedbackService {
    private audioContext: AudioContext | null = null;

    constructor() {
    }

    public static getInstance() {
        if (typeof window === 'undefined') return null;
        if (!(window as any)._feedbackService) {
            (window as any)._feedbackService = new FeedbackService();
            (window as any)._feedbackService.initialize();
        }
        return (window as any)._feedbackService;
    }

    private initialize(): void {
        // Listen for events that require immediate feedback
        eventBus.on('PRODUCT_SCANNED', () => this.playSuccessScan());
        eventBus.on('PRODUCT_ADDED', () => this.vibrateShort());
        eventBus.on('PAYMENT_COMPLETED', () => this.playPaymentSuccess());
        eventBus.on('PAYMENT_FAILED', () => this.playFailureAlert());
        eventBus.on('SECURITY_ALERT', () => this.playIntrusionSiren());
        eventBus.on('FRAUD_DETECTED', () => this.vibrateLong());
    }

    /**
     * Initialize AudioContext on first user interaction (browser restriction)
     */
    public async resumeAudio(): Promise<void> {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    /**
     * Play a clean sine wave beep
     */
    private async playBeep(frequency: number, duration: number, volume = 0.1): Promise<void> {
        await this.resumeAudio();
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // --- Optimized Feedback Cues ---

    public playSuccessScan(): void {
        this.playBeep(880, 0.1); // High "ding"
    }

    public playPaymentSuccess(): void {
        this.playBeep(1320, 0.05).then(() => {
            setTimeout(() => this.playBeep(1760, 0.2), 50);
        });
    }

    public playFailureAlert(): void {
        this.playBeep(220, 0.4, 0.3); // Low "buzz"
    }

    public playIntrusionSiren(): void {
        // Rhythmic siren
        const playStep = (count: number) => {
            if (count <= 0) return;
            this.playBeep(440, 0.2, 0.2).then(() => {
                setTimeout(() => this.playBeep(554, 0.2, 0.2).then(() => {
                    setTimeout(() => playStep(count - 1), 100);
                }), 100);
            });
        };
        playStep(3);
    }

    /**
     * Trigger device vibration (if supported)
     */
    public vibrateShort(): void {
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }

    public vibrateLong(): void {
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100, 50, 100]);
        }
    }
}

export const feedbackService = new FeedbackService();
