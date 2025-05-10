import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import OrderCard from '@/components/OrderCard';
import UserAvatar from '@/components/UserAvatar';
import ReferralCard from '@/components/ReferralCard';
import { useUser } from '@/contexts/UserContext';
import { fetchOrders, /* getUserRank, */ checkUserExists, getTelegramUser } from '@/services/api';
import { toast } from 'sonner';
import { useTelegram } from '@/contexts/TelegramContext';
import { Settings as SettingsIcon, Coins, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, createFetchOptions } from '@/services/api/config';
import DDCoinsInfoModal from '@/components/DDCoinsInfoModal';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const Profile: React.FC = () => {
  const { username, displayName, telegramUser, profile, avatarEmoji, updateTelegramUser } = useUser();
  const [isRegistered, setIsRegistered] = useState<boolean>(true);
  // const [userRank, setUserRank] = useState<number>(0);
  // const [isLoadingRank, setIsLoadingRank] = useState<boolean>(false);
  const [ddCoinsBalance, setDDCoinsBalance] = useState<number>(0);
  const [isLoadingDDCoins, setIsLoadingDDCoins] = useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // Use the Telegram context
  const { tg, initWebApp, getUserData } = useTelegram();

  useScrollToTop();

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
          
          // Check if user exists in the API and get DD coins balance
          const userResponse = await checkUserExists(true);
          if (userResponse && typeof userResponse !== 'boolean') {
            setIsRegistered(true);
            setDDCoinsBalance(userResponse.dd_coins_balance);
            setIsLoadingDDCoins(false);
          } else {
            setIsRegistered(false);
          }
          
          // Get user rank directly from the API
          // await fetchUserRank(user.id);
          
          // Get DD coins balance
          // await fetchDDCoinsBalance();
        } else {
          console.log('No Telegram user data found on Profile page');
          
          // Try one more time after a delay
          setTimeout(async () => {
            const retryUser = getUserData();
            if (retryUser) {
              console.log('Telegram user found after delay:', retryUser);
              updateTelegramUser(retryUser);
              
              // Check if user exists in the API and get DD coins balance
              const userResponse = await checkUserExists(true);
              if (userResponse && typeof userResponse !== 'boolean') {
                setIsRegistered(true);
                setDDCoinsBalance(userResponse.dd_coins_balance);
                setIsLoadingDDCoins(false);
              } else {
                setIsRegistered(false);
              }
              
              // Get user rank directly from the API
              // await fetchUserRank(retryUser.id);
              
              // Get DD coins balance
              // await fetchDDCoinsBalance();
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
      <PageLayout className="pb-20">
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
    <PageLayout className="pb-32">
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
              {/* <div className="mt-2 flex items-center">
                <span className="text-sm bg-telegram-light dark:bg-telegram-dark/20 text-telegram-blue dark:text-telegram-blue px-2 py-1 rounded-full">
                  {isLoadingRank ? 'Loading...' : `Rank ${userRank}`}
                </span>
              </div> */}
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
        <div className="mb-8 bg-telegram-blue dark:bg-telegram-blue rounded-lg p-5 shadow-sm animate-slide-up text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins size={28} className="text-yellow-400" />
              <div className="flex items-baseline gap-3">
                <h2 className="text-xl font-semibold text-white">$DD Баланс:</h2>
                {isLoadingDDCoins ? (
                  <LoadingSpinner size="sm" className="text-white ml-2" />
                ) : (
                  <span className="text-3xl font-bold text-white">{ddCoinsBalance || 0}</span>
                )}
              </div>
            </div>
            <button 
              onClick={() => setIsInfoModalOpen(true)}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="DD Coins Information"
            >
              <Info size={22} />
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-medium mb-4">Пригласи друзей</h2>
          <div className="bg-white dark:bg-sidebar-accent rounded-lg shadow-sm overflow-hidden">
          <ReferralCard className="animate-fade-in" />
            <div className="p-4 border-b border-gray-100 dark:border-gray-800/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                *Поделись своей реферальной ссылкой с друзьями и получай награду в $DD, когда они присоединятся и сделают покупки!
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-up">
          <div className="bg-white dark:bg-sidebar-accent rounded-lg p-4 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-telegram-blue">{displayOrders.length}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Всего заказов</p>
          </div>
          <div className="bg-white dark:bg-sidebar-accent rounded-lg p-4 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-telegram-blue">
              {displayOrders.filter(o => o.status === 'delivered').length}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Завершенных</p>
          </div>
          <div className="bg-white dark:bg-sidebar-accent rounded-lg p-4 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-telegram-blue">
              {displayOrders.filter(o => o.status !== 'delivered').length}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Активных</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-medium mb-4">История заказов</h2>
          
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
              <h3 className="font-medium text-lg mb-2">Еще нет заказов</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Вы еще не сделали ни одного заказа. Начните покупки, чтобы увидеть их здесь.
              </p>
              <button
                onClick={() => navigate('/shop')}
                className="px-4 py-2 bg-telegram-blue text-white rounded-lg"
              >
                В магазин!
              </button>
            </div>
          )}
        </div>

        {/* Extra space at the bottom to ensure all content is visible */}
        <div className="h-16"></div>

        {/* DD Coins Info Modal */}
        <DDCoinsInfoModal 
          isOpen={isInfoModalOpen} 
          onClose={() => setIsInfoModalOpen(false)} 
        />
      </div>
    </PageLayout>
  );
};

export default Profile;
