module.exports = {
    preset: 'react-native',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native|@react-navigation|@react-native-community|react-native-vector-icons)/)'
    ],
    collectCoverageFrom: [
        '**/*.{js,jsx,ts,tsx}',
        '!**/node_modules/**',
        '!**/coverage/**',
        '!jest.config.js'
    ]
};