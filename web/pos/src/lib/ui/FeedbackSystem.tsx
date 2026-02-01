// Haptic and Audio Feedback System
// Provides auditory and tactile feedback for POS interactions

import { eventBus, createEvent } from '../core/EventBus';

export enum FeedbackType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  SCAN = 'scan',
  PAYMENT = 'payment',
  VOID = 'void',
  ADD_ITEM = 'add_item',
  REMOVE_ITEM = 'remove_item',
  KEY_PRESS = 'key_press',
  NAVIGATION = 'navigation',
  HARDWARE_CONNECTED = 'hardware_connected',
  HARDWARE_DISCONNECTED = 'hardware_disconnected'
}

export enum HapticPattern {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  DOUBLE = 'double',
  TRIPLE = 'triple',
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning'
}

export interface AudioFeedback {
  enabled: boolean;
  volume: number; // 0-1
  voiceEnabled: boolean;
  soundEffectsEnabled: boolean;
}

export interface HapticFeedback {
  enabled: boolean;
  intensity: number; // 0-1
  patterns: Map<FeedbackType, HapticPattern>;
}

export interface FeedbackSettings {
  audio: AudioFeedback;
  haptic: HapticFeedback;
  visual: {
    enabled: boolean;
    animations: boolean;
    colorChanges: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
  };
}

