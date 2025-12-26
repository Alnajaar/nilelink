import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface Restaurant {
    id: string;
    name: string;
    image: string;
    rating: number;
    deliveryTime: string;
    deliveryFee: number;
    cuisines: string[];
    distance: number;
    isOpen: boolean;
    hasDeals: boolean;
    aiScore: number;
}

interface RestaurantCardProps {
    restaurant: Restaurant;
    onPress: () => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onPress }) => {
    return (
        <TouchableOpacity
            style={{
                backgroundColor: 'white',
                borderRadius: 12,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
            }}
            onPress={onPress}
        >
            <Image
                source={{ uri: restaurant.image }}
                style={{
                    width: '100%',
                    height: 120,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                }}
            />

            <View style={{ padding: 12 }}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 4,
                }}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#1f2937',
                        flex: 1,
                    }}>
                        {restaurant.name}
                    </Text>
                    {restaurant.hasDeals && (
                        <View style={{
                            backgroundColor: '#ef4444',
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 8,
                        }}>
                            <Text style={{ fontSize: 10, color: 'white', fontWeight: 'bold' }}>
                                DEAL
                            </Text>
                        </View>
                    )}
                </View>

                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 4,
                }}>
                    <Ionicons name="star" size={14} color="#fbbf24" />
                    <Text style={{ fontSize: 14, color: '#6b7280', marginLeft: 4 }}>
                        {restaurant.rating}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#6b7280', marginHorizontal: 8 }}>
                        •
                    </Text>
                    <Ionicons name="time-outline" size={14} color="#6b7280" />
                    <Text style={{ fontSize: 14, color: '#6b7280', marginLeft: 4 }}>
                        {restaurant.deliveryTime}
                    </Text>
                </View>

                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <Text style={{
                        fontSize: 14,
                        color: '#6b7280',
                        flex: 1,
                    }}>
                        {restaurant.cuisines.join(' • ')}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="location-outline" size={14} color="#6b7280" />
                        <Text style={{ fontSize: 14, color: '#6b7280', marginLeft: 2 }}>
                            {restaurant.distance}km
                        </Text>
                    </View>
                </View>

                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 8,
                }}>
                    <Text style={{
                        fontSize: 14,
                        color: '#6b7280',
                    }}>
                        Delivery fee: ${restaurant.deliveryFee.toFixed(2)}
                    </Text>
                    {restaurant.aiScore > 0.9 && (
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#f0f9f4',
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 8,
                        }}>
                            <MaterialCommunityIcons name="robot" size={12} color="#10b981" />
                            <Text style={{ fontSize: 10, color: '#10b981', marginLeft: 2 }}>
                                Recommended
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default RestaurantCard;