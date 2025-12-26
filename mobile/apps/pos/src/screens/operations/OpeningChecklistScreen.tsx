import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions,
    ProgressBarAndroid,
    Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

// Import Types
import { RootState, AppDispatch } from '../../store';
import { NavigationContext } from '../../types/navigation';

// Import Actions
import {
    completeChecklistItem,
    markChecklistComplete,
    updateOpeningProgress
} from '../../store/slices/openingChecklistSlice';

const { width: screenWidth } = Dimensions.get('window');

interface ChecklistItem {
    id: string;
    title: string;
    description: string;
    category: 'PREP' | 'STAFF' | 'EQUIPMENT' | 'INVENTORY' | 'SYSTEMS';
    estimatedTime: number; // minutes
    required: boolean;
    completed: boolean;
    voicePrompt?: string;
    autoCheck?: boolean; // Can be automatically verified
}

const OpeningChecklistScreen: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const checklist = useSelector((state: RootState) => state.openingChecklist);
    const navigationState = useSelector((state: RootState) => state.navigation);

    const [currentCategory, setCurrentCategory] = useState<'PREP' | 'STAFF' | 'EQUIPMENT' | 'INVENTORY' | 'SYSTEMS'>('PREP');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [voicePromptsEnabled, setVoicePromptsEnabled] = useState(true);

    // Opening checklist items - comprehensive for restaurant operations
    const checklistItems: ChecklistItem[] = [
        // PREP Category
        {
            id: 'clean_exterior',
            title: 'Clean Exterior & Signage',
            description: 'Clean windows, doors, and restaurant signage',
            category: 'PREP',
            estimatedTime: 15,
            required: true,
            completed: false,
            voicePrompt: 'Remember to check the parking lot and entrance area'
        },
        {
            id: 'unlock_doors',
            title: 'Unlock All Doors',
            description: 'Unlock front door, kitchen entrance, and storage areas',
            category: 'PREP',
            estimatedTime: 2,
            required: true,
            completed: false,
            autoCheck: true
        },
        {
            id: 'turn_on_lights',
            title: 'Turn On All Lights',
            description: 'Main dining area, kitchen, restrooms, and parking lot lights',
            category: 'PREP',
            estimatedTime: 3,
            required: true,
            completed: false,
            autoCheck: true
        },
        {
            id: 'set_thermostat',
            title: 'Set Thermostat',
            description: 'Set appropriate temperature for dining area and kitchen',
            category: 'PREP',
            estimatedTime: 2,
            required: false,
            completed: false
        },

        // STAFF Category
        {
            id: 'staff_clock_in',
            title: 'Staff Clock-In',
            description: 'Ensure all scheduled staff have clocked in',
            category: 'STAFF',
            estimatedTime: 10,
            required: true,
            completed: false,
            voicePrompt: 'Check that all kitchen and service staff are present'
        },
        {
            id: 'uniform_check',
            title: 'Uniform & Hygiene Check',
            description: 'Verify staff uniforms are clean and hairnets/hats are worn',
            category: 'STAFF',
            estimatedTime: 5,
            required: true,
            completed: false
        },
        {
            id: 'role_assignment',
            title: 'Assign Staff Roles',
            description: 'Assign servers to sections, kitchen staff to stations',
            category: 'STAFF',
            estimatedTime: 5,
            required: true,
            completed: false
        },

        // EQUIPMENT Category
        {
            id: 'oven_preheat',
            title: 'Preheat Ovens',
            description: 'Turn on and preheat all ovens to required temperatures',
            category: 'EQUIPMENT',
            estimatedTime: 20,
            required: true,
            completed: false,
            voicePrompt: 'Ovens take time to heat up - start them early'
        },
        {
            id: 'grill_setup',
            title: 'Set Up Grill Stations',
            description: 'Clean and prepare grill surfaces and equipment',
            category: 'EQUIPMENT',
            estimatedTime: 10,
            required: true,
            completed: false
        },
        {
            id: 'coffee_machines',
            title: 'Start Coffee Machines',
            description: 'Fill water, add coffee grounds, and turn on espresso machines',
            category: 'EQUIPMENT',
            estimatedTime: 5,
            required: false,
            completed: false
        },
        {
            id: 'pos_system_boot',
            title: 'Boot POS System',
            description: 'Start all POS terminals and verify connectivity',
            category: 'EQUIPMENT',
            estimatedTime: 3,
            required: true,
            completed: false,
            autoCheck: true
        },

        // INVENTORY Category
        {
            id: 'inventory_check',
            title: 'Morning Inventory Check',
            description: 'Count key ingredients and verify stock levels',
            category: 'INVENTORY',
            estimatedTime: 15,
            required: true,
            completed: false,
            voicePrompt: 'Check expiration dates and stock levels for critical items'
        },
        {
            id: 'special_orders',
            title: 'Check Special Orders',
            description: 'Verify any special ingredient deliveries arrived',
            category: 'INVENTORY',
            estimatedTime: 5,
            required: false,
            completed: false
        },

        // SYSTEMS Category
        {
            id: 'online_ordering',
            title: 'Enable Online Ordering',
            description: 'Activate online ordering platforms and delivery services',
            category: 'SYSTEMS',
            estimatedTime: 2,
            required: true,
            completed: false,
            autoCheck: true
        },
        {
            id: 'music_system',
            title: 'Start Background Music',
            description: 'Turn on appropriate background music for the day',
            category: 'SYSTEMS',
            estimatedTime: 1,
            required: false,
            completed: false
        },
        {
            id: 'security_system',
            title: 'Check Security Cameras',
            description: 'Verify all security cameras are recording properly',
            category: 'SYSTEMS',
            estimatedTime: 2,
            required: true,
            completed: false
        },
        {
            id: 'final_walkthrough',
            title: 'Final Opening Walkthrough',
            description: 'Complete walkthrough of entire restaurant before opening',
            category: 'SYSTEMS',
            estimatedTime: 5,
            required: true,
            completed: false,
            voicePrompt: 'This is your final check before opening doors'
        }
    ];

    const categories = [
        { key: 'PREP', label: '🏠 Prep', color: '#f59e0b' },
        { key: 'STAFF', label: '👥 Staff', color: '#3b82f6' },
        { key: 'EQUIPMENT', label: '🔧 Equipment', color: '#ef4444' },
        { key: 'INVENTORY', label: '📦 Inventory', color: '#10b981' },
        { key: 'SYSTEMS', label: '⚙️ Systems', color: '#8b5cf6' },
    ];

    const filteredItems = checklistItems.filter(item => item.category === currentCategory);
    const completedCount = filteredItems.filter(item => item.completed).length;
    const totalCount = filteredItems.length;
    const overallProgress = checklistItems.filter(item => item.completed).length / checklistItems.length;

    // Auto-complete items that can be automatically verified
    useEffect(() => {
        checklistItems.forEach(item => {
            if (item.autoCheck && !item.completed) {
                // Simulate auto-checking (in real app, this would check actual system state)
                setTimeout(() => {
                    dispatch(completeChecklistItem(item.id));
                }, Math.random() * 2000 + 1000); // Random delay between 1-3 seconds
            }
        });
    }, []);

    const handleItemToggle = async (itemId: string) => {
        const item = checklistItems.find(i => i.id === itemId);
        if (!item) return;

        // Play sound feedback if enabled
        if (soundEnabled) {
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require('../../../assets/sounds/check.mp3') // Would need to add sound file
                );
                await sound.playAsync();
            } catch (error) {
                // Sound not available, continue silently
            }
        }

        dispatch(completeChecklistItem(itemId));

        // Voice prompt if enabled
        if (voicePromptsEnabled && item.voicePrompt) {
            // In a real app, this would use TTS
            Alert.alert('Voice Prompt', item.voicePrompt);
        }
    };

    const handleCompleteOpening = () => {
        const allRequiredCompleted = checklistItems
            .filter(item => item.required)
            .every(item => item.completed);

        if (!allRequiredCompleted) {
            Alert.alert(
                'Cannot Open Yet',
                'Please complete all required checklist items before opening.',
                [{ text: 'OK' }]
            );
            return;
        }

        Alert.alert(
            'Ready to Open!',
            'All required items completed. Your restaurant is ready for customers!',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Open Restaurant',
                    onPress: () => {
                        dispatch(markChecklistComplete());
                        // Navigate to main dashboard
                    }
                }
            ]
        );
    };

    const getCategoryProgress = (category: string) => {
        const categoryItems = checklistItems.filter(item => item.category === category);
        const completed = categoryItems.filter(item => item.completed).length;
        return completed / categoryItems.length;
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f9f8f4' }}>
            {/* Header */}
            <View style={{
                backgroundColor: '#0e372b',
                paddingTop: 50,
                paddingBottom: 20,
                paddingHorizontal: 20,
            }}>
                <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: 8,
                }}>
                    🏪 Opening Checklist
                </Text>
                <Text style={{
                    fontSize: 16,
                    color: 'rgba(255,255,255,0.9)',
                    marginBottom: 16,
                }}>
                    Get your restaurant ready for an amazing day!
                </Text>

                {/* Overall Progress */}
                <View style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ color: 'white', fontSize: 14 }}>Overall Progress</Text>
                        <Text style={{ color: 'white', fontSize: 14 }}>
                            {Math.round(overallProgress * 100)}%
                        </Text>
                    </View>
                    {Platform.OS === 'android' ? (
                        <ProgressBarAndroid
                            styleAttr="Horizontal"
                            indeterminate={false}
                            progress={overallProgress}
                            color="#10b981"
                        />
                    ) : (
                        <View style={{
                            height: 6,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: 3,
                        }}>
                            <View style={{
                                height: 6,
                                width: `${overallProgress * 100}%`,
                                backgroundColor: '#10b981',
                                borderRadius: 3,
                            }} />
                        </View>
                    )}
                </View>
            </View>

            {/* Category Tabs */}
            <View style={{
                flexDirection: 'row',
                backgroundColor: 'white',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderBottomWidth: 1,
                borderBottomColor: '#e5e7eb',
            }}>
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.key}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            paddingVertical: 8,
                            borderRadius: 8,
                            backgroundColor: currentCategory === category.key ? category.color : 'transparent',
                        }}
                        onPress={() => setCurrentCategory(category.key as any)}
                    >
                        <Text style={{
                            fontSize: 12,
                            fontWeight: '600',
                            color: currentCategory === category.key ? 'white' : '#6b7280',
                        }}>
                            {category.label}
                        </Text>
                        <Text style={{
                            fontSize: 10,
                            color: currentCategory === category.key ? 'white' : '#9ca3af',
                            marginTop: 2,
                        }}>
                            {Math.round(getCategoryProgress(category.key) * 100)}%
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Checklist Items */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20 }}
            >
                <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginBottom: 16,
                    color: '#1f2937',
                }}>
                    {categories.find(c => c.key === currentCategory)?.label} Tasks
                </Text>

                {filteredItems.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 12,
                            borderWidth: 2,
                            borderColor: item.completed ? '#10b981' : '#e5e7eb',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 3,
                        }}
                        onPress={() => handleItemToggle(item.id)}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                borderWidth: 2,
                                borderColor: item.completed ? '#10b981' : '#d1d5db',
                                backgroundColor: item.completed ? '#10b981' : 'transparent',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                            }}>
                                {item.completed && (
                                    <Ionicons name="checkmark" size={16} color="white" />
                                )}
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: item.completed ? '#6b7280' : '#1f2937',
                                    textDecorationLine: item.completed ? 'line-through' : 'none',
                                    marginBottom: 4,
                                }}>
                                    {item.title}
                                    {item.required && <Text style={{ color: '#ef4444' }}> *</Text>}
                                </Text>

                                <Text style={{
                                    fontSize: 14,
                                    color: '#6b7280',
                                    marginBottom: 8,
                                }}>
                                    {item.description}
                                </Text>

                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="time-outline" size={14} color="#9ca3af" />
                                    <Text style={{
                                        fontSize: 12,
                                        color: '#9ca3af',
                                        marginLeft: 4,
                                        marginRight: 12,
                                    }}>
                                        {item.estimatedTime} min
                                    </Text>

                                    {item.voicePrompt && voicePromptsEnabled && (
                                        <TouchableOpacity
                                            style={{ flexDirection: 'row', alignItems: 'center' }}
                                            onPress={() => Alert.alert('Voice Prompt', item.voicePrompt)}
                                        >
                                            <Ionicons name="volume-high" size={14} color="#3b82f6" />
                                            <Text style={{
                                                fontSize: 12,
                                                color: '#3b82f6',
                                                marginLeft: 4,
                                            }}>
                                                Voice
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Footer Actions */}
            <View style={{
                backgroundColor: 'white',
                borderTopWidth: 1,
                borderTopColor: '#e5e7eb',
                padding: 20,
            }}>
                <TouchableOpacity
                    style={{
                        backgroundColor: overallProgress === 1 ? '#10b981' : '#f59e0b',
                        borderRadius: 12,
                        paddingVertical: 16,
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                    }}
                    onPress={handleCompleteOpening}
                >
                    <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: 'white',
                    }}>
                        {overallProgress === 1 ? '🎉 Open Restaurant!' : 'Continue Checklist'}
                    </Text>
                </TouchableOpacity>

                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 12,
                }}>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => setSoundEnabled(!soundEnabled)}
                    >
                        <Ionicons
                            name={soundEnabled ? 'volume-high' : 'volume-mute'}
                            size={20}
                            color="#6b7280"
                        />
                        <Text style={{ marginLeft: 8, color: '#6b7280' }}>Sound</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => setVoicePromptsEnabled(!voicePromptsEnabled)}
                    >
                        <MaterialCommunityIcons
                            name={voicePromptsEnabled ? 'microphone' : 'microphone-off'}
                            size={20}
                            color="#6b7280"
                        />
                        <Text style={{ marginLeft: 8, color: '#6b7280' }}>Voice</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default OpeningChecklistScreen;