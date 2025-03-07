
import React from 'react';
import PageLayout from '@/components/PageLayout';
import EmojiAvatar from '@/components/EmojiAvatar';
import { Banner, BannerSlider } from '@/components/Banner';
import { useUser } from '@/contexts/UserContext';
import { getRandomBannerEmoji } from '@/utils/emojiUtils';

const Home: React.FC = () => {
  const { username, avatarEmoji } = useUser();

  // Banner data
  const banners = [
    {
      title: 'SPRING SALE',
      emoji: getRandomBannerEmoji(),
      color: 'bg-telegram-blue'
    },
    {
      title: 'NEW ARRIVALS',
      emoji: getRandomBannerEmoji(),
      color: 'bg-indigo-500'
    },
    {
      title: 'EXCLUSIVE DEALS',
      emoji: getRandomBannerEmoji(),
      color: 'bg-violet-500'
    }
  ];

  return (
    <PageLayout fullHeight className="p-4">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Welcome</h1>
          <p className="text-gray-600">@{username}</p>
        </div>
        <EmojiAvatar 
          emoji={avatarEmoji} 
          size="md" 
          className="hover-lift"
        />
      </header>

      <section className="mb-8 animate-slide-up">
        <BannerSlider banners={banners} />
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-4">Featured Categories</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-telegram-light rounded-lg p-6 text-center hover-lift">
            <span className="text-3xl">👕</span>
            <h3 className="mt-2 font-medium">Clothing</h3>
          </div>
          <div className="bg-telegram-light rounded-lg p-6 text-center hover-lift">
            <span className="text-3xl">👟</span>
            <h3 className="mt-2 font-medium">Footwear</h3>
          </div>
          <div className="bg-telegram-light rounded-lg p-6 text-center hover-lift">
            <span className="text-3xl">🧢</span>
            <h3 className="mt-2 font-medium">Accessories</h3>
          </div>
          <div className="bg-telegram-light rounded-lg p-6 text-center hover-lift">
            <span className="text-3xl">🎒</span>
            <h3 className="mt-2 font-medium">Bags</h3>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-medium mb-4">Latest News</h2>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm animate-slide-up">
            <h3 className="font-medium">New Collection Arriving Soon</h3>
            <p className="text-sm text-gray-600 mt-1">Get ready for our summer collection dropping next week!</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="font-medium">Free Shipping Weekend</h3>
            <p className="text-sm text-gray-600 mt-1">Enjoy free shipping on all orders this weekend</p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Home;
