import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Image,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import Types
import { RootState, AppDispatch } from '../store';

// Import Actions
import {
    loadNearbyRestaurants,
    loadRecommendedRestaurants,
    searchRestaurants,
} from '../store/restaurantsSlice';

// Import Components
import RestaurantCard from '../components/RestaurantCard';
import AISuggestionBanner from '../components/AISuggestionBanner';
import QuickActionBanner from '../components/QuickActionBanner';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
    aiScore: number; // AI recommendation score 0-1
}

const HomeScreen: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const restaurants = useSelector((state: RootState) => state.restaurants);
    const user = useSelector((state: RootState) => state.auth.user);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showFilters, setShowFilters] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Mock data for demonstration
    const mockRestaurants: Restaurant[] = [
        {
            id: '1',
            name: 'Bella Italia',
            image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
            rating: 4.8,
            deliveryTime: '25-35 min',
            deliveryFee: 2.99,
            cuisines: ['Italian', 'Pizza', 'Pasta'],
            distance: 0.8,
            isOpen: true,
            hasDeals: true,
            aiScore: 0.95,
        },
        {
            id: '2',
            name: 'Sakura Sushi',
            image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
            rating: 4.6,
            deliveryTime: '20-30 min',
            deliveryFee: 1.99,
            cuisines: ['Japanese', 'Sushi', 'Asian'],
            distance: 1.2,
            isOpen: true,
            hasDeals: false,
            aiScore: 0.88,
        },
        {
            id: '3',
            name: 'Burger Palace',
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
            rating: 4.4,
            deliveryTime: '15-25 min',
            deliveryFee: 0.99,
            cuisines: ['American', 'Burgers', 'Fast Food'],
            distance: 0.5,
            isOpen: true,
            hasDeals: true,
            aiScore: 0.92,
        },
    ];

    const categories = [
        'All', 'Italian', 'Japanese', 'American', 'Chinese', 'Mexican', 'Indian', 'Thai'
    ];

    const aiSuggestions = [
        {
            id: '1',
            type: 'RECOMMENDATION',
            title: 'Based on your taste',
            message: 'You loved Italian food last time. Try Bella Italia\'s new Truffle Risotto!',
            action: {
                type: 'VIEW_RESTAURANT',
                restaurantId: '1',
            },
        },
        {
            id: '2',
            type: 'DEAL',
            title: 'Flash Deal!',
            message: 'Burger Palace has 50% off all burgers for the next 30 minutes.',
            action: {
                type: 'VIEW_DEAL',
                restaurantId: '3',
            },
        },
    ];

    const quickActions = [
        {
            id: 'reorder',
            icon: 'refresh',
            label: 'Reorder Last',
            action: 'REORDER_LAST_ORDER',
        },
        {
            id: 'favorites',
            icon: 'heart',
            label: 'Favorites',
            action: 'VIEW_FAVORITES',
        },
        {
            id: 'wallet',
            icon: 'wallet',
            label: 'Wallet',
            action: 'VIEW_WALLET',
        },
        {
            id: 'history',
            icon: 'time',
            label: 'Order History',
            action: 'VIEW_HISTORY',
        },
    ];

    useEffect(() => {
        // Load initial data
        dispatch(loadNearbyRestaurants());
        dispatch(loadRecommendedRestaurants());
    }, [dispatch]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.length > 2) {
            dispatch(searchRestaurants(query));
        }
    };

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
        dispatch(searchRestaurants('', { category }));
    };

    const handleRestaurantPress = (restaurant: Restaurant) => {
        navigation.navigate('RestaurantDetail' as never, { restaurantId: restaurant.id } as any);
    };

    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'REORDER_LAST_ORDER':
                Alert.alert('Quick Action', 'Reordering your last order...');
                break;
            case 'VIEW_FAVORITES':
                Alert.alert('Quick Action', 'Opening favorites...');
                break;
            case 'VIEW_WALLET':
                Alert.alert('Quick Action', 'Opening wallet...');
                break;
            case 'VIEW_HISTORY':
                Alert.alert('Quick Action', 'Opening order history...');
                break;
        }
    };

    const filteredRestaurants = (restaurants.nearbyRestaurants || []).filter(restaurant => {
        const matchesCategory = selectedCategory === 'All' ||
            restaurant.cuisines.some(cuisine =>
                cuisine.toLowerCase().includes(selectedCategory.toLowerCase())
            );
        const matchesSearch = !searchQuery ||
            restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.cuisines.some(cuisine =>
                cuisine.toLowerCase().includes(searchQuery.toLowerCase())
            );
        return matchesCategory && matchesSearch;
    });

    const sortedRestaurants = filteredRestaurants.sort((a, b) => {
        // Sort by AI score first, then distance
        if (Math.abs(a.aiScore - b.aiScore) > 0.1) {
            return b.aiScore - a.aiScore;
        }
        return a.distance - b.distance;
    });

    const getGreeting = () => {
        const hour = new Date().getHours();
        const userName = user?.firstName || 'Food Lover';

        if (hour < 12) return `Good morning, ${userName}! ☀️`;
        if (hour < 17) return `Good afternoon, ${userName}! 🌤️`;
        return `Good evening, ${userName}! 🌙`;
    };

    const getTimeBasedSuggestions = () => {
        const hour = new Date().getHours();
        if (hour < 11) return 'Start your day with breakfast!';
        if (hour < 14) return 'Lunch specials available now!';
        if (hour < 17) return 'Afternoon pick-me-up?';
        return 'Dinner time! What are you craving?';
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f9f8f4' }}>
            {restaurants.loading && (
                <View style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    zIndex: 1000,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <ActivityIndicator size="large" color="#0e372b" />
                </View>
            )}
            {/* Header */}
            <LinearGradient
                colors={['#0e372b', '#1a5240']}
                style={{
                    paddingTop: 50,
                    paddingBottom: 20,
                    paddingHorizontal: 20,
                }}
            >
                <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: 8,
                }}>
                    {getGreeting()}
                </Text>
                <Text style={{
                    fontSize: 16,
                    color: 'rgba(255,255,255,0.9)',
                    marginBottom: 20,
                }}>
                    {getTimeBasedSuggestions()}
                </Text>

                {/* Search Bar */}
                <View style={{
                    flexDirection: 'row',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 25,
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                    marginBottom: 15,
                }}>
                    <Ionicons name="search" size={20} color="rgba(255,255,255,0.8)" />
                    <TextInput
                        style={{
                            flex: 1,
                            marginLeft: 10,
                            color: 'white',
                            fontSize: 16,
                        }}
                        placeholder="Search restaurants, cuisines..."
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                    <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
                        <Ionicons
                            name="options"
                            size={20}
                            color={showFilters ? '#10b981' : 'rgba(255,255,255,0.8)'}
                        />
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    {quickActions.map((action) => (
                        <TouchableOpacity
                            key={action.id}
                            style={{
                                alignItems: 'center',
                                paddingVertical: 10,
                                paddingHorizontal: 15,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderRadius: 15,
                            }}
                            onPress={() => handleQuickAction(action.action)}
                        >
                            <Ionicons
                                name={action.icon as any}
                                size={24}
                                color="white"
                                style={{ marginBottom: 5 }}
                            />
                            <Text style={{
                                color: 'white',
                                fontSize: 12,
                                fontWeight: '600',
                            }}>
                                {action.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </LinearGradient>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {/* AI Suggestions */}
                <View style={{ padding: 20, paddingTop: 10 }}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        marginBottom: 12,
                        color: '#1f2937',
                    }}>
                        💡 AI Suggestions
                    </Text>
                    {aiSuggestions.map((suggestion) => (
                        <AISuggestionBanner
                            key={suggestion.id}
                            suggestion={suggestion}
                            onPress={() => {
                                if (suggestion.action.type === 'VIEW_RESTAURANT') {
                                    const restaurant = mockRestaurants.find(r => r.id === suggestion.action.restaurantId);
                                    if (restaurant) handleRestaurantPress(restaurant);
                                }
                            }}
                        />
                    ))}
                </View>

                {/* Category Filters */}
                <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        marginBottom: 12,
                        color: '#1f2937',
                    }}>
                        🍽️ What's cooking?
                    </Text>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={categories}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={{
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,
                                    marginRight: 10,
                                    backgroundColor: selectedCategory === item ? '#0e372b' : '#f3f4f6',
                                    borderRadius: 20,
                                    borderWidth: 1,
                                    borderColor: selectedCategory === item ? '#0e372b' : '#e5e7eb',
                                }}
                                onPress={() => handleCategorySelect(item)}
                            >
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: selectedCategory === item ? 'white' : '#374151',
                                }}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                {/* Restaurants List */}
                <View style={{ paddingHorizontal: 20 }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 15,
                    }}>
                        <Text style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: '#1f2937',
                        }}>
                            📍 Near You ({sortedRestaurants.length})
                        </Text>
                        <TouchableOpacity>
                            <Text style={{
                                fontSize: 14,
                                color: '#0e372b',
                                fontWeight: '600',
                            }}>
                                View Map
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {sortedRestaurants.map((restaurant) => (
                        <RestaurantCard
                            key={restaurant.id}
                            restaurant={restaurant}
                            onPress={() => handleRestaurantPress(restaurant)}
                        />
                    ))}

                    {sortedRestaurants.length === 0 && (
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 60,
                        }}>
                            <MaterialCommunityIcons
                                name="food-off"
                                size={48}
                                color="#d1d5db"
                            />
                            <Text style={{
                                fontSize: 18,
                                color: '#6b7280',
                                marginTop: 12,
                                textAlign: 'center',
                            }}>
                                No restaurants found
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                color: '#9ca3af',
                                marginTop: 4,
                                textAlign: 'center',
                            }}>
                                Try adjusting your search or filters
                            </Text>
                        </View>
                    )}
                </View>

                {/* Bottom spacing */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

export default HomeScreen;