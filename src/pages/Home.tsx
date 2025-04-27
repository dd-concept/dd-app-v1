import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import UserAvatar from '@/components/UserAvatar';
import { ArrowRight } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { getRandomBannerEmoji } from '@/utils/emojiUtils';
import { initTelegramWebApp, hapticSelection } from '@/utils/telegramUtils';
import { getDDCoinsBalance, getTelegramUser } from '@/services/api';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import BannerSwiper from '@/components/BannerSwiper';
import DDManagerCard from '@/components/DDManagerCard';
import ProductCard from '@/components/ProductCard';

// Import banner images
import mainBanner from '@/assets/jointgbanner.webp';
import csBanner from '@/assets/buycatsofabanner.webp';
import ddCoinsBanner from '@/assets/ddcoinsbanner.webp';
import shopBanner from '@/assets/gotoshopbanner.webp';
import sneakersBanner from '@/assets/sneakers_category_banner.webp';
import clothesBanner from '@/assets/clothes_category_banner.webp';
import jeansBanner from '@/assets/jeans_category_banner.webp';
import beltBanner from '@/assets/belt_category_banner.webp';

const Home: React.FC = () => {
  const { username, displayName, telegramUser, avatarEmoji, updateTelegramUser } = useUser();
  const navigate = useNavigate();
  const [ddCoinsBalance, setDDCoinsBalance] = useState<number>(0);
  const [isLoadingDDCoins, setIsLoadingDDCoins] = useState<boolean>(false);

  // Initialize Telegram WebApp, get user data, and fetch DD coins
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize Telegram WebApp
        initTelegramWebApp();
        
        // Get Telegram user data
        const user = getTelegramUser();
        if (user) {
          console.log('Telegram user found on Home page:', user);
          // Update the user context with Telegram user data
          updateTelegramUser(user);
          
          // Fetch DD coins balance
          await fetchDDCoins(user.id);
        }
      } catch (error) {
        console.error('Error initializing Telegram on Home page:', error);
      }
    };
    
    initApp();
  }, [updateTelegramUser]);

  // Fetch DD coins balance
  const fetchDDCoins = async (userId: number) => {
    if (!userId) return;
    
    setIsLoadingDDCoins(true);
    try {
      console.log(`Fetching DD coins for user ID: ${userId}`);
      const balance = await getDDCoinsBalance();
      console.log('Home page: DD coins balance received:', balance);
      setDDCoinsBalance(balance);
    } catch (error) {
      console.error('Error fetching DD coins balance:', error);
      toast.error('Failed to load DD coins balance');
    } finally {
      setIsLoadingDDCoins(false);
    }
  };

  // Banner data
  const banners = [
    {
      image: mainBanner,
      link: 'https://t.me/dd_concept',
      external: true
    },
    {
      image: csBanner, 
      link: '/shop?brand=Cat%26Sofa'
    },
    {
      image: ddCoinsBanner,
      link: '/profile'
    }
  ];

  // Get the display username - prioritize Telegram username if available
  const displayUsername = telegramUser?.username || username;
  
  // Handle profile click with haptic feedback
  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Trigger selection haptic feedback
    hapticSelection();
    
    // Navigate to profile page
    navigate('/profile');
  };

  return (
    <PageLayout fullHeight className="p-4 pb-20">
      <header className="mb-6">
        {/* User profile section - clickable to navigate to profile */}
        <Link to="/profile" className="flex items-center gap-3 hover:opacity-90 transition-opacity" onClick={handleProfileClick}>
          <UserAvatar 
            user={telegramUser}
            emoji={avatarEmoji} 
            size="md" 
            className="hover-lift"
          />
          <div>
            <h1 className="text-2xl font-semibold">Welcome, {displayName}</h1>
            {displayUsername && (
              <p className="text-gray-600 dark:text-gray-400">
                @{displayUsername}
              </p>
            )}
          </div>
        </Link>
      </header>

      <section className="mb-8 animate-slide-up">
        <BannerSwiper banners={banners} />
      </section>


      {/* Three blocks with updated layout */}
      <section className="grid grid-cols-2 gap-4 mb-8">
        {/* Order Block - takes 1 column and full height */}
        <Link 
          to="/shop" 
          className="bg-cover bg-center rounded-lg p-4 h-full col-span-1 shadow-sm hover-lift flex flex-col justify-end"
          style={{ backgroundImage: `url(${shopBanner})` }}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-medium text-white">Заказать</h3>
            <ArrowRight size={20} className="text-white" />
          </div>
        </Link>

        {/* Right column blocks stacked vertically */}
        <div className="col-span-1 space-y-4">
          {/* DD Coins Block */}
          <Link 
            to="/profile" 
            className="bg-telegram-blue text-white dark:bg-telegram-blue rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <h3 className="font-medium text-white">$DD COINS:</h3>
            <div className="text-4xl font-bold mb-1 text-white">
              {isLoadingDDCoins ? (
                <div className="flex items-center justify-center h-10">
                  <LoadingSpinner size="md" className="text-white" />
                </div>
              ) : (
                ddCoinsBalance || 0
              )}
            </div>
            <p className="text-xs text-white/80">Баланс и реферальная программа</p>
            <div className="flex justify-end mt-1">
              <ArrowRight size={20} className="text-white" />
            </div>
          </Link>

          {/* DD Manager Block */}
          <DDManagerCard />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-4">Что купить?</h2>
        <div className="grid grid-cols-2 gap-4 mb-12">
          <Link 
            to="/shop?category=sneakers" 
            className="rounded-lg overflow-hidden relative hover-lift aspect-[5/3]"
            style={{ 
              backgroundImage: `url(${sneakersBanner})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 w-full p-4 flex justify-between items-center">
              <h3 className="font-medium text-white">Кроссовки</h3>
              <ArrowRight className="text-white" size={20} />
            </div>
          </Link>
          <Link 
            to="/shop?category=tops" 
            className="rounded-lg overflow-hidden relative hover-lift aspect-[5/3]"
            style={{ 
              backgroundImage: `url(${clothesBanner})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 w-full p-4 flex justify-between items-center">
              <h3 className="font-medium text-white">Верх</h3>
              <ArrowRight className="text-white" size={20} />
            </div>
          </Link>
          <Link 
            to="/shop?category=bottoms" 
            className="rounded-lg overflow-hidden relative hover-lift aspect-[5/3]"
            style={{ 
              backgroundImage: `url(${jeansBanner})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 w-full p-4 flex justify-between items-center">
              <h3 className="font-medium text-white">Низ</h3>
              <ArrowRight className="text-white" size={20} />
            </div>
          </Link>
          <Link 
            to="/shop?category=accessories" 
            className="rounded-lg overflow-hidden relative hover-lift aspect-[5/3]"
            style={{ 
              backgroundImage: `url(${beltBanner})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 w-full p-4 flex justify-between items-center">
              <h3 className="font-medium text-white">Аксессуары</h3>
              <ArrowRight className="text-white" size={20} />
            </div>
          </Link>
        </div>
      </section>

      {/* <section className="mb-10">
        <h2 className="text-xl font-medium mb-4">Latest News</h2>
        <div className="space-y-4">
          <div className="bg-white dark:bg-sidebar-accent/50 p-4 rounded-lg shadow-sm animate-slide-up">
            <h3 className="font-medium">New Collection Arriving Soon</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Get ready for our summer collection dropping next week!</p>
          </div>
          <div className="bg-white dark:bg-sidebar-accent/50 p-4 rounded-lg shadow-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="font-medium">Free Shipping Weekend</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Enjoy free shipping on all orders this weekend</p>
          </div>
          <div className="bg-white dark:bg-sidebar-accent/50 p-4 rounded-lg shadow-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="font-medium">Member Exclusive Discounts</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Members get 15% off all accessories this month</p>
          </div>
          <div className="bg-white dark:bg-sidebar-accent/50 p-4 rounded-lg shadow-sm animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="font-medium">New Store Opening</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Visit our new flagship store in Moscow starting June 1st</p>
          </div>
        </div>
      </section> */}
    </PageLayout>
  );
};

export default Home;
