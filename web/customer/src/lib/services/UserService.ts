import { db } from '../firebase-admin';
import { v4 as uuidv4 } from 'uuid';

export interface UserLocation {
    id: string;
    label: string; // Home, Office, etc.
    address: string;
    city: string;
    country: string;
    isDefault: boolean;
    icon: string;
}

export interface UserProfile {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    locations: UserLocation[];
    createdAt: Date;
    updatedAt: Date;
}

// Fallback in-memory store
declare global {
    var __user_store: Map<string, UserProfile> | undefined;
}

const inMemoryUsers = global.__user_store || new Map<string, UserProfile>();
if (!global.__user_store) global.__user_store = inMemoryUsers;

export class UserService {
    private collection = db.collection('user_profiles');
    private useFirestore = !!process.env.FIREBASE_PRIVATE_KEY;

    async getProfile(uid: string): Promise<UserProfile | null> {
        try {
            if (this.useFirestore) {
                const doc = await this.collection.doc(uid).get();
                if (doc.exists) {
                    const data = doc.data() as any;
                    return {
                        ...data,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
                    };
                }
            }
            return inMemoryUsers.get(uid) || null;
        } catch (error) {
            console.warn('Firestore getProfile failed, fallback used:', error);
            return inMemoryUsers.get(uid) || null;
        }
    }

    async updateProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
        const now = new Date();
        try {
            if (this.useFirestore) {
                await this.collection.doc(uid).set({
                    ...profile,
                    updatedAt: now
                }, { merge: true });
            } else {
                const existing = inMemoryUsers.get(uid) || {
                    uid,
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    locations: [],
                    createdAt: now,
                    updatedAt: now
                };
                const updated = { ...existing, ...profile, updatedAt: now };
                inMemoryUsers.set(uid, updated);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    async addLocation(uid: string, location: Omit<UserLocation, 'id'>): Promise<UserLocation> {
        const id = uuidv4();
        const newLocation: UserLocation = { ...location, id };

        const profile = await this.getProfile(uid);
        const locations = profile?.locations || [];

        // If this is default, unset others
        if (newLocation.isDefault) {
            locations.forEach(l => l.isDefault = false);
        }

        await this.updateProfile(uid, { locations: [...locations, newLocation] });
        return newLocation;
    }

    async removeLocation(uid: string, locationId: string): Promise<void> {
        const profile = await this.getProfile(uid);
        if (!profile) return;

        const updatedLocations = profile.locations.filter(l => l.id !== locationId);
        await this.updateProfile(uid, { locations: updatedLocations });
    }
}
