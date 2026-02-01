import { NextRequest } from 'next/server';
import { auth, getUser } from '../../../services/FirebaseService';
import ipfsService from '../../../services/IPFSService';
import graphService from '../../../services/GraphService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch real user data from Firebase and blockchain
    let firebaseUser = null;
    let blockchainProfile = null;
    let ipfsProfile = null;

    try {
      // Get Firebase user data
      firebaseUser = await getUser(userId);
    } catch (error) {
      console.warn('Firebase user not found, trying blockchain data only');
    }

    try {
      // Get blockchain profile data
      blockchainProfile = await graphService.getUserProfile(userId);
    } catch (error) {
      console.warn('Blockchain profile not found');
    }

    // Try to load IPFS profile data if metadata CID exists
    if (blockchainProfile?.user?.metadataCid) {
      try {
        ipfsProfile = await ipfsService.getJSONContent(blockchainProfile.user.metadataCid);
      } catch (error) {
        console.warn('IPFS profile data not found');
      }
    }

    // Combine all data sources
    const profileData = {
      id: userId,
      // Firebase data
      email: firebaseUser?.email || blockchainProfile?.user?.email,
      emailVerified: firebaseUser?.emailVerified || false,
      phone: firebaseUser?.phoneNumber || blockchainProfile?.user?.phone,
      phoneVerified: !!firebaseUser?.phoneNumber,
      displayName: firebaseUser?.displayName || blockchainProfile?.user?.displayName,
      photoURL: firebaseUser?.photoURL,

      // Blockchain data
      walletAddress: blockchainProfile?.user?.walletAddress,
      role: blockchainProfile?.user?.role || 'CUSTOMER',
      reputation: blockchainProfile?.user?.reputation,
      totalOrders: blockchainProfile?.user?.reputation?.totalOrders || 0,
      totalSpent: blockchainProfile?.user?.reputation?.totalSpentUsd6 ?
        Number(blockchainProfile.user.reputation.totalSpentUsd6) / 1000000 : 0,

      // IPFS profile data (extended profile)
      businessName: ipfsProfile?.businessName,
      businessType: ipfsProfile?.businessType,
      businessDescription: ipfsProfile?.businessDescription,
      address: ipfsProfile?.address,
      city: ipfsProfile?.city,
      country: ipfsProfile?.country,
      postalCode: ipfsProfile?.postalCode,
      website: ipfsProfile?.website,
      taxId: ipfsProfile?.taxId,
      certifications: ipfsProfile?.certifications || [],
      shippingMethods: ipfsProfile?.shippingMethods || [],
      paymentTerms: ipfsProfile?.paymentTerms,
      businessSize: ipfsProfile?.businessSize,
      established: ipfsProfile?.established,

      // Metadata
      lastLogin: blockchainProfile?.user?.lastLoginAt,
      createdAt: firebaseUser?.metadata?.creationTime || blockchainProfile?.user?.createdAt,
      updatedAt: ipfsProfile?.updatedAt || new Date().toISOString(),

      // Verification status
      verified: blockchainProfile?.user?.status === 'VERIFIED' || ipfsProfile?.verified || false,

      // Data sources (for debugging)
      dataSources: {
        firebase: !!firebaseUser,
        blockchain: !!blockchainProfile?.user,
        ipfs: !!ipfsProfile
      }
    };

    return Response.json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return Response.json(
      { error: 'Failed to fetch profile data' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate user has permission to update this profile
    // In a real implementation, check if userId matches authenticated user

    // Prepare profile data for IPFS storage
    const profileData = {
      ...body,
      userId,
      updatedAt: new Date().toISOString(),
      version: '1.0'
    };

    // Upload to IPFS
    const ipfsResult = await ipfsService.uploadJSON(profileData, `user-profile-${userId}`);

    if (!ipfsResult) {
      return Response.json(
        { error: 'Failed to save profile data' },
        { status: 500 }
      );
    }

    // Update Firebase profile if display name changed
    if (body.displayName) {
      try {
        await auth.currentUser?.updateProfile({
          displayName: body.displayName
        });
      } catch (error) {
        console.warn('Failed to update Firebase display name');
      }
    }

    // In a real implementation, you would also update the blockchain
    // to reference the new IPFS CID for this user's profile

    return Response.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...profileData,
        ipfsCid: ipfsResult.cid,
        ipfsUrl: ipfsResult.url
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return Response.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
