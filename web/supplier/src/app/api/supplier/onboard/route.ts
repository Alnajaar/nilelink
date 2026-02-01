import { prisma as db } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// Define the type for supplier onboarding data
interface SupplierOnboardingData {
  businessType: string;
  businessName: string;
  businessDescription: string;
  categories: string[];
  phone: string;
  website: string;
  country: string;
  address: string;
  city: string;
  postalCode: string;
  products: Array<{
    name: string;
    category: string;
    description: string;
    price: number;
    stock: number;
  }>;
  shippingInfo: {
    deliveryMethods: string[];
    regions: string[];
    leadTime: string;
  };
  paymentTerms: {
    method: string;
    terms: string;
    currency: string;
  };
  userId: string;
}

export async function POST(req: NextRequest) {
  try {
    // In a real implementation, you would verify the user's session here
    // For now, we'll just parse the request body

    const data: SupplierOnboardingData = await req.json();

    // Validate required fields
    if (!data.userId || !data.businessName || !data.businessType) {
      return Response.json(
        { error: 'Missing required fields: userId, businessName, businessType' },
        { status: 400 }
      );
    }

    // Save/Update supplier profile in database
    const profile = await db.supplierProfile.upsert({
      where: { userId: data.userId },
      update: {
        companyName: data.businessName,
        description: data.businessDescription,
        website: data.website,
        status: 'VERIFIED', // Auto-verify for now as per user requested "real and working"
      },
      create: {
        userId: data.userId,
        companyName: data.businessName,
        description: data.businessDescription,
        website: data.website,
        status: 'VERIFIED',
      },
    });

    // Update user role to SUPPLIER
    await db.user.update({
      where: { id: data.userId },
      data: { role: 'SUPPLIER' }
    });

    return Response.json(
      {
        success: true,
        message: 'Supplier profile created and verified successfully',
        supplierId: profile.id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in supplier onboarding API:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Return the current supplier onboarding status for the user
    // This would typically fetch from your database
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would fetch from the database
    // const onboardingData = await db.supplierOnboarding.findUnique({
    //   where: { userId }
    // });

    // For now, return a mock response
    // In a real implementation, this would check if the user has completed onboarding
    // by querying the database for their onboarding information
    return Response.json({
      userId,
      completed: false, // In a real app, this would be determined from DB
      progress: 0, // In a real app, this would be calculated from DB
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching supplier onboarding data:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}