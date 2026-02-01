import { NextRequest } from 'next/server';

const mockRestaurants = [
    {
        id: '1',
        name: 'Mama\'s Kitchen',
        category: 'Italian',
        rating: 4.8,
        reviewCount: 1247,
        deliveryTime: '25-35 min',
        deliveryFee: 2.99,
        imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1000&auto=format&fit=crop',
        cuisineType: 'Italian',
        loyaltyBonus: 5,
        tags: ['Popular', 'Family Style', 'Pasta'],
        badge: 'Popular',
        discount: '20% Off',
        isActive: true,
        offers: [
            { id: 'o1', title: 'BOGO Pasta', description: 'Buy one Pasta, get one free every Tuesday', type: 'promo' },
            { id: 'o2', title: 'Free Tiramisu', description: 'On orders above $50', type: 'reward' }
        ],
        categories: ['Featured', 'Pasta', 'Pizza', 'Desserts', 'Drinks']
    },
    {
        id: '2',
        name: 'Spice Route',
        category: 'Indian',
        rating: 4.6,
        reviewCount: 892,
        deliveryTime: '30-40 min',
        deliveryFee: 0,
        imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=1000&auto=format&fit=crop',
        cuisineType: 'Indian',
        loyaltyBonus: 3,
        tags: ['Free Delivery', 'Spicy', 'Curry'],
        badge: 'Trending',
        discount: '15% Off',
        isActive: true,
        offers: [
            { id: 'o3', title: 'Lunch Thali $10', description: 'Complete meal available 11am-3pm', type: 'promo' }
        ],
        categories: ['Best Sellers', 'Curries', 'Tandoor', 'Breads', 'Sides']
    },
    {
        id: '3',
        name: 'Burger Barn',
        category: 'American',
        rating: 4.4,
        reviewCount: 567,
        deliveryTime: '20-30 min',
        deliveryFee: 1.99,
        imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1000&auto=format&fit=crop',
        cuisineType: 'American',
        loyaltyBonus: 2,
        tags: ['Fast Food', 'Halal', 'Late Night'],
        badge: 'Popular',
        discount: '10% Off',
        isActive: true,
        offers: [
            { id: 'o4', title: 'Combo Deal', description: 'Free Drink and Fries with any Double Burger', type: 'promo' }
        ],
        categories: ['Hot Deals', 'Burgers', 'Sides', 'Milkshakes']
    },
    {
        id: '4',
        name: 'Grand Cairo Grill',
        category: 'Middle Eastern',
        rating: 4.9,
        reviewCount: 1245,
        deliveryTime: '20-30 min',
        deliveryFee: 0.99,
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop',
        cuisineType: 'Egyptian',
        loyaltyBonus: 10,
        tags: ['Signature', 'Grilled', 'Healthy'],
        badge: 'Must Try',
        isActive: true,
        offers: [
            { id: 'o5', title: 'Cairo Night', description: 'Complimentary Mint Lemonade with any Platter', type: 'promo' }
        ],
        categories: ['Breakfast', 'Grills', 'Signature', 'Salads', 'Fresh Juice']
    }
];

export async function GET(request: NextRequest) {
    try {
        // In a real implementation, we would fetch from Firestore here.
        // For now, return the mock data to satisfy the frontend.
        return Response.json({
            success: true,
            data: {
                restaurants: mockRestaurants
            }
        });
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        return Response.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
