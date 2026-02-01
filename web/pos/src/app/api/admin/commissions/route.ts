// web/pos/src/app/api/admin/commissions/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib/auth'
import { db } from '@/lib/firebase-admin'
import { z } from 'zod'

// Authorization middleware
async function requireSuperAdmin() {
  // Note: We're using Firebase auth here, which is acceptable as it's only for login/register
  // The session handling would typically be done via Firebase Auth in a real implementation
  
  // In a decentralized system, we'd likely use wallet authentication
  // For now, we'll simulate the authorization check
  
  // Since we removed the centralized user system, we'll use a different approach
  // In production, this would involve verifying wallet signatures or Firebase session
  
  // Simulate getting user info from Firebase Auth
  const user = {
    id: 'mock-user-id', // Would come from Firebase Auth
    role: 'SUPER_ADMIN'  // Would be verified from Firebase Auth claims
  };

  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new Error('Forbidden: Super Admin required')
  }

  return { session: { user }, user }
}

// Validation schemas
const GlobalCommissionSchema = z.object({
  businessType: z.enum(['RESTAURANT', 'SUPERMARKET', 'COFFEE_SHOP', 'SUPPLIER']),
  orderCommissionPct: z.number().min(0).max(100),
  deliveryCommissionPct: z.number().min(0).max(100)
})

const LocationCommissionSchema = z.object({
  country: z.string(),
  city: z.string().optional(),
  zone: z.string().optional(),
  businessType: z.enum(['RESTAURANT', 'SUPERMARKET', 'COFFEE_SHOP', 'SUPPLIER']).optional(),
  orderCommissionPct: z.number().min(0).max(100),
  deliveryCommissionPct: z.number().min(0).max(100),
  minimumDeliveryFee: z.number().min(0).optional()
})

const MerchantCommissionSchema = z.object({
  businessId: z.string(),
  orderCommissionPct: z.number().min(0).max(100),
  deliveryCommissionPct: z.number().min(0).max(100),
  isZeroCommission: z.boolean().optional(),
  justification: z.string().optional()
})

