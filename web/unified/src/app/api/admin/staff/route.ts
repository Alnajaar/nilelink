import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';

// export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const restaurantId = request.nextUrl.searchParams.get('restaurantId');
    const restaurantIdNum = restaurantId ? parseInt(restaurantId) : undefined;
    
    const staff = await Database.getStaffAccounts(restaurantIdNum);
    
    return NextResponse.json({
      staff,
      count: staff.length,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const staffData = await request.json();
    
    // Validate required fields
    const requiredFields = ['restaurant_id', 'email', 'role'];
    const missingFields = requiredFields.filter(field => !staffData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Generate invitation code
    const invitationCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    
    // Set default permissions based on role
    const permissions = getDefaultPermissions(staffData.role);
    
    const newStaff = await Database.createStaffAccount({
      ...staffData,
      invitation_code: invitationCode,
      permissions
    });
    
    return NextResponse.json({
      success: true,
      staff: newStaff,
      invitationCode,
      message: 'Staff member invited successfully'
    });
    
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { staffId, updates } = await request.json();
    
    if (!staffId || !updates) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    const updatedStaff = await Database.updateStaffAccount(staffId, updates);
    
    if (!updatedStaff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      staff: updatedStaff,
      message: 'Staff member updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getDefaultPermissions(role: string) {
  const basePermissions = {
    dashboard: false,
    pos: false,
    inventory: false,
    payments: false,
    delivery: false,
    earnings: false,
    reports: false,
    ledger: false,
    invoices: false,
    disputes: false,
    overrides: false,
    investments: false,
    dividends: false,
    kpi: false
  };
  
  switch (role) {
    case 'manager':
      return { ...basePermissions, dashboard: true, pos: true, inventory: true, payments: true, delivery: true, reports: true, disputes: true, overrides: true, investments: true, kpi: true };
    case 'cashier':
      return { ...basePermissions, pos: true, inventory: true, payments: true };
    case 'delivery':
      return { ...basePermissions, delivery: true, earnings: true };
    case 'accountant':
      return { ...basePermissions, reports: true, ledger: true, invoices: true };
    case 'investor':
      return { ...basePermissions, dashboard: true, investments: true, dividends: true, kpi: true };
    default:
      return basePermissions;
  }
}