class FeedbackSystem {
  private settings: FeedbackSettings;
  private audioContext?: AudioContext;
  private isInitialized = false;
  private soundBuffers = new Map<string, AudioBuffer>();
  private speechSynthesis: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.speechSynthesis = window.speechSynthesis;
      this.settings = this.loadSettings();
      this.initializeAudio();
      this.setupEventListeners();
    } else {
      // Provide dummy settings for SSR
      this.settings = this.getDefaultSettings();
    }
  }

  private getDefaultSettings(): FeedbackSettings {
    return {
      audio: {
        enabled: true,
        volume: 0.7,
        voiceEnabled: true,
        soundEffectsEnabled: true
      },
      haptic: {
        enabled: true,
        intensity: 0.8,
        patterns: new Map([
          [FeedbackType.SUCCESS, HapticPattern.SUCCESS],
          [FeedbackType.ERROR, HapticPattern.ERROR],
          [FeedbackType.WARNING, HapticPattern.WARNING],
          [FeedbackType.SCAN, HapticPattern.LIGHT],
          [FeedbackType.ADD_ITEM, HapticPattern.LIGHT],
          [FeedbackType.REMOVE_ITEM, HapticPattern.MEDIUM],
          [FeedbackType.PAYMENT, HapticPattern.SUCCESS],
          [FeedbackType.KEY_PRESS, HapticPattern.LIGHT],
          [FeedbackType.NAVIGATION, HapticPattern.LIGHT]
        ])
      },
      visual: {
        enabled: true,
        animations: true,
        colorChanges: true
      },
      accessibility: {
        highContrast: false,
        largeText: false,
        screenReader: true
      }
    };
  }

  /**
   * Initialize audio system
   */
  private async initializeAudio(): Promise<void> {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Load sound effects
      await this.loadSoundEffects();

      this.isInitialized = true;
    } catch (error) {
      console.warn('Audio feedback not supported:', error);
    }
  }

  /**
   * Load sound effect buffers
   */
  private async loadSoundEffects(): Promise<void> {
    if (!this.audioContext) return;

    const soundEffects = {
      'success': this.createToneBuffer(800, 0.2, 'sine'),
      'error': this.createToneBuffer(300, 0.3, 'sawtooth'),
      'warning': this.createToneBuffer(600, 0.25, 'triangle'),
      'scan': this.createToneBuffer(1200, 0.1, 'square'),
      'payment': this.createToneBuffer(1000, 0.15, 'sine'),
      'add_item': this.createToneBuffer(700, 0.1, 'sine'),
      'remove_item': this.createToneBuffer(500, 0.15, 'triangle'),
      'key_press': this.createSoftClickBuffer(),
      'navigation': this.createSoftClickBuffer(),
      'hardware_connected': this.createToneBuffer(900, 0.2, 'sine'),
      'hardware_disconnected': this.createToneBuffer(400, 0.25, 'sawtooth')
    };

    for (const [name, buffer] of Object.entries(soundEffects)) {
      this.soundBuffers.set(name, buffer);
    }
  }

  /**
   * Create tone buffer for sound effects
   */
  private createToneBuffer(frequency: number, duration: number, waveType: OscillatorType): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const sampleRate = this.audioContext.sampleRate;
    const numSamples = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;

      switch (waveType) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          sample = Math.sign(Math.sin(2 * Math.PI * frequency * t));
          break;
        case 'sawtooth':
          sample = 2 * ((t * frequency) % 1) - 1;
          break;
        case 'triangle':
          sample = 2 * Math.abs(2 * ((t * frequency) % 1) - 1) - 1;
          break;
      }

      // Apply envelope for smooth attack/release
      const attackTime = 0.01;
      const releaseTime = 0.05;
      let envelope = 1;

      if (t < attackTime) {
        envelope = t / attackTime;
      } else if (t > duration - releaseTime) {
        envelope = (duration - t) / releaseTime;
      }

      channelData[i] = sample * envelope * 0.3; // 30% volume
    }

    return buffer;
  }

  /**
   * Create soft click buffer
   */
  private createSoftClickBuffer(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.05; // 50ms
    const numSamples = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Generate noise with envelope
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const noise = (Math.random() * 2 - 1) * 0.1; // Low volume noise

      // Envelope
      const envelope = Math.max(0, 1 - (t / duration) * 2);
      channelData[i] = noise * envelope;
    }

    return buffer;
  }

  /**
   * Setup event listeners for automatic feedback
   */
  private setupEventListeners(): void {
    // Transaction events
    eventBus.subscribe('TRANSACTION_ITEM_ADDED', () => {
      this.triggerFeedback(FeedbackType.ADD_ITEM);
    });

    eventBus.subscribe('TRANSACTION_ITEM_REMOVED', () => {
      this.triggerFeedback(FeedbackType.REMOVE_ITEM);
    });

    eventBus.subscribe('TRANSACTION_COMPLETED', () => {
      this.triggerFeedback(FeedbackType.SUCCESS);
      this.speak('Transaction completed successfully');
    });

    eventBus.subscribe('TRANSACTION_CANCELLED', () => {
      this.triggerFeedback(FeedbackType.WARNING);
      this.speak('Transaction cancelled');
    });

    // Payment events
    eventBus.subscribe('PAYMENT_PROCESSED', () => {
      this.triggerFeedback(FeedbackType.PAYMENT);
      this.speak('Payment processed');
    });

    eventBus.subscribe('PAYMENT_FAILED', () => {
      this.triggerFeedback(FeedbackType.ERROR);
      this.speak('Payment failed');
    });

    // Hardware events
    eventBus.subscribe('HARDWARE_DATA_SCANNER', () => {
      this.triggerFeedback(FeedbackType.SCAN);
    });

    eventBus.subscribe('HARDWARE_CONNECTED', (event) => {
      this.triggerFeedback(FeedbackType.HARDWARE_CONNECTED);
      this.speak(`Hardware connected: ${event.payload.device.name}`);
    });

    eventBus.subscribe('HARDWARE_DISCONNECTED', (event) => {
      this.triggerFeedback(FeedbackType.HARDWARE_DISCONNECTED);
      this.speak(`Hardware disconnected: ${event.payload.deviceId}`);
    });

    // Error events
    eventBus.subscribe('HARDWARE_ERROR', () => {
      this.triggerFeedback(FeedbackType.ERROR);
    });

    // AI Assistant events
    eventBus.subscribe('AI_ASSISTANT_MESSAGE', (event) => {
      const message = event.payload.message;
      switch (message.type) {
        case 'success':
          this.triggerFeedback(FeedbackType.SUCCESS);
          break;
        case 'error':
          this.triggerFeedback(FeedbackType.ERROR);
          break;
        case 'warning':
          this.triggerFeedback(FeedbackType.WARNING);
          break;
      }
    });
  }

  /**
   * Trigger feedback for a specific type
   */
  async triggerFeedback(type: FeedbackType, options: {
    message?: string;
    volume?: number;
    hapticPattern?: HapticPattern;
  } = {}): Promise<void> {
    // Audio feedback
    if (this.settings.audio.enabled && this.settings.audio.soundEffectsEnabled) {
      this.playSound(type, options.volume);
    }

    // Voice feedback
    if (this.settings.audio.enabled && this.settings.audio.voiceEnabled && options.message) {
      this.speak(options.message);
    }

    // Haptic feedback
    if (this.settings.haptic.enabled) {
      const pattern = options.hapticPattern || this.settings.haptic.patterns.get(type) || HapticPattern.MEDIUM;
      this.triggerHaptic(pattern);
    }

    // Visual feedback (publish event for UI components)
    if (this.settings.visual.enabled) {
      eventBus.publish(createEvent('VISUAL_FEEDBACK', {
        type,
        timestamp: Date.now(),
        settings: this.settings.visual
      }, {
        source: 'FeedbackSystem'
      }));
    }
  }

  /**
   * Play sound effect
   */
  private async playSound(type: FeedbackType, volume?: number): Promise<void> {
    if (!this.audioContext || !this.isInitialized) return;

    try {
      const buffer = this.soundBuffers.get(type);
      if (!buffer) return;

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      gainNode.gain.value = (volume || this.settings.audio.volume) * 0.5; // Additional safety reduction

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start();
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  /**
   * Trigger haptic feedback
   */
  private triggerHaptic(pattern: HapticPattern): void {
    if (!('vibrate' in navigator)) return;

    const intensity = this.settings.haptic.intensity;

    let patternArray: number[];
    switch (pattern) {
      case HapticPattern.LIGHT:
        patternArray = [Math.round(50 * intensity)]; // 50ms
        break;
      case HapticPattern.MEDIUM:
        patternArray = [Math.round(100 * intensity)]; // 100ms
        break;
      case HapticPattern.HEAVY:
        patternArray = [Math.round(200 * intensity)]; // 200ms
        break;
      case HapticPattern.DOUBLE:
        patternArray = [Math.round(100 * intensity), Math.round(50 * intensity), Math.round(100 * intensity)];
        break;
      case HapticPattern.TRIPLE:
        patternArray = [Math.round(80 * intensity), Math.round(40 * intensity), Math.round(80 * intensity), Math.round(40 * intensity), Math.round(80 * intensity)];
        break;
      case HapticPattern.SUCCESS:
        patternArray = [Math.round(50 * intensity), Math.round(50 * intensity), Math.round(100 * intensity)];
        break;
      case HapticPattern.ERROR:
        patternArray = [Math.round(200 * intensity), Math.round(100 * intensity), Math.round(200 * intensity)];
        break;
      case HapticPattern.WARNING:
        patternArray = [Math.round(150 * intensity), Math.round(50 * intensity), Math.round(150 * intensity)];
        break;
      default:
        patternArray = [Math.round(100 * intensity)];
    }

    try {
      navigator.vibrate(patternArray);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Speak text using speech synthesis
   */
  private speak(text: string): void {
    if (!this.speechSynthesis || !this.settings.audio.voiceEnabled) return;

    // Cancel any ongoing speech
    this.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = this.settings.audio.volume;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Use a pleasant voice if available
    const voices = this.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice =>
      voice.name.toLowerCase().includes('female') ||
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('alex')
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    this.speechSynthesis.speak(utterance);
  }

  /**
   * Update feedback settings
   */
  updateSettings(newSettings: Partial<FeedbackSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  /**
   * Get current settings
   */
  getSettings(): FeedbackSettings {
    return { ...this.settings };
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): FeedbackSettings {
    if (typeof window === 'undefined') return this.getDefaultSettings();
    try {
      const stored = localStorage.getItem('pos_feedback_settings');
      if (stored) {
        return { ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load feedback settings:', error);
    }

    return this.getDefaultSettings();
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem('pos_feedback_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save feedback settings:', error);
    }
  }

  /**
   * Test all feedback types
   */
  async testFeedback(): Promise<void> {
    const feedbackTypes = Object.values(FeedbackType);

    for (const type of feedbackTypes) {
      this.triggerFeedback(type);
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms between tests
    }
  }

  /**
   * Stop all feedback
   */
  stopAllFeedback(): void {
    // Stop speech
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }

    // Stop vibration
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }

    // Stop audio context if needed
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}

// Global feedback system instance
export const feedbackSystem = new FeedbackSystem();

// React hook for using feedback system
export const useFeedback = () => {
  const triggerFeedback = (type: FeedbackType, options?: any) => {
    feedbackSystem.triggerFeedback(type, options);
  };

  const speak = (text: string) => {
    feedbackSystem.speak(text);
  };

  const updateSettings = (settings: Partial<FeedbackSettings>) => {
    feedbackSystem.updateSettings(settings);
  };

  const getSettings = () => {
    return feedbackSystem.getSettings();
  };

  return {
    triggerFeedback,
    speak,
    updateSettings,
    getSettings
  };
};