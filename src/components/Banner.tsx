
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRandomBannerEmoji } from '@/utils/emojiUtils';

interface BannerProps {
  title: string;
  emoji?: string;
  className?: string;
  color?: string;
}

const Banner: React.FC<BannerProps> = ({ 
  title, 
  emoji, 
  className,
  color = 'bg-telegram-blue dark:bg-telegram-dark'
}) => {
  const [displayEmoji, setDisplayEmoji] = useState(emoji || getRandomBannerEmoji());

  useEffect(() => {
    if (!emoji) {
      setDisplayEmoji(getRandomBannerEmoji());
    }
  }, [emoji]);

  return (
    <div 
      className={cn(
        'rounded-lg px-6 py-8 text-white flex flex-col items-center justify-center w-full transition-all duration-300 animate-scale-in shadow-sm dark:shadow-none',
        color,
        className
      )}
    >
      <div className="text-3xl mb-2 animate-float">{displayEmoji}</div>
      <h3 className="text-xl font-medium tracking-wide">{title}</h3>
    </div>
  );
};

interface BannerSliderProps {
  banners: Array<{
    title: string;
    emoji?: string;
    color?: string;
  }>;
  className?: string;
  autoPlay?: boolean;
  interval?: number;
}

const BannerSlider: React.FC<BannerSliderProps> = ({
  banners,
  className,
  autoPlay = true,
  interval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextBanner = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const prevBanner = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay) return;
    
    const timer = setInterval(() => {
      nextBanner();
    }, interval);
    
    return () => clearInterval(timer);
  }, [autoPlay, interval, currentIndex, isTransitioning]);

  return (
    <div className={cn('relative', className)}>
      <div className="overflow-hidden rounded-lg">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div key={index} className="min-w-full">
              <Banner
                title={banner.title}
                emoji={banner.emoji}
                color={banner.color}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              index === currentIndex 
                ? 'bg-telegram-blue dark:bg-telegram-dark w-4' 
                : 'bg-gray-300 dark:bg-gray-600'
            )}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
      
      {/* Arrow controls */}
      <button
        onClick={prevBanner}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-gray-700 transition-colors"
        aria-label="Previous banner"
      >
        <ChevronLeft size={20} className="text-gray-800 dark:text-gray-200" />
      </button>
      
      <button
        onClick={nextBanner}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-gray-700 transition-colors"
        aria-label="Next banner"
      >
        <ChevronRight size={20} className="text-gray-800 dark:text-gray-200" />
      </button>
    </div>
  );
};

export { Banner, BannerSlider };
