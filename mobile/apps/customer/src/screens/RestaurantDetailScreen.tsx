import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Image,
    Alert,
    Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import Types
import { RootState, AppDispatch } from '../store';

// Import Actions
import { addToCart, updateCartItem, removeFromCart } from '../store/slices/cartSlice';
import { loadMenuItems, loadRestaurantDetails } from '../store/slices/restaurantsSlice';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    isPopular: boolean;
    isVegetarian: boolean;
    isVegan: boolean;
    allergens: string[];
    customizations: MenuCustomization[];
    aiScore: number; // 0-1, how well it matches user's preferences
    estimatedPrepTime: number;
    nutritionalInfo?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}

interface MenuCustomization {
    id: string;
    name: string;
    type: 'single' | 'multiple' | 'text';
    required: boolean;
    options: {
        id: string;
        name: string;
        price: number;
        default?: boolean;
    }[];
}

interface CartItem {
    id: string;
    menuItem: MenuItem;
    quantity: number;
    customizations: { [key: string]: string[] };
    specialInstructions?: string;
    totalPrice: number;
}

const RestaurantDetailScreen: React.FC<{ route: any }> = ({ route }) => {
    const { restaurantId } = route.params;
    const dispatch = useDispatch<AppDispatch>();
    const restaurant = useSelector((state: RootState) => state.restaurants.currentRestaurant);
    const menuItems = useSelector((state: RootState) => state.restaurants.menuItems);
    const cart = useSelector((state: RootState) => state.cart.items);

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showFilters, setShowFilters] = useState(false);
    const [customizationModal, setCustomizationModal] = useState<MenuItem | null>(null);
    const [selectedCustomizations, setSelectedCustomizations] = useState<{ [key: string]: string[] }>({});

    // Mock restaurant data
    const mockRestaurant = {
        id: restaurantId,
        name: 'Bella Italia',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        rating: 4.8,
        reviews: 1247,
        deliveryTime: '25-35 min',
        deliveryFee: 2.99,
        minimumOrder: 15.00,
        cuisines: ['Italian', 'Pizza', 'Pasta'],
        isOpen: true,
        description: 'Authentic Italian cuisine made with love. Fresh ingredients, traditional recipes passed down through generations.',
        features: ['Organic Ingredients', 'Gluten-Free Options', 'Vegetarian Friendly'],
        aiInsights: {
            popularItems: ['Margherita Pizza', 'Carbonara Pasta'],
            recommendedForYou: ['Truffle Risotto', 'Osso Buco'],
            currentWaitTime: 8, // minutes
            peakHours: '6-9 PM',
        },
    };

    // Mock menu items
    const mockMenuItems: MenuItem[] = [
        {
            id: '1',
            name: 'Margherita Pizza',
            description: 'Fresh mozzarella, tomato sauce, basil',
            price: 16.99,
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
            category: 'Pizza',
            isPopular: true,
            isVegetarian: true,
            isVegan: false,
            allergens: ['Dairy', 'Gluten'],
            customizations: [
                {
                    id: 'size',
                    name: 'Size',
                    type: 'single',
                    required: true,
                    options: [
                        { id: 'small', name: 'Small (10")', price: 0 },
                        { id: 'medium', name: 'Medium (12")', price: 2 },
                        { id: 'large', name: 'Large (14")', price: 4 },
                    ],
                },
                {
                    id: 'crust',
                    name: 'Crust Type',
                    type: 'single',
                    required: true,
                    options: [
                        { id: 'thin', name: 'Thin Crust', price: 0 },
                        { id: 'thick', name: 'Thick Crust', price: 1 },
                        { id: 'gluten_free', name: 'Gluten-Free', price: 3 },
                    ],
                },
                {
                    id: 'extra_toppings',
                    name: 'Extra Toppings',
                    type: 'multiple',
                    required: false,
                    options: [
                        { id: 'pepperoni', name: 'Pepperoni', price: 2.50 },
                        { id: 'mushrooms', name: 'Mushrooms', price: 1.50 },
                        { id: 'olives', name: 'Olives', price: 1.00 },
                    ],
                },
            ],
            aiScore: 0.95,
            estimatedPrepTime: 15,
            nutritionalInfo: {
                calories: 650,
                protein: 28,
                carbs: 85,
                fat: 22,
            },
        },
        {
            id: '2',
            name: 'Truffle Risotto',
            description: 'Creamy Arborio rice with black truffle and Parmesan',
            price: 24.99,
            image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400',
            category: 'Pasta & Risotto',
            isPopular: true,
            isVegetarian: true,
            isVegan: false,
            allergens: ['Dairy', 'Gluten'],
            customizations: [],
            aiScore: 0.92,
            estimatedPrepTime: 20,
            nutritionalInfo: {
                calories: 580,
                protein: 16,
                carbs: 78,
                fat: 28,
            },
        },
        {
            id: '3',
            name: 'Tiramisu',
            description: 'Classic Italian dessert with coffee-soaked ladyfingers',
            price: 8.99,
            image: 'https://images.unsplash.com/photo-1571877227200-784af862998e?w=400',
            category: 'Desserts',
            isPopular: false,
            isVegetarian: true,
            isVegan: false,
            allergens: ['Dairy', 'Gluten', 'Eggs'],
            customizations: [
                {
                    id: 'size',
                    name: 'Portion Size',
                    type: 'single',
                    required: true,
                    options: [
                        { id: 'single', name: 'Single Serving', price: 0 },
                        { id: 'sharing', name: 'Sharing Size (+50%)', price: 4 },
                    ],
                },
            ],
            aiScore: 0.88,
            estimatedPrepTime: 5,
        },
    ];

    const categories = ['All', ...Array.from(new Set(mockMenuItems.map(item => item.category)))];

    useEffect(() => {
        // Load restaurant details and menu
        dispatch(loadRestaurantDetails(restaurantId));
        dispatch(loadMenuItems(restaurantId));
    }, [dispatch, restaurantId]);

    const filteredItems = mockMenuItems.filter(item =>
        selectedCategory === 'All' || item.category === selectedCategory
    );

    const sortedItems = filteredItems.sort((a, b) => {
        // Sort by AI score, then popularity, then price
        if (Math.abs(a.aiScore - b.aiScore) > 0.1) return b.aiScore - a.aiScore;
        if (a.isPopular !== b.isPopular) return a.isPopular ? -1 : 1;
        return a.price - b.price;
    });

    const handleAddToCart = (item: MenuItem) => {
        if (item.customizations && item.customizations.length > 0) {
            // Show customization modal
            setCustomizationModal(item);
            setSelectedCustomizations({});
        } else {
            // Add directly to cart
            addItemToCart(item, {});
        }
    };

    const addItemToCart = (item: MenuItem, customizations: { [key: string]: string[] }) => {
        const cartItem: CartItem = {
            id: `${item.id}-${Date.now()}`,
            menuItem: item,
            quantity: 1,
            customizations,
            totalPrice: calculateItemPrice(item, customizations),
        };

        dispatch(addToCart(cartItem));
    };

    const calculateItemPrice = (item: MenuItem, customizations: { [key: string]: string[] }) => {
        let price = item.price;

        // Add customization prices
        Object.values(customizations).forEach(selectedIds => {
            selectedIds.forEach(optionId => {
                item.customizations?.forEach(customization => {
                    const option = customization.options.find(opt => opt.id === optionId);
                    if (option) price += option.price;
                });
            });
        });

        return price;
    };

    const handleCustomizationConfirm = () => {
        if (customizationModal) {
            addItemToCart(customizationModal, selectedCustomizations);
            setCustomizationModal(null);
            setSelectedCustomizations({});
        }
    };

    const handleCustomizationChange = (customizationId: string, optionId: string, selected: boolean) => {
        setSelectedCustomizations(prev => {
            const current = prev[customizationId] || [];
            if (selected) {
                return { ...prev, [customizationId]: [...current, optionId] };
            } else {
                return { ...prev, [customizationId]: current.filter(id => id !== optionId) };
            }
        });
    };

    const getCartItemCount = (itemId: string) => {
        return cart.filter(item => item.menuItem.id === itemId).reduce((sum, item) => sum + item.quantity, 0);
    };

    const renderMenuItem = ({ item }: { item: MenuItem }) => {
        const cartCount = getCartItemCount(item.id);

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
                onPress={() => handleAddToCart(item)}
            >
                <View style={{ flexDirection: 'row', padding: 16 }}>
                    <Image
                        source={{ uri: item.image }}
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 8,
                            marginRight: 16,
                        }}
                    />

                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Text style={{
                                fontSize: 18,
                                fontWeight: 'bold',
                                color: '#1f2937',
                                flex: 1,
                            }}>
                                {item.name}
                            </Text>
                            {item.isPopular && (
                                <View style={{
                                    backgroundColor: '#f59e0b',
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    borderRadius: 12,
                                    marginLeft: 8,
                                }}>
                                    <Text style={{ fontSize: 10, color: 'white', fontWeight: 'bold' }}>
                                        POPULAR
                                    </Text>
                                </View>
                            )}
                        </View>

                        <Text style={{
                            fontSize: 14,
                            color: '#6b7280',
                            marginBottom: 8,
                            lineHeight: 20,
                        }}>
                            {item.description}
                        </Text>

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: '#0e372b',
                            }}>
                                ${item.price.toFixed(2)}
                            </Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="time-outline" size={14} color="#6b7280" />
                                <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>
                                    {item.estimatedPrepTime}min
                                </Text>

                                {item.aiScore > 0.9 && (
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginLeft: 8,
                                    }}>
                                        <MaterialCommunityIcons name="robot" size={14} color="#8b5cf6" />
                                        <Text style={{ fontSize: 12, color: '#8b5cf6', marginLeft: 2 }}>
                                            Recommended
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {cartCount > 0 && (
                            <View style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                backgroundColor: '#0e372b',
                                borderRadius: 12,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                            }}>
                                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                                    {cartCount} in cart
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f9f8f4' }}>
            {/* Restaurant Header */}
            <View style={{ position: 'relative' }}>
                <Image
                    source={{ uri: mockRestaurant.image }}
                    style={{
                        width: screenWidth,
                        height: 200,
                    }}
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 100,
                        justifyContent: 'flex-end',
                        padding: 16,
                    }}
                >
                    <Text style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: 'white',
                        marginBottom: 4,
                    }}>
                        {mockRestaurant.name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="star" size={16} color="#fbbf24" />
                        <Text style={{ color: 'white', marginLeft: 4, marginRight: 12 }}>
                            {mockRestaurant.rating} ({mockRestaurant.reviews} reviews)
                        </Text>
                        <Ionicons name="time-outline" size={16} color="white" />
                        <Text style={{ color: 'white', marginLeft: 4 }}>
                            {mockRestaurant.deliveryTime}
                        </Text>
                    </View>
                </LinearGradient>

                {/* Back Button */}
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        top: 50,
                        left: 16,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        borderRadius: 20,
                        padding: 8,
                    }}
                    onPress={() => {/* Navigate back */ }}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Restaurant Info */}
            <View style={{
                backgroundColor: 'white',
                padding: 16,
                marginBottom: 8,
            }}>
                <Text style={{
                    fontSize: 14,
                    color: '#6b7280',
                    lineHeight: 20,
                    marginBottom: 12,
                }}>
                    {mockRestaurant.description}
                </Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
                    {mockRestaurant.features.map((feature, index) => (
                        <View key={index} style={{
                            backgroundColor: '#f0f9f4',
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 12,
                            marginRight: 8,
                            marginBottom: 4,
                        }}>
                            <Text style={{ fontSize: 12, color: '#065f46', fontWeight: '500' }}>
                                {feature}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* AI Insights */}
                <View style={{
                    backgroundColor: '#f8f9ff',
                    borderRadius: 8,
                    padding: 12,
                    borderLeftWidth: 3,
                    borderLeftColor: '#8b5cf6',
                }}>
                    <Text style={{ fontSize: 14, color: '#6b21a8', fontWeight: '600', marginBottom: 8 }}>
                        🤖 AI Insights
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6b21a8', lineHeight: 18 }}>
                        • Popular: {mockRestaurant.aiInsights.popularItems.join(', ')}
                        {'\n'}• Current wait: {mockRestaurant.aiInsights.currentWaitTime}min
                        {'\n'}• Peak hours: {mockRestaurant.aiInsights.peakHours}
                    </Text>
                </View>
            </View>

            {/* Category Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ maxHeight: 50, backgroundColor: 'white' }}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
            >
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category}
                        style={{
                            paddingHorizontal: 20,
                            paddingVertical: 8,
                            marginRight: 8,
                            backgroundColor: selectedCategory === category ? '#0e372b' : '#f3f4f6',
                            borderRadius: 20,
                        }}
                        onPress={() => setSelectedCategory(category)}
                    >
                        <Text style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: selectedCategory === category ? 'white' : '#374151',
                        }}>
                            {category}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Menu Items */}
            <FlatList
                data={sortedItems}
                renderItem={renderMenuItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
            />

            {/* Cart Button */}
            {cart.length > 0 && (
                <View style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    backgroundColor: '#0e372b',
                    borderRadius: 12,
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5,
                }}>
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                        onPress={() => {/* Navigate to cart */ }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="basket" size={24} color="white" />
                            <Text style={{
                                color: 'white',
                                fontSize: 16,
                                fontWeight: 'bold',
                                marginLeft: 12,
                            }}>
                                View Cart ({cart.length} items)
                            </Text>
                        </View>
                        <Text style={{
                            color: 'white',
                            fontSize: 18,
                            fontWeight: 'bold',
                        }}>
                            ${cart.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Customization Modal */}
            <Modal
                visible={customizationModal !== null}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setCustomizationModal(null)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'flex-end',
                }}>
                    <View style={{
                        backgroundColor: 'white',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        padding: 20,
                        maxHeight: screenHeight * 0.8,
                    }}>
                        {customizationModal && (
                            <>
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 20,
                                }}>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                                        Customize {customizationModal.name}
                                    </Text>
                                    <TouchableOpacity onPress={() => setCustomizationModal(null)}>
                                        <Ionicons name="close" size={24} color="#6b7280" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {customizationModal.customizations.map((customization) => (
                                        <View key={customization.id} style={{ marginBottom: 24 }}>
                                            <Text style={{
                                                fontSize: 16,
                                                fontWeight: '600',
                                                marginBottom: 12,
                                                color: '#1f2937',
                                            }}>
                                                {customization.name}
                                                {customization.required && <Text style={{ color: '#ef4444' }}> *</Text>}
                                            </Text>

                                            {customization.options.map((option) => (
                                                <TouchableOpacity
                                                    key={option.id}
                                                    style={{
                                                        flexDirection: 'row',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        paddingVertical: 12,
                                                        paddingHorizontal: 16,
                                                        borderRadius: 8,
                                                        marginBottom: 8,
                                                        backgroundColor: selectedCustomizations[customization.id]?.includes(option.id)
                                                            ? '#f0f9f4'
                                                            : '#f9f9f9',
                                                        borderWidth: 1,
                                                        borderColor: selectedCustomizations[customization.id]?.includes(option.id)
                                                            ? '#10b981'
                                                            : '#e5e7eb',
                                                    }}
                                                    onPress={() => handleCustomizationChange(
                                                        customization.id,
                                                        option.id,
                                                        !selectedCustomizations[customization.id]?.includes(option.id)
                                                    )}
                                                >
                                                    <Text style={{ fontSize: 16, color: '#1f2937' }}>
                                                        {option.name}
                                                    </Text>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        {option.price > 0 && (
                                                            <Text style={{ fontSize: 14, color: '#6b7280', marginRight: 8 }}>
                                                                +${option.price.toFixed(2)}
                                                            </Text>
                                                        )}
                                                        {selectedCustomizations[customization.id]?.includes(option.id) && (
                                                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    ))}
                                </ScrollView>

                                <TouchableOpacity
                                    style={{
                                        backgroundColor: '#0e372b',
                                        borderRadius: 12,
                                        paddingVertical: 16,
                                        alignItems: 'center',
                                        marginTop: 20,
                                    }}
                                    onPress={handleCustomizationConfirm}
                                >
                                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                                        Add to Cart - ${calculateItemPrice(customizationModal, selectedCustomizations).toFixed(2)}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default RestaurantDetailScreen;