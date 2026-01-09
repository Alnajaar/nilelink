import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function GET(request: NextRequest) {
    try {
        // Forward to backend API
        const response = await fetch(`${API_URL}/tenants`, {
            headers: {
                'Content-Type': 'application/json',
                // Forward auth headers if present
                ...Object.fromEntries(
                    Array.from(request.headers.entries()).filter(([key]) =>
                        key.toLowerCase().startsWith('authorization') ||
                        key.toLowerCase().startsWith('x-')
                    )
                )
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.error || 'Failed to fetch tenants' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Failed to fetch tenants:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch tenants' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Forward to backend API
        const response = await fetch(`${API_URL}/tenants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Forward auth headers if present
                ...Object.fromEntries(
                    Array.from(request.headers.entries()).filter(([key]) =>
                        key.toLowerCase().startsWith('authorization') ||
                        key.toLowerCase().startsWith('x-')
                    )
                )
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.error || 'Failed to create tenant' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Failed to create tenant:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create tenant' },
            { status: 500 }
        );
    }
}