import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import UserAvatar from '@/components/UserAvatar';
import { ArrowRight } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { getRandomBannerEmoji } from '@/utils/emojiUtils';
import { hapticSelection } from '@/utils/telegramUtils';
import { checkUserExists } from '@/services/api';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import BannerSwiper from '@/components/BannerSwiper';
import DDManagerCard from '@/components/DDManagerCard';
import ProductCard from '@/components/ProductCard';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import Stories, { StoryContent } from '@/components/Stories';
import StoryViewer from '@/components/StoryViewer';

// Import CSS
import '@/components/NoScrollbar.css';

// Import banner images
import mainBanner from '@/assets/jointgbanner.webp';
import csBanner from '@/assets/catsofa_banner.webp';
import ddCoinsBanner from '@/assets/ddcoins_banner.webp';
import calculatorBanner from '@/assets/calcbanner.webp';
import shopBanner from '@/assets/gotoshopbanner.webp';
import sneakersBanner from '@/assets/sneakers_category_banner.webp';
import clothesBanner from '@/assets/clothes_category_banner.webp';
import jeansBanner from '@/assets/jeans_category_banner.webp';
import beltBanner from '@/assets/belt_category_banner.webp';

// Import story images
import stPreviewImage from '@/assets/stories/st_preview_1.png';
import stBeginnerGuide1 from '@/assets/stories/stories_1.png';
import stBeginnerGuide2 from '@/assets/stories/st_beginner_guide_2.jpg';

const Home: React.FC = () => {
  useScrollToTop();
  const { username, displayName, telegramUser, avatarEmoji, updateTelegramUser } = useUser();
  const navigate = useNavigate();
  const [ddCoinsBalance, setDDCoinsBalance] = useState<number>(0);
  const [isLoadingDDCoins, setIsLoadingDDCoins] = useState<boolean>(false);
  
  // Story state
  const [selectedStory, setSelectedStory] = useState<StoryContent | null>(null);
  const [viewedStoryIds, setViewedStoryIds] = useState<string[]>([]);

  // Stories data
  const stories: StoryContent[] = [
    {
      id: 'beginner-guide',
      title: 'Краткий гайд',
      previewImage: stPreviewImage,
      images: [stBeginnerGuide1, stBeginnerGuide2],
      viewed: viewedStoryIds.includes('beginner-guide')
    }
  ];

  // Handle story click
  const handleStoryClick = (storyId: string) => {
    hapticSelection();
    const story = stories.find(s => s.id === storyId);
    if (story) {
      setSelectedStory(story);
    }
  };

  // Mark story as viewed
  const handleStoryViewed = (storyId: string) => {
    if (!viewedStoryIds.includes(storyId)) {
      setViewedStoryIds(prev => [...prev, storyId]);
    }
  };

  // Fetch DD coins when the component mounts
  useEffect(() => {
    // Only fetch DD coins if we have a user already
    if (telegramUser?.id) {
      fetchDDCoins(telegramUser.id);
    }
  }, [telegramUser]);

  // Fetch DD coins balance from user check endpoint
  const fetchDDCoins = async (userId: number) => {
    if (!userId) return;
    
    setIsLoadingDDCoins(true);
    try {
      console.log(`Fetching DD coins for user ID: ${userId}`);
      const response = await checkUserExists(true);
      
      if (response && typeof response !== 'boolean') {
        console.log('Home page: DD coins balance received:', response.dd_coins_balance);
        setDDCoinsBalance(response.dd_coins_balance);
        
        // Show welcome toast for new users
        if (response.is_new_client && response.dd_coins_balance === 500) {
          // Add a delay to ensure the toast appears after the app has loaded
          setTimeout(() => {
            toast.success(
              "Добро пожаловать! Только что начислили вам 500 $DD коинов в честь нашего знакомства!",
              { duration: 6000 }
            );
          }, 1500); // 1.5 second delay
        }
      } else {
        console.error('Failed to get DD coins balance from user check');
        setDDCoinsBalance(0);
      }
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
      image: ddCoinsBanner,
      link: '/profile'
    },
    {
      image: mainBanner,
      link: 'https://t.me/dd_concept',
      external: true
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
    <PageLayout fullHeight className="p-4 pb-20">
      <header className="mb-6">
        {/* Create a container for better control over spacing and alignment */}
        <div className="pt-2">
          {/* Images row - perfectly aligned */}
          <div className="flex items-center">
            {/* User profile section */}
            <div className="flex flex-col items-center shrink-0 mr-6">
              {/* Avatar with glow effect */}
              <div className="relative">
                <div className="absolute inset-0 bg-telegram-blue/50 rounded-full blur-lg animate-pulse-slow"></div>
                <div 
                  className="cursor-pointer" 
                  onClick={handleProfileClick}
                >
                  <UserAvatar 
                    user={telegramUser}
                    emoji={avatarEmoji} 
                    size="lg" 
                    className="relative z-10 hover-lift"
                  />
                </div>
              </div>
              
              {/* Text labels for profile */}
              <div className="flex flex-col items-center text-center mt-1">
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate w-16">
                  @{displayUsername}
                </span>
                <span className="text-xs font-medium text-telegram-blue">
                  DD:Профиль
                </span>
              </div>
            </div>
            
            {/* Stories section */}
            <div className="flex-1 overflow-x-auto no-scrollbar">
              <Stories stories={stories} onStoryClick={handleStoryClick} />
            </div>
          </div>
        </div>
      </header>
      
      {/* Story viewer */}
      {selectedStory && (
        <StoryViewer 
          story={selectedStory} 
          onClose={() => setSelectedStory(null)}
          onStoryViewed={handleStoryViewed}
        />
      )}

      <section className="mb-8 animate-slide-up">
        <BannerSwiper banners={banners} />
      </section>

      {/* Three blocks with updated layout */}
      <section className="mb-8">
        <div className="grid grid-cols-2 gap-4">
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
        </div>
        
        {/* Delivery Calculator Button - Full Width */}
        <Link 
          to="/calculator"
          onClick={() => window.scrollTo(0, 0)} 
          className="w-full rounded-lg overflow-hidden relative hover-lift h-16 block mt-4"
          style={{ 
            backgroundImage: `url(${calculatorBanner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute inset-0 flex items-center p-4">
            <h3 className="font-medium text-white text-lg flex-1 text-center">Рассчитать доставку</h3>
            <ArrowRight className="text-white" size={20} />
          </div>
        </Link>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-4">Что купить?</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Link 
            to="/shop?category=обувь" 
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
            to="/shop?category=верх" 
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
            to="/shop?category=низ" 
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
            to="/shop?category=аксессуары" 
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
    </PageLayout>
  );
};

export default Home;
