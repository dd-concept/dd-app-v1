import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import OrderCard from '@/components/OrderCard';
import UserAvatar from '@/components/UserAvatar';
import ReferralCard from '@/components/ReferralCard';
import { useUser } from '@/contexts/UserContext';
import { fetchOrders, getUserRank, checkUserExists, getDDCoinsBalance, getTelegramUser } from '@/services/api';
import { toast } from 'sonner';
import { useTelegram } from '@/contexts/TelegramContext';
import { Settings as SettingsIcon, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, createFetchOptions } from '@/services/api/config';

const Profile: React.FC = () => {
  const { username, displayName, telegramUser, profile, avatarEmoji, updateTelegramUser } = useUser();
  const [isRegistered, setIsRegistered] = useState<boolean>(true);
  const [userRank, setUserRank] = useState<number>(0);
  const [isLoadingRank, setIsLoadingRank] = useState<boolean>(false);
  const [ddCoinsBalance, setDDCoinsBalance] = useState<number>(0);
  const [isLoadingDDCoins, setIsLoadingDDCoins] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // Use the Telegram context
  const { tg, initWebApp, getUserData } = useTelegram();

  // Fetch DD coins balance when component mounts
  useEffect(() => {
    const fetchDDCoins = async () => {
      const user = getTelegramUser();
      if (!user) return;
      
      setIsLoadingDDCoins(true);
      try {
        const balance = await getDDCoinsBalance();
        console.log('Profile page - DD coins direct API call:', balance);
        setDDCoinsBalance(balance);
      } catch (error) {
        console.error('Error fetching DD coins balance:', error);
      } finally {
        setIsLoadingDDCoins(false);
      }
    };
    
    fetchDDCoins();
  }, []);

  // Fetch DD coins balance
  const fetchDDCoinsBalance = async () => {
    if (!telegramUser) return;
    
    setIsLoadingDDCoins(true);
    try {
      const balance = await getDDCoinsBalance();
      console.log('Profile page: DD coins balance received:', balance);
      setDDCoinsBalance(balance);
    } catch (error) {
      console.error('Error fetching DD coins balance:', error);
    } finally {
      setIsLoadingDDCoins(false);
    }
  };

  // Fetch user rank directly from the API
  const fetchUserRank = async (userId: number) => {
    setIsLoadingRank(true);
    try {
      console.log(`Fetching rank for user ID: ${userId}`);
      
      const requestBody = {
        telegram_user_id: userId
      };
      
      const { options, clearTimeout } = createFetchOptions('POST', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/users/rank`, options);
      clearTimeout();
      
      if (!response.ok) {
        throw new Error(`Failed to fetch rank: ${response.status} ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('Raw rank response:', responseText);
      
      const data = JSON.parse(responseText);
      console.log('Parsed rank response:', data);
      
      if (data && data.loyalty_rank !== undefined) {
        const rankValue = typeof data.loyalty_rank === 'string' 
          ? parseInt(data.loyalty_rank, 10) 
          : Number(data.loyalty_rank);
          
        console.log('Setting user rank to:', rankValue);
        setUserRank(rankValue);
      } else {
        console.error('loyalty_rank not found in response:', data);
        setUserRank(0);
      }
    } catch (error) {
      console.error('Error fetching user rank:', error);
      setUserRank(0);
    } finally {
      setIsLoadingRank(false);
    }
  };

  // Initialize Telegram WebApp and get user data
  useEffect(() => {
    const initTelegram = async () => {
      try {
        console.log('Initializing Telegram WebApp on Profile page...');
        
        // Initialize Telegram WebApp using the hook
        initWebApp();
        
        // Get Telegram user data using the hook
        const user = getUserData();
        
        if (user) {
          console.log('Telegram user found on Profile page:', user);
          // Update the user context with Telegram user data
          updateTelegramUser(user);
          
          // Check if user exists in the API
          const exists = await checkUserExists();
          setIsRegistered(typeof exists === 'boolean' ? exists : exists.exists || false);
          
          // Get user rank directly from the API
          await fetchUserRank(user.id);
          
          // Get DD coins balance
          await fetchDDCoinsBalance();
        } else {
          console.log('No Telegram user data found on Profile page');
          
          // Try one more time after a delay
          setTimeout(async () => {
            const retryUser = getUserData();
            if (retryUser) {
              console.log('Telegram user found after delay:', retryUser);
              updateTelegramUser(retryUser);
              
              // Check if user exists in the API
              const exists = await checkUserExists();
              setIsRegistered(typeof exists === 'boolean' ? exists : exists.exists || false);
              
              // Get user rank directly from the API
              await fetchUserRank(retryUser.id);
              
              // Get DD coins balance
              await fetchDDCoinsBalance();
            } else {
              console.log('Still no Telegram user data after retry');
            }
          }, 500);
        }
      } catch (error) {
        console.error('Error initializing Telegram on Profile page:', error);
      }
    };
    
    initTelegram();
  }, [updateTelegramUser, initWebApp, getUserData, tg]);

  // Fetch orders
  const { data: orders, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
    retryDelay: 1000,
    enabled: isRegistered, // Only run the query if user is registered
  });

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  if (isError && error instanceof Error && !error.message.includes('not found')) {
    return (
      <PageLayout>
        <div className="p-4 text-center">
          <h2 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Error loading profile</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error instanceof Error ? error.message : 'Please try again later'}
          </p>
          <button 
            className="px-4 py-2 bg-telegram-blue text-white rounded-lg"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      </PageLayout>
    );
  }

  const displayOrders = orders || [];

  return (
    <PageLayout>
      <div className="p-4 relative">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <UserAvatar 
              user={telegramUser} 
              emoji={avatarEmoji} 
              size="lg" 
              className="hover-lift"
            />
            <div>
              <h1 className="text-2xl font-semibold">
                {telegramUser?.username ? `@${telegramUser.username}` : displayName}
              </h1>
              {telegramUser && (
                <p className="text-gray-600 dark:text-gray-400">
                  {telegramUser.first_name} {telegramUser.last_name || ''}
                </p>
              )}
              <div className="mt-2 flex items-center">
                <span className="text-sm bg-telegram-light dark:bg-telegram-dark/20 text-telegram-blue dark:text-telegram-blue px-2 py-1 rounded-full">
                  {isLoadingRank ? 'Loading...' : `Rank ${userRank}`}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/settings')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-telegram-light dark:bg-sidebar-accent hover:bg-telegram-secondary-bg dark:hover:bg-sidebar-primary transition-colors"
            aria-label="Settings"
          >
            <SettingsIcon size={20} className="text-telegram-blue" />
          </button>
        </div>

        {/* DD Coins Balance */}
        <div className="mb-8 bg-white dark:bg-sidebar-accent rounded-lg p-4 shadow-sm animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins size={24} className="text-yellow-500" />
              <h2 className="text-lg font-semibold">DD Coins Balance</h2>
            </div>
            {isLoadingDDCoins ? (
              <span className="text-sm text-gray-500">Loading...</span>
            ) : (
              <span className="text-xl font-bold text-telegram-blue">{ddCoinsBalance || 0}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            You can use your DD coins to get discounts on your orders (up to 50% of the order value).
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-up">
          <div className="bg-white dark:bg-sidebar-accent rounded-lg p-4 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-telegram-blue">{displayOrders.length}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Orders</p>
          </div>
          <div className="bg-white dark:bg-sidebar-accent rounded-lg p-4 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-telegram-blue">
              {displayOrders.filter(o => o.status === 'delivered').length}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Completed</p>
          </div>
          <div className="bg-white dark:bg-sidebar-accent rounded-lg p-4 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-telegram-blue">
              {displayOrders.filter(o => o.status !== 'delivered').length}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Pending</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-medium mb-4">Invite Friends</h2>
          <div className="bg-white dark:bg-sidebar-accent rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share your referral link with friends and earn rewards when they join and make purchases!
              </p>
            </div>
            <ReferralCard className="animate-fade-in" />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-medium mb-4">Order History</h2>
          
          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard
                  key={order.order_id}
                  order={order}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 text-center bg-telegram-secondary-bg rounded-lg">
              <h3 className="font-medium text-lg mb-2">No Orders Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You haven't placed any orders yet. Start shopping to see your orders here.
              </p>
              <button
                onClick={() => navigate('/shop')}
                className="px-4 py-2 bg-telegram-blue text-white rounded-lg"
              >
                Browse Products
              </button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Profile;
