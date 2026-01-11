import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

/**
 * POST /api/orders
 * Create a new order
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const orderData = await request.json();

    // Validate required fields
    if (!orderData.customerName || !orderData.customerPhone || !orderData.customerAddress) {
      return NextResponse.json(
        { error: 'Incomplete data. Please enter name, phone number, and address' },
        { status: 400 }
      );
    }

    if (!orderData.products || !Array.isArray(orderData.products) || orderData.products.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one product' },
        { status: 400 }
      );
    }

    if (!orderData.totalPrice || orderData.totalPrice <= 0) {
      return NextResponse.json(
        { error: 'Invalid total price' },
        { status: 400 }
      );
    }

    // Create the order
    const order = await Order.create({
      customerName: orderData.customerName.trim(),
      customerPhone: orderData.customerPhone.trim(),
      customerAddress: orderData.customerAddress.trim(),
      products: orderData.products,
      totalPrice: orderData.totalPrice,
      status: 'new',
      notes: orderData.notes?.trim() || '',
    });

    return NextResponse.json(
      {
        success: true,
        orderId: order._id.toString(),
        message: 'Your order has been submitted successfully! We will contact you soon.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting your order. Please try again.' },
      { status: 500 }
    );
  }
}
