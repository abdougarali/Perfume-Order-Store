import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

/**
 * PATCH /api/orders/[id]
 * Update order status (protected - requires login)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    const { status } = await request.json();

    if (!status || !['new', 'confirmed', 'delivered', 'canceled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid order status' },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        _id: order._id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        status: order.status,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      message: 'Order status updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating order:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while updating the order' },
      { status: 500 }
    );
  }
}
