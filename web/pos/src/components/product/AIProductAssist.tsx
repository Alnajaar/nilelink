'use client';

import { useState } from 'react';
import { useVoiceInput } from '@shared/hooks/useVoiceInput';
import { GlassCard } from '@shared/components/GlassCard';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import { Mic, MicOff, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@shared/utils/cn';

interface AIProductAssistProps {
    onProductParsed: (product: {
        name: string;
        brand?: string;
        category: string;
        size?: string;
    }) => void;
    businessId: string;
}

export function AIProductAssist({ onProductParsed, businessId }: AIProductAssistProps) {
    const [textInput, setTextInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const {
        transcript,
        isListening,
        isSupported: voiceSupported,
        error: voiceError,
        startListening,
        stopListening,
        resetTranscript,
    } = useVoiceInput({ lang: 'ar-SA' }); // Arabic for Saudi market, change as needed

    const handleParse = async (input: string, isVoice: boolean = false) => {
        setIsProcessing(true);
        setError(null);
        setResult(null);

        try {
            // Use on-device AI (no backend call)
            const { default: onDeviceAI } = await import('@shared/services/OnDeviceAI');

            // Initialize if needed
            if (!onDeviceAI.isReady()) {
                await onDeviceAI.init();
            }

            // Parse product using on-device AI
            const parsed = await onDeviceAI.parseProduct(input);

            const data = {
                available: true,
                parsed: {
                    name: parsed.name,
                    brand: parsed.brand || null,
                    category: parsed.category,
                    size: parsed.size || null,
                    confidence: parsed.confidence,
                },
                original: input,
            };

            setResult(data);

            if (data.parsed && data.parsed.name) {
                onProductParsed(data.parsed);
            }
        } catch (err: any) {
            console.error('[AI Product Assist Error]', err);
            setError(err.message || 'Failed to parse product. AI model may be loading...');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVoiceSubmit = () => {
        if (transcript.trim()) {
            handleParse(transcript, true);
            resetTranscript();
        }
    };

    const handleTextSubmit = () => {
        if (textInput.trim()) {
            handleParse(textInput, false);
            setTextInput('');
        }
    };

    return (
        <GlassCard className="p-6 border-blue-500/20">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">AI Product Assist</h3>
                </div>
                {result && !result.available && (
                    <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[9px] font-black uppercase">
                        Basic Mode
                    </Badge>
                )}
            </div>

            <div className="space-y-4">
                {/* Voice Input */}
                {voiceSupported && (
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                            Voice Input (Hands-Free)
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 min-h-[48px] flex items-center">
                                <span className={cn("text-sm", transcript ? "text-white" : "text-gray-500")}>
                                    {transcript || "Tap mic and speak..."}
                                </span>
                            </div>
                            <Button
                                onClick={isListening ? stopListening : startListening}
                                className={cn(
                                    "w-12 h-12 rounded-xl transition-all flex items-center justify-center",
                                    isListening
                                        ? "bg-red-600 hover:bg-red-700 animate-pulse"
                                        : "bg-blue-600 hover:bg-blue-700"
                                )}
                                disabled={isProcessing}
                            >
                                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </Button>
                            {transcript && (
                                <Button
                                    onClick={handleVoiceSubmit}
                                    className="bg-green-600 hover:bg-green-700 px-4 rounded-xl text-[10px] font-black uppercase"
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Parse'}
                                </Button>
                            )}
                        </div>
                        {voiceError && (
                            <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {voiceError}
                            </p>
                        )}
                    </div>
                )}

                {/* Text Input */}
                <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                        Or Type Product Description
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                            placeholder="e.g., Milk Almarai 1 liter"
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                            disabled={isProcessing}
                        />
                        <Button
                            onClick={handleTextSubmit}
                            className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl text-[10px] font-black uppercase"
                            disabled={isProcessing || !textInput.trim()}
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Parse'}
                        </Button>
                    </div>
                </div>

                {/* Result Display */}
                {result && result.parsed && (
                    <div className="mt-4 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                        <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-2">✓ Parsed Successfully</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="text-gray-500">Name:</span>
                                <span className="text-white ml-2 font-bold">{result.parsed.name}</span>
                            </div>
                            {result.parsed.brand && (
                                <div>
                                    <span className="text-gray-500">Brand:</span>
                                    <span className="text-white ml-2 font-bold">{result.parsed.brand}</span>
                                </div>
                            )}
                            <div>
                                <span className="text-gray-500">Category:</span>
                                <span className="text-white ml-2 font-bold">{result.parsed.category}</span>
                            </div>
                            {result.parsed.size && (
                                <div>
                                    <span className="text-gray-500">Size:</span>
                                    <span className="text-white ml-2 font-bold">{result.parsed.size}</span>
                                </div>
                            )}
                        </div>
                        {result.parsed.confidence < 0.7 && (
                            <p className="text-yellow-400 text-[9px] mt-2 italic">
                                ⚠️ Low confidence. Please verify data before saving.
                            </p>
                        )}
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="mt-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                        <p className="text-red-400 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </p>
                    </div>
                )}

                {/* Hint */}
                <p className="text-gray-500 text-[9px] italic mt-2">
                    💡 Tip: Say or type product name, brand, and size for best results
                </p>
            </div>
        </GlassCard>
    );
}
