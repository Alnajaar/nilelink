import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { useAuth } from './useAuth'; // Assuming useAuth exists or similar
import { Socket } from 'socket.io-client';

export function useLocationTracker(socket: Socket | null) {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;

        const startTracking = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            // Start watching position
            subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 10, // Update every 10 meters
                    timeInterval: 5000,   // Or every 5 seconds
                },
                (newLocation) => {
                    setLocation(newLocation);

                    // Emit location to backend if socket is connected
                    if (socket && socket.connected && user) {
                        socket.emit('driver:location', {
                            driverId: user.id,
                            latitude: newLocation.coords.latitude,
                            longitude: newLocation.coords.longitude,
                            heading: newLocation.coords.heading,
                            speed: newLocation.coords.speed,
                            timestamp: newLocation.timestamp
                        });
                    }
                }
            );
        };

        if (user && socket) { // Only track if logged in and socket ready
            startTracking();
        }

        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, [user, socket]);

    return { location, errorMsg };
}
