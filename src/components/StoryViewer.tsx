import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, A11y } from 'swiper/modules';
import { StoryContent } from './Stories';
import { hapticSelection } from '@/utils/telegramUtils';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

// Custom styles for image swiper
const imageStyles = `
  .image-swiper .swiper-pagination {
    bottom: 10px !important;
    position: absolute !important;
  }
  
  .image-swiper .swiper-pagination-bullet {
    width: 8px !important;
    height: 8px !important;
    background-color: rgba(255, 255, 255, 0.5) !important;
    opacity: 1 !important;
  }
  
  .image-swiper .swiper-pagination-bullet-active {
    background-color: #3b82f6 !important;
  }
`;

interface ImageSwiperProps {
  story: StoryContent;
  onClose: () => void;
}

const ImageSwiper: React.FC<ImageSwiperProps> = ({ 
  story, 
  onClose
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Handle slide change
  const handleSlideChange = useCallback((swiper: any) => {
    setCurrentImageIndex(swiper.activeIndex);
  }, []);

  // Handle button clicks with proper mobile support
  const handleButtonClick = (callback: () => void) => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      {/* Custom styles */}
      <style>{imageStyles}</style>
      
      {/* Background overlay */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      {/* Image swiper container */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Close button */}
        <button 
          onClick={handleButtonClick(() => {
            hapticSelection();
            onClose();
          })}
          className="absolute top-4 right-4 z-20 text-gray-600 dark:text-gray-300 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header with title */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
          <h3 className="text-white font-semibold text-lg">{story.title}</h3>
        </div>

        {/* Image container with Swiper */}
        <div className="relative aspect-[9/16] overflow-hidden">
          <Swiper
            modules={[Pagination, A11y]}
            spaceBetween={0}
            slidesPerView={1}
            pagination={{ 
              clickable: true,
              type: 'bullets',
              bulletClass: 'swiper-pagination-bullet',
              bulletActiveClass: 'swiper-pagination-bullet-active',
            }}
            onSlideChange={handleSlideChange}
            className="w-full h-full image-swiper"
            touchRatio={1}
            threshold={10}
            longSwipesRatio={0.5}
            longSwipesMs={300}
          >
            {story.images.map((image, index) => (
              <SwiperSlide key={index} className="w-full h-full">
                <img 
                  src={image} 
                  alt={`${story.title} - ${index + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default ImageSwiper; 