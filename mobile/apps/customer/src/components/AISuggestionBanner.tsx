import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AISuggestion {
    id: string;
    type: 'RECOMMENDATION' | 'DEAL';
    title: string;
    message: string;
    action: {
        type: string;
        restaurantId?: string;
    };
}

interface AISuggestionBannerProps {
    suggestion: AISuggestion;
    onPress: () => void;
}

const AISuggestionBanner: React.FC<AISuggestionBannerProps> = ({ suggestion, onPress }) => {
    const getIcon = () => {
        switch (suggestion.type) {
            case 'RECOMMENDATION':
                return 'robot';
            case 'DEAL':
                return 'tag';
            default:
                return 'lightbulb';
        }
    };

    const getBackgroundColor = () => {
        switch (suggestion.type) {
            case 'RECOMMENDATION':
                return '#f0f9ff';
            case 'DEAL':
                return '#fef3c7';
            default:
                return '#f3f4f6';
        }
    };

    const getIconColor = () => {
        switch (suggestion.type) {
            case 'RECOMMENDATION':
                return '#3b82f6';
            case 'DEAL':
                return '#f59e0b';
            default:
                return '#6b7280';
        }
    };

    return (
        <TouchableOpacity
            style={{
                backgroundColor: getBackgroundColor(),
                borderRadius: 12,
                padding: 16,
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
            }}
            onPress={onPress}
        >
            <MaterialCommunityIcons
                name={getIcon() as any}
                size={24}
                color={getIconColor()}
                style={{ marginRight: 12 }}
            />

            <View style={{ flex: 1 }}>
                <Text style={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: 2,
                }}>
                    {suggestion.title}
                </Text>
                <Text style={{
                    fontSize: 12,
                    color: '#6b7280',
                    lineHeight: 16,
                }}>
                    {suggestion.message}
                </Text>
            </View>

            <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#9ca3af"
            />
        </TouchableOpacity>
    );
};

export default AISuggestionBanner;