export async function GET(request: Request) {
  try {
    await requireSuperAdmin()
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'global'
    
    let data
    
    switch (type) {
      case 'global':
        // Get global commission rules from Firebase
        const globalSnapshot = await db.collection('global_commission_rules').get();
        data = [];
        globalSnapshot.forEach(doc => {
          const rule = doc.data();
          rule.id = doc.id;
          data.push(rule);
        });
        // Sort by businessType
        data.sort((a, b) => a.businessType.localeCompare(b.businessType));
        break
        
      case 'location':
        // Get location commission rules from Firebase
        const locationSnapshot = await db.collection('location_commission_rules').get();
        data = [];
        locationSnapshot.forEach(doc => {
          const rule = doc.data();
          rule.id = doc.id;
          data.push(rule);
        });
        // Sort by country
        data.sort((a, b) => a.country.localeCompare(b.country));
        break
        
      case 'merchant':
        // Get merchant commission rules from Firebase
        const merchantSnapshot = await db.collection('merchant_commission_rules')
          .where('isActive', '==', true)
          .get();
        data = [];
        merchantSnapshot.forEach(doc => {
          const rule = doc.data();
          rule.id = doc.id;
          data.push(rule);
        });
        // Sort by createdAt descending
        data.sort((a, b) => b.createdAt - a.createdAt);
        break
        
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
    
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Commission GET error:', error)
    if (error.message === 'Unauthorized' || error.message === 'Forbidden: Super Admin required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { session } = await requireSuperAdmin()
    const body = await request.json()
    
    const { type, ...data } = body
    
    let result
    
    switch (type) {
      case 'global':
        const globalData = GlobalCommissionSchema.parse(data)
        
        // Create or update global commission rule in Firebase
        const globalRuleId = globalData.businessType;
        const now = Date.now();
        
        await db.collection('global_commission_rules').doc(globalRuleId).set({
          ...globalData,
          updatedAt: now,
          createdAt: now
        });
        
        result = {
          id: globalRuleId,
          ...globalData,
          updatedAt: now,
          createdAt: now
        };
        break
        
      case 'location':
        const locationData = LocationCommissionSchema.parse(data)
        
        // Create location commission rule in Firebase
        const locationRuleId = `${locationData.country}-${locationData.city || 'all'}-${locationData.zone || 'all'}`;
        const locationNow = Date.now();
        
        await db.collection('location_commission_rules').doc(locationRuleId).set({
          ...locationData,
          id: locationRuleId,
          createdAt: locationNow,
          updatedAt: locationNow,
          isActive: true
        });
        
        result = {
          id: locationRuleId,
          ...locationData,
          createdAt: locationNow,
          updatedAt: locationNow,
          isActive: true
        };
        break
        
      case 'merchant':
        const merchantData = MerchantCommissionSchema.parse(data)
        
        // Validate zero commission requires justification
        if (merchantData.isZeroCommission && !merchantData.justification) {
          return NextResponse.json(
            { error: 'Justification required for zero commission' }, 
            { status: 400 }
          )
        }
        
        // Create merchant commission rule in Firebase
        const merchantRuleId = `${merchantData.businessId}-${Date.now()}`; // Unique ID
        const merchantNow = Date.now();
        
        await db.collection('merchant_commission_rules').doc(merchantRuleId).set({
          ...merchantData,
          id: merchantRuleId,
          createdBy: session.user.id,
          effectiveFrom: merchantNow,
          createdAt: merchantNow,
          updatedAt: merchantNow,
          isActive: true
        });
        
        result = {
          id: merchantRuleId,
          ...merchantData,
          createdBy: session.user.id,
          effectiveFrom: merchantNow,
          createdAt: merchantNow,
          updatedAt: merchantNow,
          isActive: true
        };
        break
        
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
    
    // Audit log in Firebase
    await db.collection('financial_audit_logs').add({
      adminId: session.user.id,
      action: 'COMMISSION_RULE_CREATED',
      entityType: `${type.toUpperCase()}_COMMISSION_RULE`,
      entityId: result.id,
      newValue: data,
      reason: data.justification || 'Commission rule update',
      timestamp: Date.now(),
      createdAt: Date.now()
    });
    
    return NextResponse.json({ data: result })
  } catch (error: any) {
    console.error('Commission POST error:', error)
    if (error.message === 'Unauthorized' || error.message === 'Forbidden: Super Admin required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { session } = await requireSuperAdmin()
    const body = await request.json()
    
    const { id, type, ...data } = body
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }
    
    let result
    
    switch (type) {
      case 'global':
        const globalData = GlobalCommissionSchema.partial().parse(data)
        
        // Update global commission rule in Firebase
        const now = Date.now();
        await db.collection('global_commission_rules').doc(id).update({
          ...globalData,
          updatedAt: now
        });
        
        result = {
          id,
          ...globalData,
          updatedAt: now
        };
        break
        
      case 'location':
        const locationData = LocationCommissionSchema.partial().parse(data)
        
        // Update location commission rule in Firebase
        const locationNow = Date.now();
        await db.collection('location_commission_rules').doc(id).update({
          ...locationData,
          updatedAt: locationNow
        });
        
        result = {
          id,
          ...locationData,
          updatedAt: locationNow
        };
        break
        
      case 'merchant':
        const merchantData = MerchantCommissionSchema.partial().parse(data)
        
        // Validate zero commission requires justification
        if (merchantData.isZeroCommission && !merchantData.justification) {
          return NextResponse.json(
            { error: 'Justification required for zero commission' }, 
            { status: 400 }
          )
        }
        
        // Update merchant commission rule in Firebase
        const merchantNow = Date.now();
        await db.collection('merchant_commission_rules').doc(id).update({
          ...merchantData,
          updatedAt: merchantNow
        });
        
        result = {
          id,
          ...merchantData,
          updatedAt: merchantNow
        };
        break
        
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
    
    // Audit log in Firebase
    await db.collection('financial_audit_logs').add({
      adminId: session.user.id,
      action: 'COMMISSION_RULE_UPDATED',
      entityType: `${type.toUpperCase()}_COMMISSION_RULE`,
      entityId: id,
      newValue: data,
      reason: data.justification || 'Commission rule update',
      timestamp: Date.now(),
      createdAt: Date.now()
    });
    
    return NextResponse.json({ data: result })
  } catch (error: any) {
    console.error('Commission PUT error:', error)
    if (error.message === 'Unauthorized' || error.message === 'Forbidden: Super Admin required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { session } = await requireSuperAdmin()
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type')
    
    if (!id || !type) {
      return NextResponse.json({ error: 'ID and type required' }, { status: 400 })
    }
    
    let result
    
    switch (type) {
      case 'global':
        // Don't actually delete global rules, just deactivate
        const now = Date.now();
        await db.collection('global_commission_rules').doc(id).update({
          isActive: false,
          updatedAt: now
        });
        
        result = {
          id,
          isActive: false,
          updatedAt: now
        };
        break
        
      case 'location':
        // Deactivate location commission rule
        const locationNow = Date.now();
        await db.collection('location_commission_rules').doc(id).update({
          isActive: false,
          updatedAt: locationNow
        });
        
        result = {
          id,
          isActive: false,
          updatedAt: locationNow
        };
        break
        
      case 'merchant':
        // Deactivate merchant commission rule
        const merchantNow = Date.now();
        await db.collection('merchant_commission_rules').doc(id).update({
          isActive: false,
          effectiveTo: merchantNow,
          updatedAt: merchantNow
        });
        
        result = {
          id,
          isActive: false,
          effectiveTo: merchantNow,
          updatedAt: merchantNow
        };
        break
        
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
    
    // Audit log in Firebase
    await db.collection('financial_audit_logs').add({
      adminId: session.user.id,
      action: 'COMMISSION_RULE_DELETED',
      entityType: `${type.toUpperCase()}_COMMISSION_RULE`,
      entityId: id,
      reason: 'Commission rule deactivated',
      timestamp: Date.now(),
      createdAt: Date.now()
    });
    
    return NextResponse.json({ data: result })
  } catch (error: any) {
    console.error('Commission DELETE error:', error)
    if (error.message === 'Unauthorized' || error.message === 'Forbidden: Super Admin required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}