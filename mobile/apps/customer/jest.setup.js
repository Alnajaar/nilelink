import 'react-native-gesture-handler/jestSetup';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons', () => ({
    createIconSet: () => ({}),
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
    ...jest.requireActual('react-native-reanimated/mock'),
    runOnUI: jest.fn((fn) => fn()),
    runOnJS: jest.fn((fn) => fn()),
}));

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
    io: jest.fn(() => ({
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
    })),
}));

// Mock expo modules
jest.mock('expo-constants', () => ({
    default: {
        manifest: {},
        platform: {},
    },
}));

jest.mock('expo-linking', () => ({
    createURL: jest.fn(),
}));

jest.mock('expo-status-bar', () => ({
    StatusBar: 'StatusBar',
}));

// Global test setup
global.__reanimatedWorkletInit = jest.fn();