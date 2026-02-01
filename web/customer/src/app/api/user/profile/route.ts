import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { UserService } from '@/lib/services/UserService';

export async function GET(req: NextRequest) {
    return withAuth(async (user) => {
        try {
            const userService = new UserService();
            let profile = await userService.getProfile(user.id);

            if (!profile) {
                // Return a default profile if none exists
                profile = {
                    uid: user.id,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    email: user.email || '',
                    phone: '',
                    locations: [
                        {
                            id: 'default-1',
                            label: 'Home',
                            address: 'Block 4, Sector 9, Zamalek',
                            city: 'Cairo',
                            country: 'Egypt',
                            isDefault: true,
                            icon: '🏠'
                        }
                    ],
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            }

            return NextResponse.json({
                success: true,
                data: profile
            });
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch user profile' },
                { status: 500 }
            );
        }
    })(req);
}

export async function POST(req: NextRequest) {
    return withAuth(async (user) => {
        try {
            const body = await req.json();
            const userService = new UserService();
            await userService.updateProfile(user.id, body);

            return NextResponse.json({
                success: true
            });
        } catch (error) {
            console.error('Error updating user profile:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to update user profile' },
                { status: 500 }
            );
        }
    })(req);
}
