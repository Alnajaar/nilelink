import axios from 'axios';
import { Platform } from 'react-native';

const API_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:3010/api' // Android Emulator loopback
    : 'http://localhost:3010/api'; // iOS Simulator / Web

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor for auth tokens
api.interceptors.request.use(async (config) => {
    // TODO: Retrieve token from storage
    // const token = await AsyncStorage.getItem('token');
    // if (token) {
    //     config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
});
