import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const walletAddress = request.nextUrl.searchParams.get('walletAddress');
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Get investor data
    const investor = await Database.getInvestorByWallet(walletAddress);
    
    if (!investor) {
      return NextResponse.json(
        { error: 'Investor not found' },
        { status: 404 }
      );
    }

    // Get portfolio summary
    const summary = await Database.getInvestorPortfolioSummary(investor.id);
    
    // Get detailed portfolio
    const portfolio = await Database.getInvestorPortfolio(investor.id);
    
    // Get KPIs for each restaurant in portfolio
    const restaurantKPIs = await Promise.all(
      portfolio.map(async (investment) => {
        const kpis = await Database.getRestaurantLatestKPI(investment.restaurant_id);
        return {
          restaurantId: investment.restaurant_id,
          restaurantName: investment.restaurant_name,
          restaurantAddress: investment.restaurant_address,
          investment: investment.amount_usd6,
          ownershipBps: investment.ownership_bps,
          ownershipPercent: (investment.ownership_bps / 100).toFixed(2),
          kpis: kpis || {}
        };
      })
    );

    // Calculate metrics
    const totalInvestment = summary.total_invested || 0;
    const totalOwnership = (summary.total_ownership_bps || 0) / 100;
    const totalDividends = summary.total_dividends || 0;
    const totalROI = totalDividends; // Simplified
    const roiPercentage = totalInvestment > 0 ? (totalROI / totalInvestment) * 100 : 0;
    const paybackPeriod = roiPercentage > 0 ? Math.floor(100 / roiPercentage) : 0;
    const restaurantCount = summary.restaurant_count || 0;

    const response = {
      investor: {
        id: investor.id,
        walletAddress: investor.wallet_address,
        name: investor.name,
        email: investor.email,
        kycStatus: investor.kyc_status
      },
      portfolio: {
        totalInvestment,
        totalOwnership,
        totalROI,
        roiPercentage: Number(roiPercentage.toFixed(1)),
        paybackPeriod,
        restaurantCount,
        dividendYield: totalInvestment > 0 ? (totalDividends / totalInvestment) * 100 : 0
      },
      restaurants: restaurantKPIs,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}