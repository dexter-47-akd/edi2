"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from '@supabase/supabase-js';
import { useRouter } from "next/navigation";

const supabaseUrl = 'https://njejfdmqtnplfnomjyvd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZWpmZG1xdG5wbGZub21qeXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODczNDIsImV4cCI6MjA3MTI2MzM0Mn0.N2jjDp86bTCnzr8zP-pQlipYzCNpCPrIDndMLGLlBmw';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Order {
  id: string;
  user_id: string;
  user_email: string;
  items: any[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shipping_address: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  payment_method: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  shipped: 'bg-purple-100 text-purple-800 border-purple-300',
  delivered: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirect=orders');
        return;
      }
      setUser(user);
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    // Fetch initial orders
    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };

    fetchOrders();

    // Set up realtime subscription for orders table
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`, // Only listen to orders for current user
        },
        (payload) => {
          console.log('Realtime event received:', payload);
          
          if (payload.eventType === 'INSERT') {
            // New order created
            setOrders((prev) => [payload.new as Order, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            // Order updated (e.g., status change)
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id ? (payload.new as Order) : order
              )
            );
          } else if (payload.eventType === 'DELETE') {
            // Order deleted
            setOrders((prev) => prev.filter((order) => order.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Orders
            </h1>
            <Link
              href="/"
              className="px-4 py-2 text-blue-600 border border-blue-300 rounded-xl hover:bg-blue-50 transition-colors font-medium"
            >
              ← Back to Shop
            </Link>
          </div>
          <p className="text-gray-600">
            View and track all your orders. Updates appear in real-time.
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status] || statusColors.pending}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.total)}</p>
                      <p className="text-xs text-gray-500">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-6">
                  {/* Items */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity} × {formatCurrency(item.price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Shipping Address</h4>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="font-medium text-gray-900">{order.shipping_address.fullName}</p>
                      <p className="text-gray-600">{order.shipping_address.address}</p>
                      <p className="text-gray-600">
                        {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
                      </p>
                      <p className="text-gray-600">{order.shipping_address.country}</p>
                      <p className="text-gray-600 mt-2">Phone: {order.shipping_address.phone}</p>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Subtotal</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(order.subtotal)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Tax</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(order.tax)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Shipping</p>
                      <p className="font-semibold text-gray-900">
                        {order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Payment Method</p>
                      <p className="font-semibold text-gray-900 capitalize">{order.payment_method}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

