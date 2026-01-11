'use client';

import { useState } from 'react';
import OrderStatus from './OrderStatus';

interface Product {
  id: string;
  name: string;
  category: string;
  volume?: string; // Changed from size/color to volume for perfumes
  fragranceNotes?: string; // Added fragrance notes
  price: number;
  image?: string;
  quantity?: number; // Added quantity
}

interface Order {
  _id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  products: Product[];
  totalPrice: number;
  status: 'new' | 'confirmed' | 'delivered' | 'canceled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: 'new' | 'confirmed' | 'delivered' | 'canceled') => Promise<void>;
}

const categoryLabels: Record<string, string> = {
  'eau-de-parfum': 'Eau de Parfum',
  'eau-de-toilette': 'Eau de Toilette',
  'mens': "Men's Collection",
  'womens': "Women's Collection",
  'unisex': 'Unisex Collection',
};

export default function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(order.status);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price / 1000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleStatusChange = async (newStatus: 'new' | 'confirmed' | 'delivered' | 'canceled') => {
    if (newStatus === currentStatus) return;

    if (newStatus === 'canceled') {
      const confirmed = window.confirm('Are you sure you want to cancel this order?');
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      await onStatusChange(order._id, newStatus);
      setCurrentStatus(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusButtons = () => {
    const buttons: React.ReactElement[] = [];
    
    if (currentStatus === 'canceled') {
      return buttons;
    }
    
    if (currentStatus === 'new') {
      buttons.push(
        <button
          key="confirmed"
          onClick={() => handleStatusChange('confirmed')}
          disabled={loading}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-elegant text-sm"
        >
          {loading ? 'Processing...' : 'Confirm Order'}
        </button>
      );
      buttons.push(
        <button
          key="canceled"
          onClick={() => handleStatusChange('canceled')}
          disabled={loading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-elegant text-sm"
        >
          {loading ? 'Processing...' : 'Cancel Order'}
        </button>
      );
    }
    
    if (currentStatus === 'confirmed') {
      buttons.push(
        <button
          key="delivered"
          onClick={() => handleStatusChange('delivered')}
          disabled={loading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-elegant text-sm"
        >
          {loading ? 'Processing...' : 'Mark as Delivered'}
        </button>
      );
      buttons.push(
        <button
          key="canceled"
          onClick={() => handleStatusChange('canceled')}
          disabled={loading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-elegant text-sm"
        >
          {loading ? 'Processing...' : 'Cancel Order'}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow font-elegant card-luxury">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900 font-luxury">Order #{order._id.slice(-6)}</h3>
            <OrderStatus status={currentStatus} />
          </div>
          <p className="text-sm text-gray-500 font-elegant">{formatDate(order.createdAt)}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-2xl font-bold text-[#1a1a1a] font-luxury">{formatPrice(order.totalPrice)}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="border-t border-gray-200 pt-4 mb-4 space-y-2">
        <div>
          <span className="text-sm font-semibold text-gray-700 font-elegant">Customer: </span>
          <span className="text-gray-900 font-elegant">{order.customerName}</span>
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-700 font-elegant">Phone: </span>
          <a
            href={`tel:${order.customerPhone}`}
            className="text-[#1a1a1a] hover:text-[#2d2d2d] hover:underline font-elegant"
          >
            {order.customerPhone}
          </a>
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-700 font-elegant">Address: </span>
          <span className="text-gray-900 font-elegant">{order.customerAddress}</span>
        </div>
      </div>

      {/* Products */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2 font-elegant uppercase tracking-wide">Products Ordered:</h4>
        <ul className="space-y-3">
          {order.products.map((product, index) => (
            <li key={index} className="flex items-start justify-between text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
              <div className="flex-1">
                <p className="font-medium text-gray-900 font-elegant">{product.name}</p>
                <p className="text-gray-600 text-xs uppercase tracking-wide font-elegant">{categoryLabels[product.category] || product.category}</p>
                {product.volume && (
                  <p className="text-gray-500 text-xs mt-1 font-elegant">
                    Volume: {product.volume}
                    {product.quantity && product.quantity > 1 && ` (x${product.quantity})`}
                  </p>
                )}
                {product.fragranceNotes && (
                  <p className="text-gray-500 text-xs mt-1 italic font-elegant line-clamp-1">
                    {product.fragranceNotes}
                  </p>
                )}
              </div>
              <span className="text-[#1a1a1a] font-semibold ml-4 font-elegant">
                {formatPrice((product.price || 0) * (product.quantity || 1))}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="border-t border-gray-200 pt-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-1 font-elegant uppercase tracking-wide">Notes:</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg font-elegant">{order.notes}</p>
        </div>
      )}

      {/* Action Buttons */}
      {getStatusButtons().length > 0 && (
        <div className="border-t border-gray-200 pt-4 flex flex-wrap gap-2">
          {getStatusButtons()}
        </div>
      )}
    </div>
  );
}
