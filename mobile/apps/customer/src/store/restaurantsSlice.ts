import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    customizations: any[];
    aiScore: number;
    estimatedPrepTime: number;
    nutritionalInfo?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}

interface RestaurantsState {
    nearbyRestaurants: Restaurant[];
    recommendedRestaurants: Restaurant[];
    currentRestaurant: Restaurant | null;
    menuItems: MenuItem[];
    loading: boolean;
    error: string | null;
}

const initialState: RestaurantsState = {
    nearbyRestaurants: [],
    recommendedRestaurants: [],
    currentRestaurant: null,
    menuItems: [],
    loading: false,
    error: null,
};

const restaurantsSlice = createSlice({
    name: 'restaurants',
    initialState,
    reducers: {
        loadNearbyRestaurantsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loadNearbyRestaurantsSuccess: (state, action: PayloadAction<Restaurant[]>) => {
            state.nearbyRestaurants = action.payload;
            state.loading = false;
        },
        loadNearbyRestaurantsFailure: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        loadRecommendedRestaurantsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loadRecommendedRestaurantsSuccess: (state, action: PayloadAction<Restaurant[]>) => {
            state.recommendedRestaurants = action.payload;
            state.loading = false;
        },
        loadRecommendedRestaurantsFailure: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        loadRestaurantDetailsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loadRestaurantDetailsSuccess: (state, action: PayloadAction<Restaurant>) => {
            state.currentRestaurant = action.payload;
            state.loading = false;
        },
        loadRestaurantDetailsFailure: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        loadMenuItemsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loadMenuItemsSuccess: (state, action: PayloadAction<MenuItem[]>) => {
            state.menuItems = action.payload;
            state.loading = false;
        },
        loadMenuItemsFailure: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        searchRestaurants: (state, action: PayloadAction<{ query: string; filters?: any }>) => {
            // Handle search logic here
        },
    },
});

export const {
    loadNearbyRestaurantsStart,
    loadNearbyRestaurantsSuccess,
    loadNearbyRestaurantsFailure,
    loadRecommendedRestaurantsStart,
    loadRecommendedRestaurantsSuccess,
    loadRecommendedRestaurantsFailure,
    loadRestaurantDetailsStart,
    loadRestaurantDetailsSuccess,
    loadRestaurantDetailsFailure,
    loadMenuItemsStart,
    loadMenuItemsSuccess,
    loadMenuItemsFailure,
    searchRestaurants,
} = restaurantsSlice.actions;

export default restaurantsSlice.reducer;