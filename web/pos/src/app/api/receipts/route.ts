import { NextRequest, NextResponse } from 'next/server';
import { printerService } from '@/services/PrinterService';

/**
 * Receipt Generation and Printing API Route
 * 
 * Handles digital receipt generation and physical printing
 * 
 * @route POST /api/receipts
 */
export async function POST(request: NextRequest) {
  try {
    const receiptData = await request.json();
    
    const { 
      orderId, 
      items, 
      totalAmount, 
      paymentMethod, 
      customerInfo, 
      branchId,
      cashierId,
      transactionHash
    } = receiptData;

    // Validate required fields
    if (!orderId || !items || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, items, totalAmount' },
        { status: 400 }
      );
    }

    // Format receipt data
    const formattedReceipt = {
      orderNumber: orderId,
      timestamp: new Date().toISOString(),
      items: items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      subtotal: items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
      tax: items.reduce((sum: number, item: any) => sum + (item.price * item.quantity * 0.09), 0), // Assuming 9% tax
      total: totalAmount,
      paymentMethod,
      customerInfo,
      branchId,
      cashierId,
      transactionHash: transactionHash || null,
      blockchainVerified: !!transactionHash
    };

    // If a printer is available, attempt to print
    const availablePrinters = printerService.getAvailablePrinters();
    const receiptPrinter = availablePrinters.find(p => p.type === 'receipt');
    
    if (receiptPrinter) {
      try {
        await printerService.printReceipt(receiptPrinter.id, formattedReceipt);
      } catch (printError) {
        console.warn('Failed to print receipt:', printError);
        // Continue anyway - we can still return the receipt data
      }
    }

    return NextResponse.json({
      success: true,
      receipt: formattedReceipt,
      printed: !!receiptPrinter,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Receipt generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during receipt generation' },
      { status: 500 }
    );
  }
}

/**
 * Get Receipt Status API Route
 * 
 * Checks the status of a receipt generation/printing job
 * 
 * @route GET /api/receipts/[receiptId]
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const receiptId = searchParams.get('receiptId');

  if (!receiptId) {
    return NextResponse.json(
      { error: 'Receipt ID is required' },
      { status: 400 }
    );
  }

  try {
    // In a real implementation, we would look up receipt details
    // For now, we'll return mock data
    const mockReceipt = {
      id: receiptId,
      status: 'completed',
      items: [
        { name: 'Margherita Pizza', quantity: 1, price: 12.99, total: 12.99 },
        { name: 'Caesar Salad', quantity: 1, price: 8.99, total: 8.99 }
      ],
      total: 21.98,
      paymentMethod: 'crypto',
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 minutes ago
      printed: true,
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      blockchainVerified: true,
    };

    return NextResponse.json({
      success: true,
      receipt: mockReceipt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Receipt status check error:', error);
    return NextResponse.json(
      { error: 'Error checking receipt status' },
      { status: 500 }
    );
  }
}

/**
 * Resend Receipt API Route
 * 
 * Allows resending a receipt to printer
 * 
 * @route PUT /api/receipts/[receiptId]/resend
 */
export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const receiptId = searchParams.get('receiptId');

  if (!receiptId) {
    return NextResponse.json(
      { error: 'Receipt ID is required' },
      { status: 400 }
    );
  }

  try {
    // In a real implementation, we would fetch the receipt data and reprint it
    // For now, we'll simulate a reprint
    
    const availablePrinters = printerService.getAvailablePrinters();
    const receiptPrinter = availablePrinters.find(p => p.type === 'receipt');
    
    if (!receiptPrinter) {
      return NextResponse.json(
        { error: 'No receipt printer available' },
        { status: 404 }
      );
    }

    // Simulate printing the receipt again
    await printerService.printReceipt(receiptPrinter.id, {
      orderNumber: receiptId,
      timestamp: new Date().toISOString(),
      items: [
        { name: 'Sample Item', quantity: 1, price: 10.00, total: 10.00 }
      ],
      total: 10.00,
      paymentMethod: 'crypto',
      blockchainVerified: true
    });

    return NextResponse.json({
      success: true,
      message: 'Receipt resent to printer',
      receiptId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Resend receipt error:', error);
    return NextResponse.json(
      { error: 'Error resending receipt' },
      { status: 500 }
    );
  }
}