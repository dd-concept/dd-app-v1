import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles - make sure they are imported in this order for proper styling
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

// Custom overrides for Swiper styles
import './PhotoSwiper.css';

interface PhotoSwiperProps {
  photos: string[];
  productName: string;
  fallbackEmoji?: string;
  className?: string;
}

const PhotoSwiper: React.FC<PhotoSwiperProps> = ({ 
  photos,
  productName,
  fallbackEmoji = '📦',
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.style.display = 'none';
    if (target.parentElement) {
      const fallbackElement = document.createElement('div');
      fallbackElement.className = 'w-full h-full flex items-center justify-center';
      fallbackElement.innerHTML = `<span class="text-8xl animate-float">${fallbackEmoji}</span>`;
      target.parentElement.appendChild(fallbackElement);
    }
  };
  
  if (!photos || photos.length === 0) {
    return (
      <div className={`w-full aspect-square bg-telegram-bg flex items-center justify-center ${className}`}>
        <span className="text-8xl animate-float">{fallbackEmoji}</span>
      </div>
    );
  }
  
  return (
    <div className={`photo-swiper-container w-full aspect-square bg-telegram-bg relative ${className}`}>
      <Swiper
        modules={[Navigation, A11y]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={true}
        onSlideChange={(swiper) => {
          setCurrentIndex(swiper.activeIndex);
        }}
        className="w-full h-full"
      >
        {photos.map((photo, index) => (
          <SwiperSlide key={index} className="w-full h-full">
            <img 
              src={photo} 
              alt={`${productName} - ${index + 1}`}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Custom pagination indicator for better visibility */}
      {photos.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/40 rounded-full px-3 py-1 z-10">
          <span className="text-white text-xs">
            {currentIndex + 1} / {photos.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default PhotoSwiper; 