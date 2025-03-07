
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageLayout from '@/components/PageLayout';
import EmojiAvatar from '@/components/EmojiAvatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import OrderHistoryItem from '@/components/OrderHistoryItem';
import { useUser } from '@/contexts/UserContext';
import { fetchOrders, Order } from '@/services/api';

const Profile: React.FC = () => {
  const { username, email, avatarEmoji } = useUser();

  // Fetch orders
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', username],
    queryFn: () => fetchOrders(username),
    staleTime: 60 * 1000, // 1 minute
  });

  // Mock rank for UI demonstration - would come from API in real implementation
  const userRank = 3;

  // Handle loading state
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  // Handle error state
  if (error) {
    return (
      <PageLayout>
        <div className="p-4 text-center">
          <h2 className="text-lg font-medium text-red-600 mb-2">Error loading profile</h2>
          <p className="text-gray-600">Please try again later</p>
          <button 
            className="mt-4 px-4 py-2 bg-telegram-blue text-white rounded-lg"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </PageLayout>
    );
  }

  // We'll use demo orders if API doesn't return any
  const displayOrders: Order[] = orders && orders.length > 0 ? orders : [
    {
      order_id: 1001,
      order_date: '2023-06-15',
      total_amount: 78.99,
      status: 'paid',
      items: [
        { sku: 'TS001', item_name: 'Classic T-Shirt', color_code: 'Blue', size: 'M', price_rub: 2999 },
        { sku: 'JN001', item_name: 'Premium Jeans', color_code: 'Indigo', size: '32', price_rub: 4900 }
      ]
    },
    {
      order_id: 1002,
      order_date: '2023-07-22',
      total_amount: 125.50,
      status: 'pending',
      items: [
        { sku: 'HD001', item_name: 'Hoodie', color_code: 'Black', size: 'L', price_rub: 4550 },
        { sku: 'SN001', item_name: 'Sneakers', color_code: 'White', size: '42', price_rub: 8000 }
      ]
    }
  ];

  return (
    <PageLayout>
      <div className="p-4">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <EmojiAvatar 
            emoji={avatarEmoji} 
            size="lg" 
            className="hover-lift"
          />
          <div>
            <h1 className="text-2xl font-semibold">@{username}</h1>
            <p className="text-gray-600">{email}</p>
            <div className="mt-2 flex items-center">
              <span className="text-sm bg-telegram-light text-telegram-blue px-2 py-1 rounded-full">
                Rank {userRank}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-up">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-telegram-blue">{displayOrders.length}</h2>
            <p className="text-gray-600 text-sm">Orders</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-telegram-blue">
              {displayOrders.filter(o => o.status === 'paid').length}
            </h2>
            <p className="text-gray-600 text-sm">Completed</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-telegram-blue">
              {displayOrders.filter(o => o.status === 'pending').length}
            </h2>
            <p className="text-gray-600 text-sm">Pending</p>
          </div>
        </div>

        {/* Order History */}
        <h2 className="text-xl font-medium mb-4">Order History</h2>
        <div className="space-y-4">
          {displayOrders.map((order, index) => (
            <OrderHistoryItem 
              key={order.order_id} 
              order={order} 
              className="animate-fade-in"
              animationDelay={`${index * 0.1}s`}
            />
          ))}
        </div>

        {/* Settings Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-4 animate-fade-in">
          <h2 className="text-lg font-medium mb-4">Settings</h2>
          <div className="space-y-2">
            <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors">
              Edit Profile
            </button>
            <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors">
              Notification Preferences
            </button>
            <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors">
              Shipping Addresses
            </button>
            <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors">
              Payment Methods
            </button>
            <button className="w-full text-left py-2 px-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              Log Out
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Profile;
