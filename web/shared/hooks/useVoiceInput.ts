/**
 * Voice Input Hook for AI Product Assist
 * Enables speech-to-text for hands-free product data entry
 */

import { useState, useCallback, useEffect } from 'react';

interface VoiceInputOptions {
    lang?: string;
    continuous?: boolean;
    interimResults?: boolean;
}

interface VoiceInputResult {
    transcript: string;
    isListening: boolean;
    isSupported: boolean;
    error: string | null;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
}

export function useVoiceInput(options: VoiceInputOptions = {}): VoiceInputResult {
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recognition, setRecognition] = useState<any>(null);

    // Check browser support
    const isSupported = typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    useEffect(() => {
        if (!isSupported) return;

        // Initialize SpeechRecognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();

        recognitionInstance.lang = options.lang || 'en-US';
        recognitionInstance.continuous = options.continuous ?? false;
        recognitionInstance.interimResults = options.interimResults ?? true;

        recognitionInstance.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcriptPiece = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcriptPiece + ' ';
                } else {
                    interimTranscript += transcriptPiece;
                }
            }

            setTranscript((prev) => prev + finalTranscript || interimTranscript);
        };

        recognitionInstance.onerror = (event: any) => {
            console.error('[Voice Input] Error:', event.error);
            setError(event.error);
            setIsListening(false);
        };

        recognitionInstance.onend = () => {
            setIsListening(false);
        };

        setRecognition(recognitionInstance);

        return () => {
            if (recognitionInstance) {
                recognitionInstance.stop();
            }
        };
    }, [isSupported, options.lang, options.continuous, options.interimResults]);

    const startListening = useCallback(() => {
        if (!recognition) {
            setError('Speech recognition not initialized');
            return;
        }

        try {
            setError(null);
            recognition.start();
            setIsListening(true);
        } catch (err: any) {
            console.error('[Voice Input] Start error:', err);
            setError(err.message);
        }
    }, [recognition]);

    const stopListening = useCallback(() => {
        if (!recognition) return;

        try {
            recognition.stop();
            setIsListening(false);
        } catch (err: any) {
            console.error('[Voice Input] Stop error:', err);
        }
    }, [recognition]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setError(null);
    }, []);

    return {
        transcript,
        isListening,
        isSupported,
        error,
        startListening,
        stopListening,
        resetTranscript,
    };
}
