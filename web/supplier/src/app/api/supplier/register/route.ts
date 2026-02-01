import { NextRequest } from 'next/server';
import { SupplierService, type Supplier } from '@shared/services/SupplierService';
import { MockDatabaseService } from '@shared/services/DatabaseService';
import { NotificationService } from '@shared/services/NotificationService';
import { CommissionService } from '@shared/services/CommissionService';

// Initialize services (in a real implementation, these would be injected or singleton instances)
const dbService = new MockDatabaseService();
const notificationService = new NotificationService();
const commissionService = new CommissionService(dbService);
const supplierService = new SupplierService(dbService, notificationService, commissionService);

export async function POST(request: NextRequest) {
  try {
    const supplierData = await request.json();

    // Validate required fields
    if (!supplierData.userId || !supplierData.businessName || !supplierData.contactEmail) {
      return Response.json(
        { error: 'Missing required fields: userId, businessName, contactEmail' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(supplierData.contactEmail)) {
      return Response.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already has a supplier account
    const existingSupplier = await supplierService.getSupplierByUserId(supplierData.userId);
    if (existingSupplier) {
      return Response.json(
        { error: 'A supplier account already exists for this user' },
        { status: 409 }
      );
    }

    // Register the new supplier
    const newSupplier = await supplierService.registerSupplier({
      userId: supplierData.userId,
      businessName: supplierData.businessName,
      description: supplierData.description,
      contactEmail: supplierData.contactEmail,
      contactPhone: supplierData.contactPhone,
      address: supplierData.address,
      taxId: supplierData.taxId,
      businessType: supplierData.businessType || 'wholesaler',
      commissionRate: supplierData.commissionRate || 5.0, // Default 5% commission
      payoutMethod: supplierData.payoutMethod || 'bank_transfer',
      bankDetails: supplierData.bankDetails,
      cryptoAddress: supplierData.cryptoAddress,
      minOrderAmount: supplierData.minOrderAmount,
      shippingOptions: supplierData.shippingOptions || [],
      inventorySyncEnabled: supplierData.inventorySyncEnabled ?? true
    });

    return Response.json(
      { 
        success: true, 
        supplier: newSupplier,
        message: 'Supplier registration submitted successfully. Awaiting admin approval.'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error registering supplier:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const supplierId = url.searchParams.get('id');
    
    if (supplierId) {
      // Get specific supplier by ID
      const supplier = await supplierService.getSupplierById(supplierId);
      if (!supplier) {
        return Response.json({ error: 'Supplier not found' }, { status: 404 });
      }
      
      return Response.json({ success: true, supplier });
    } else if (userId) {
      // Get supplier by user ID
      const supplier = await supplierService.getSupplierByUserId(userId);
      if (!supplier) {
        return Response.json({ error: 'Supplier not found for this user' }, { status: 404 });
      }
      
      return Response.json({ success: true, supplier });
    } else {
      // Get all suppliers (admin only in real implementation)
      const statusFilter = url.searchParams.get('status');
      const businessType = url.searchParams.get('businessType');
      const searchQuery = url.searchParams.get('search');
      
      const filters: any = {};
      if (statusFilter) filters.status = [statusFilter];
      if (businessType) filters.businessType = businessType;
      if (searchQuery) filters.searchQuery = searchQuery;
      
      const suppliers = await supplierService.getAllSuppliers(filters);
      return Response.json({ success: true, suppliers, count: suppliers.length });
    }
  } catch (error: any) {
    console.error('Error fetching supplier(s):', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const supplierId = url.searchParams.get('id');
    
    if (!supplierId) {
      return Response.json({ error: 'Supplier ID is required' }, { status: 400 });
    }
    
    const updateData = await request.json();
    
    // Prevent updating certain fields that shouldn't be changed directly
    const allowedFields: (keyof Supplier)[] = [
      'businessName', 'description', 'contactEmail', 'contactPhone', 'address', 
      'taxId', 'payoutMethod', 'bankDetails', 'cryptoAddress', 'minOrderAmount',
      'shippingOptions', 'inventorySyncEnabled'
    ];
    
    const filteredUpdateData: Partial<Supplier> = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredUpdateData[field] = updateData[field];
      }
    }
    
    const updated = await supplierService.updateSupplier(supplierId, filteredUpdateData);
    
    if (!updated) {
      return Response.json({ error: 'Supplier not found' }, { status: 404 });
    }
    
    const updatedSupplier = await supplierService.getSupplierById(supplierId);
    
    return Response.json({
      success: true,
      supplier: updatedSupplier,
      message: 'Supplier updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating supplier:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}