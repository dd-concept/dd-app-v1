import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { scrollToTop } from '@/utils/scrollUtils';

interface BannerProps {
  image: string;
  link?: string;
  external?: boolean;
  className?: string;
}

const Banner: React.FC<BannerProps> = ({ 
  image, 
  link,
  external = false,
  className
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (link) {
      if (external) {
        window.open(link, '_blank', 'noopener,noreferrer');
      } else {
        // Force scroll to top immediately before navigation
        scrollToTop();
        
        // Navigate to the link
        navigate(link);
        
        // Try scrolling again after navigation with delays
        [50, 100, 200].forEach(delay => {
          setTimeout(scrollToTop, delay);
        });
      }
    }
  };

  return (
    <div 
      className={cn(
        'w-full aspect-[2.5/1] bg-cover bg-center rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-all',
        className
      )}
      style={{ backgroundImage: `url(${image})` }}
      onClick={handleClick}
    />
  );
};

interface BannerSliderProps {
  banners: Array<{
    image: string;
    link?: string;
    external?: boolean;
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
    if (isTransitioning || banners.length <= 1) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const prevBanner = () => {
    if (isTransitioning || banners.length <= 1) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;
    
    const timer = setInterval(() => {
      nextBanner();
    }, interval);
    
    return () => clearInterval(timer);
  }, [autoPlay, interval, currentIndex, isTransitioning, banners.length]);

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className={cn('relative', className)}>
      <div className="overflow-hidden rounded-lg">
        <div 
          className="flex transition-transform duration-500 ease-in-out w-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div key={index} className="min-w-full">
              <Banner
                image={banner.image}
                link={banner.link}
                external={banner.external}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation dots - only show if multiple banners */}
      {banners.length > 1 && (
        <div className="flex justify-center mt-2 space-x-2">
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
      )}
      
      {/* Arrow controls - only show if multiple banners */}
      {banners.length > 1 && (
        <>
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
        </>
      )}
    </div>
  );
};

export { Banner, BannerSlider };
