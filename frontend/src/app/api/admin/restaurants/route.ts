import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const chainId = request.nextUrl.searchParams.get('chainId');
    const chainIdNum = chainId ? parseInt(chainId) : undefined;
    
    const restaurants = await Database.getAllRestaurants(chainIdNum);
    
    // Enrich with latest KPIs
    const enrichedRestaurants = await Promise.all(
      restaurants.map(async (restaurant) => {
        const kpis = await Database.getRestaurantLatestKPI(restaurant.id);
        const metrics = await Database.getRestaurantMetrics(restaurant.id);
        
        return {
          ...restaurant,
          latestKPIs: kpis,
          totalRevenue30d: metrics.total_revenue || 0,
          totalProfit30d: metrics.total_profit || 0,
          totalCustomers30d: metrics.total_customers || 0,
          totalOrders30d: metrics.total_orders || 0,
          avgDeliverySuccess: metrics.avg_delivery_success || 0
        };
      })
    );
    
    return NextResponse.json({
      restaurants: enrichedRestaurants,
      count: enrichedRestaurants.length,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const restaurantData = await request.json();
    
    // Validate required fields
    const requiredFields = ['restaurant_address', 'chain_id', 'name', 'country', 'local_currency'];
    const missingFields = requiredFields.filter(field => !restaurantData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Insert into database
    const query = `
      INSERT INTO restaurants (restaurant_address, chain_id, name, country, local_currency, daily_rate_limit_usd6, tax_bps, chainlink_oracle)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      restaurantData.restaurant_address,
      restaurantData.chain_id,
      restaurantData.name,
      restaurantData.country,
      restaurantData.local_currency,
      restaurantData.daily_rate_limit_usd6 || 10000000000, // Default $10K
      restaurantData.tax_bps || 1000, // Default 10%
      restaurantData.chainlink_oracle || '0x0000000000000000000000000000000000000000'
    ];
    
    const client = await Database.getClient();
    const result = await client.query(query, values);
    
    return NextResponse.json({
      success: true,
      restaurant: result.rows[0],
      message: 'Restaurant created successfully'
    });
    
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { restaurantId, updates } = await request.json();
    
    if (!restaurantId || !updates) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    const updatedRestaurant = await Database.updateRestaurant(restaurantId, updates);
    
    if (!updatedRestaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      restaurant: updatedRestaurant,
      message: 'Restaurant updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating restaurant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}