// Basic smoke test for mobile app setup
describe('Customer App Setup', () => {
    it('jest is configured correctly', () => {
        expect(true).toBe(true);
    });

    it('can import React Native', () => {
        expect(typeof require('react-native')).toBe('object');
    });

    it('has test environment ready', () => {
        expect(process.env.NODE_ENV).toBeDefined();
    });
});