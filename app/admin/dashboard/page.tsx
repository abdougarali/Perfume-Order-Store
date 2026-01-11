'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import OrderCard from '@/components/OrderCard';

interface Product {
  id: string;
  name: string;
  category: string;
  volume?: string;
  fragranceNotes?: string;
  price: number;
  image?: string;
  quantity?: number;
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

type StatusFilter = 'all' | 'new' | 'confirmed' | 'delivered' | 'canceled';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [totalOrders, setTotalOrders] = useState(0);
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      
      const res = await fetch(`/api/admin/orders?${params.toString()}`);

      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await res.json();
      setOrders(data.orders || []);
      setTotalOrders(data.pagination?.total || data.orders?.length || 0);
      setError('');
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, router, currentPage, itemsPerPage]);

  const handleStatusChange = async (orderId: string, newStatus: 'new' | 'confirmed' | 'delivered' | 'canceled') => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update order status');
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert('An error occurred while updating the order status');
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(4);
      } else {
        setItemsPerPage(20);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price / 1000);
  };

  // Calculate statistics from all orders (not just filtered)
  const [allOrdersStats, setAllOrdersStats] = useState({
    total: 0,
    new: 0,
    confirmed: 0,
    delivered: 0,
    canceled: 0,
  });

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const res = await fetch('/api/admin/orders?limit=1000');
        if (res.ok) {
          const data = await res.json();
          const allOrders = data.orders || [];
          setAllOrdersStats({
            total: allOrders.length,
            new: allOrders.filter((o: Order) => o.status === 'new').length,
            confirmed: allOrders.filter((o: Order) => o.status === 'confirmed').length,
            delivered: allOrders.filter((o: Order) => o.status === 'delivered').length,
            canceled: allOrders.filter((o: Order) => o.status === 'canceled').length,
          });
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchAllStats();
  }, []);

  const totalRevenue = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const totalPages = Math.ceil(totalOrders / itemsPerPage) || 1;
  const currentOrders = orders;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-luxury truncate">
                Admin Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 font-elegant">
                Order Management
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <a
                href="/"
                className="text-xs sm:text-sm text-gray-600 hover:text-[#1a1a1a] transition-colors font-elegant px-2 sm:px-0 py-1.5 sm:py-0 whitespace-nowrap"
              >
                Homepage
              </a>
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-elegant whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 mb-6 sm:mb-8">
          {[
            { label: 'Total Orders', value: allOrdersStats.total, color: 'blue' },
            { label: 'New Orders', value: allOrdersStats.new, color: 'blue' },
            { label: 'Confirmed', value: allOrdersStats.confirmed, color: 'yellow' },
            { label: 'Delivered', value: allOrdersStats.delivered, color: 'green' },
            { label: 'Canceled', value: allOrdersStats.canceled, color: 'red' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6 border border-gray-200 hover:shadow-lg transition-shadow card-luxury">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 font-elegant truncate">{stat.label}</p>
                  <p className={`text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1 font-luxury ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'yellow' ? 'text-yellow-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    'text-red-600'
                  }`}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Revenue */}
        {totalRevenue > 0 && (
          <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 text-white">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm opacity-90 font-elegant">Total Revenue (Delivered)</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 truncate font-luxury">{formatPrice(totalRevenue)}</p>
              </div>
              <div className="text-3xl sm:text-4xl flex-shrink-0">💰</div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-6 border border-gray-200 card-luxury">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-shrink-0">
              <span className="text-xs sm:text-sm font-semibold text-gray-700 font-elegant block sm:inline">
                Filter by Status:
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {(['all', 'new', 'confirmed', 'delivered', 'canceled'] as StatusFilter[]).map((status) => {
                const statusLabels: Record<StatusFilter, string> = {
                  all: 'All',
                  new: 'New',
                  confirmed: 'Confirmed',
                  delivered: 'Delivered',
                  canceled: 'Canceled',
                };
                
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm font-elegant whitespace-nowrap ${
                      statusFilter === status
                        ? status === 'all'
                          ? 'bg-[#1a1a1a] text-white'
                          : status === 'new'
                          ? 'bg-blue-600 text-white'
                          : status === 'confirmed'
                          ? 'bg-yellow-600 text-white'
                          : status === 'delivered'
                          ? 'bg-green-600 text-white'
                          : 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {statusLabels[status]}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={fetchOrders}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1a1a1a] hover:bg-[#2d2d2d] text-white rounded-lg transition-colors text-xs sm:text-sm font-elegant whitespace-nowrap flex items-center justify-center gap-1.5 sm:ml-auto w-full sm:w-auto btn-luxury"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#1a1a1a]"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600 font-elegant">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-elegant text-sm sm:text-base">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-12 text-center border border-gray-200 card-luxury">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📦</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 font-luxury">No Orders</h3>
            <p className="text-sm sm:text-base text-gray-600 font-elegant">
              {statusFilter === 'all'
                ? 'No orders have been received yet'
                : `No orders with status "${statusFilter}"`}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {currentOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-elegant text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    if (!showPage && page === 2 && currentPage > 4) {
                      return <span key={page} className="px-2 text-gray-400">...</span>;
                    }
                    if (!showPage && page === totalPages - 1 && currentPage < totalPages - 3) {
                      return <span key={page} className="px-2 text-gray-400">...</span>;
                    }
                    if (!showPage) return null;

                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-2 min-w-[2.5rem] rounded-lg text-sm font-elegant transition-colors ${
                          currentPage === page
                            ? 'bg-[#1a1a1a] text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-elegant text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-3 text-center text-xs sm:text-sm text-gray-600 font-elegant">
                Page {currentPage} of {totalPages} • Showing {currentOrders.length} of {totalOrders} orders
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
