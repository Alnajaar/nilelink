import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { AffiliateService } from '@/lib/services/AffiliateService';

// GET /api/admin/affiliates - Get all affiliates (admin only)
export async function GET(req: NextRequest) {
  return withAuth(async (user) => {
    // Check if user has admin role
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return Response.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    try {
      const affiliateService = new AffiliateService();
      const allAffiliates = await affiliateService.getAllAffiliates();

      return Response.json({
        success: true,
        data: {
          affiliates: allAffiliates,
          totalCount: allAffiliates.length
        }
      });
    } catch (error) {
      console.error('Error fetching affiliates:', error);
      return Response.json(
        { success: false, error: 'Failed to fetch affiliates' },
        { status: 500 }
      );
    }
  })(req);
}

// PUT /api/admin/affiliates/:id - Update affiliate (admin only)
export async function PUT(req: NextRequest) {
  return withAuth(async (user) => {
    // Check if user has admin role
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return Response.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    try {
      const url = new URL(req.url);
      const affiliateId = url.pathname.split('/').pop();

      if (!affiliateId) {
        return Response.json(
          { success: false, error: 'Affiliate ID is required' },
          { status: 400 }
        );
      }

      const updates = await req.json();
      const affiliateService = new AffiliateService();
      const updatedAffiliate = await affiliateService.updateAffiliate(affiliateId, updates);

      if (!updatedAffiliate) {
        return Response.json(
          { success: false, error: 'Affiliate not found or update failed' },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        message: 'Affiliate updated successfully',
        data: updatedAffiliate
      });
    } catch (error) {
      console.error('Error updating affiliate:', error);
      return Response.json(
        { success: false, error: 'Failed to update affiliate' },
        { status: 500 }
      );
    }
  })(req);
}
