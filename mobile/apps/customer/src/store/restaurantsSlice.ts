import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@nilelink/mobile-shared';

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

export const loadNearbyRestaurants = createAsyncThunk(
    'restaurants/loadNearby',
    async (_, { dispatch }) => {
        dispatch(loadNearbyRestaurantsStart());
        try {
            const response = await api.get('/restaurants');
            if (response.data.success) {
                dispatch(loadNearbyRestaurantsSuccess(response.data.data.restaurants));
                return response.data.data.restaurants;
            }
            throw new Error(response.data.error || 'Failed to fetch restaurants');
        } catch (error: any) {
            dispatch(loadNearbyRestaurantsFailure(error.message));
            throw error;
        }
    }
);

export const loadRecommendedRestaurants = createAsyncThunk(
    'restaurants/loadRecommended',
    async (_, { dispatch }) => {
        dispatch(loadRecommendedRestaurantsStart());
        try {
            const response = await api.get('/restaurants'); // Using same endpoint for now
            if (response.data.success) {
                dispatch(loadRecommendedRestaurantsSuccess(response.data.data.restaurants));
                return response.data.data.restaurants;
            }
            throw new Error(response.data.error || 'Failed to fetch recommended restaurants');
        } catch (error: any) {
            dispatch(loadRecommendedRestaurantsFailure(error.message));
            throw error;
        }
    }
);

export const loadRestaurantDetails = createAsyncThunk(
    'restaurants/loadDetails',
    async (id: string, { dispatch }) => {
        dispatch(loadRestaurantDetailsStart());
        try {
            const response = await api.get(`/restaurants/${id}`);
            if (response.data.success) {
                dispatch(loadRestaurantDetailsSuccess(response.data.data.restaurant));
                return response.data.data.restaurant;
            }
            throw new Error(response.data.error || 'Failed to fetch restaurant details');
        } catch (error: any) {
            dispatch(loadRestaurantDetailsFailure(error.message));
            throw error;
        }
    }
);

export const loadMenuItems = createAsyncThunk(
    'restaurants/loadMenuItems',
    async (id: string, { dispatch }) => {
        dispatch(loadMenuItemsStart());
        try {
            const response = await api.get(`/restaurants/${id}`);
            if (response.data.success) {
                const items = response.data.data.restaurant.menuItems || [];
                dispatch(loadMenuItemsSuccess(items));
                return items;
            }
            throw new Error(response.data.error || 'Failed to fetch menu items');
        } catch (error: any) {
            dispatch(loadMenuItemsFailure(error.message));
            throw error;
        }
    }
);

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