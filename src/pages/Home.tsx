import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import UserAvatar from '@/components/UserAvatar';
import { Banner, BannerSlider } from '@/components/Banner';
import { useUser } from '@/contexts/UserContext';
import { getRandomBannerEmoji } from '@/utils/emojiUtils';
import { getTelegramUser, initTelegramWebApp, hapticSelection } from '@/utils/telegramUtils';
import { ArrowRight } from 'lucide-react';
// Import banner images
import mainBanner from '@/assets/main_banner.png';
import csBanner from '@/assets/cs_banner.png';
import shopBanner from '@/assets/shop_banner.png';

const Home: React.FC = () => {
  const { username, displayName, telegramUser, avatarEmoji, updateTelegramUser } = useUser();
  const navigate = useNavigate();

  // Initialize Telegram WebApp and get user data
  useEffect(() => {
    const initTelegram = async () => {
      try {
        // Initialize Telegram WebApp
        initTelegramWebApp();
        
        // Get Telegram user data
        const user = getTelegramUser();
        if (user) {
          console.log('Telegram user found on Home page:', user);
          // Update the user context with Telegram user data
          updateTelegramUser(user);
        }
      } catch (error) {
        console.error('Error initializing Telegram on Home page:', error);
      }
    };
    
    initTelegram();
  }, [updateTelegramUser]);

  // Banner data
  const banners = [
    {
      image: mainBanner,
      link: '/calculator'
    },
    {
      image: csBanner, 
      link: '/shop?brand=Cat%26Sofa'
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
    <PageLayout fullHeight className="p-4">
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
        <BannerSlider banners={banners} />
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
          <div className="bg-telegram-blue text-white dark:bg-telegram-blue rounded-lg p-4 shadow-sm hover-lift flex flex-col justify-between">
            <h3 className="font-medium">DD coin's</h3>
            <div className="text-4xl font-bold mb-1">5300</div>
            <p className="text-xs text-white/80">Баланс и реферальная программа</p>
            <div className="flex justify-end mt-1">
              <ArrowRight size={20} className="text-white/70" />
            </div>
          </div>

          {/* DD Manager Block */}
          <div className="bg-white dark:bg-sidebar-accent/50 rounded-lg p-4 shadow-sm hover-lift">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">DD manager</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Поможет определиться с цветом и размером</p>
              </div>
              <div className="flex items-center justify-center">
                <ArrowRight size={20} className="text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="mb-8">
        <h2 className="text-xl font-medium mb-4">Featured Categories</h2>
        <div className="grid grid-cols-2 gap-4 mb-12">
          <Link 
            to="/shop?category=sneakers" 
            className="bg-telegram-button dark:bg-telegram-dark rounded-lg p-6 text-center hover-lift"
          >
            <span className="text-3xl">👟</span>
            <h3 className="mt-2 font-medium text-white">Кроссовки</h3>
          </Link>
          <Link 
            to="/shop?category=tops" 
            className="bg-telegram-blue dark:bg-telegram-blue/90 rounded-lg p-6 text-center hover-lift"
          >
            <span className="text-3xl">👕</span>
            <h3 className="mt-2 font-medium text-white">Верх</h3>
          </Link>
          <Link 
            to="/shop?category=bottoms" 
            className="bg-telegram-blue/80 dark:bg-telegram-dark/80 rounded-lg p-6 text-center hover-lift"
          >
            <span className="text-3xl">👖</span>
            <h3 className="mt-2 font-medium text-white">Низ</h3>
          </Link>
          <Link 
            to="/shop?category=accessories" 
            className="bg-telegram-button/90 dark:bg-telegram-button/80 rounded-lg p-6 text-center hover-lift"
          >
            <span className="text-3xl">🧢</span>
            <h3 className="mt-2 font-medium text-white">Аксессуары</h3>
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
