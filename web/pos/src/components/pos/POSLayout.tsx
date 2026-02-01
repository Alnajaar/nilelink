import React, { useState } from 'react';
import { usePOS, POSPersonality } from '@/contexts/POSContext';
import { FBPersonality } from './personalities/FBPersonality';
import { RetailPersonality } from './personalities/RetailPersonality';
import { SupermarketPersonality } from './personalities/SupermarketPersonality';
import { TheftAlertOverlay } from './security/TheftAlertOverlay';
import { GestureOverlay } from './interaction/GestureOverlay';
import AIAssistantPanel, { AIAssistantFAB } from '../ai/AIAssistantPanel';
import { useAIAssistant } from '@/lib/ai/POSAIAssistant';

export function POSLayout() {
    const { personality } = usePOS();
    const [isAIOpen, setIsAIOpen] = useState(false);
    const { messages } = useAIAssistant();

    const renderPersonality = () => {
        switch (personality) {
            case POSPersonality.RETAIL:
                return <RetailPersonality />;
            case POSPersonality.SUPERMARKET:
                return <SupermarketPersonality />;
            case POSPersonality.FNB:
            default:
                return <FBPersonality />;
        }
    };

    return (
        <>
            {renderPersonality()}

            {/* Future Interaction Layer */}
            <GestureOverlay />

            <AIAssistantPanel
                isOpen={isAIOpen}
                onClose={() => setIsAIOpen(false)}
            />

            <AIAssistantFAB
                onClick={() => setIsAIOpen(!isAIOpen)}
                isActive={isAIOpen}
                hasNewMessages={messages.length > 0 && !isAIOpen}
            />

            {/* Critical Overlays */}
            <TheftAlertOverlay />
        </>
    );
}
