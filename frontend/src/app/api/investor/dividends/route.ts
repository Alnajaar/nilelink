import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const walletAddress = request.nextUrl.searchParams.get('walletAddress');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100');
    
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

    // Get dividend history
    const dividendHistory = await Database.getDividendHistory(investor.id, limit);
    
    // Get accrued dividends
    const accruedDividends = await Database.getAccruedDividends(investor.id);
    
    // Calculate totals
    const totalPaid = dividendHistory
      .filter(d => d.status === 'paid')
      .reduce((sum, d) => sum + parseInt(d.amount_usd6), 0);
    
    const totalPending = dividendHistory
      .filter(d => d.status === 'pending')
      .reduce((sum, d) => sum + parseInt(d.amount_usd6), 0);

    const response = {
      accruedDividends,
      totalPaid,
      totalPending,
      recentDividends: dividendHistory.slice(0, 10),
      dividendHistory,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching dividends:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, restaurantId, amount } = await request.json();
    
    if (!walletAddress || !restaurantId || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
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

    // Check for pending dividends
    const accruedDividends = await Database.getAccruedDividends(investor.id);
    
    if (accruedDividends < amount) {
      return NextResponse.json(
        { error: 'Insufficient accrued dividends' },
        { status: 400 }
      );
    }

    // In a real implementation, this would:
    // 1. Call the smart contract to withdraw dividends
    // 2. Update the database with the transaction hash
    // 3. Mark dividends as paid
    
    return NextResponse.json({
      success: true,
      amount,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
      message: 'Dividend withdrawal initiated'
    });
    
  } catch (error) {
    console.error('Error withdrawing dividends:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}