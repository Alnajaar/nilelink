
import * as Location from 'expo-location';
import * as Crypto from 'expo-crypto';

export interface GeoProof {
    latitude: number;
    longitude: number;
    timestamp: number;
    proofHash: string;
    accuracy: number;
}

export class GeoVerificationClient {
    /**
     * Capture current location and generate a simple proof (for demo purposes)
     * TODO: Implement proper cryptographic proof in production
     */
    static async captureProof(orderId: string): Promise<GeoProof | null> {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permission to access location was denied');
                return null;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const { latitude, longitude, accuracy } = location.coords;
            const timestamp = location.timestamp;

            // Create deterministic data string
            const data = `${orderId}:${latitude}:${longitude}:${timestamp}`;

            // Generate SHA-256 hash
            const proofHash = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                data
            );

            return {
                latitude,
                longitude,
                timestamp,
                accuracy: accuracy || 0,
                proofHash
            };
        } catch (error) {
            console.error('Failed to capture geo proof:', error);
            return null;
        }
    }

    /**
     * Calculate distance between two coordinates in km (Haversine formula)
     */
    static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }

    private static deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}
