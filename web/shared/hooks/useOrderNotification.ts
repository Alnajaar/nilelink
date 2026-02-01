import { useCallback } from 'react';

// Simple "ding" sound in base64 to avoid asset dependencies
const NOTIFICATION_SOUND = 'data:audio/mp3;base64,SUQzBAAAAAABAFRYWFQAAAASAAADbWFqb3JfYnJhbmQAZGFzaABUWFhUAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhUAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAGlzbzZtcDQxAFRTU0UAAAAOAAADTGF2ZjU5LjI3LjEwMAAAAAAAAAAAAAAA//tQZAAAAAAEAIAAAAEAAQAAAAEAAAAAAAAAAAAAAIlMQU1FMy4xMDCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQZAAAAAAEAIAAAAEAAQAAAAEAAAAAAAAAAAAAAIlMQU1FMy4xMDCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQZAAAAAAEAIAAAAEAAQAAAAEAAAAAAAAAAAAAAIlMQU1FMy4xMDCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQZAAAAAAEAIAAAAEAAQAAAAEAAAAAAAAAAAAAAIlMQU1FMy4xMDCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';

// Fallback beep using Web Audio API if MP3 fails or for variation
const playBeep = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1); // Drop to A4

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
        console.error('Audio play failed', e);
    }
};

export function useOrderNotification() {
    const playSound = useCallback(() => {
        try {
            // Try HTML5 Audio first
            const audio = new Audio(NOTIFICATION_SOUND);
            audio.volume = 0.5;

            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Auto-play policy might block it, fallback to beep or interaction required login
                    console.warn('Audio playback blocked, trying fallback beep', error);
                    playBeep();
                });
            }
        } catch (err) {
            playBeep();
        }
    }, []);

    return { playSound };
}
