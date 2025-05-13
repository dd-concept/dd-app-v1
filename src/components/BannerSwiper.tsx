import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, A11y, EffectFade } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import { scrollToTop } from '@/utils/scrollUtils';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Import the custom CSS
import './BannerSwiper.css';

interface BannerItem {
  image: string;
  link?: string;
  external?: boolean;
}

interface BannerSwiperProps {
  banners: BannerItem[];
  className?: string;
  autoPlayInterval?: number;
}

const BannerSwiper: React.FC<BannerSwiperProps> = ({ 
  banners,
  className = '',
  autoPlayInterval = 5000,
}) => {
  const navigate = useNavigate();
  
  const handleBannerClick = (banner: BannerItem) => {
    if (!banner.link) return;
    
    if (banner.external) {
      window.open(banner.link, '_blank', 'noopener,noreferrer');
    } else {
      // Force scroll to top immediately before navigation
      scrollToTop();
      
      // Navigate to the link
      navigate(banner.link);
      
      // Try scrolling again after navigation with delays
      [50, 100, 200].forEach(delay => {
        setTimeout(scrollToTop, delay);
      });
    }
  };
  
  if (!banners || banners.length === 0) {
    return null;
  }
  
  return (
    <div className={`banner-swiper-container w-full relative ${className}`}>
      <Swiper
        modules={[Pagination, Autoplay, A11y, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{ 
          clickable: true,
          type: 'bullets',
          bulletClass: 'swiper-pagination-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active',
          el: '.banner-pagination'
        }}
        navigation={false}
        autoplay={{
          delay: autoPlayInterval,
          disableOnInteraction: false,
        }}
        loop={banners.length > 1}
        effect="slide"
        className="w-full aspect-[2.5/1]"
      >
        {banners.map((banner, index) => (
          <SwiperSlide 
            key={index} 
            className="w-full h-full cursor-pointer"
            onClick={() => handleBannerClick(banner)}
          >
            <div 
              className="w-full h-full bg-cover bg-center rounded-lg"
              style={{ backgroundImage: `url(${banner.image})` }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="banner-pagination flex justify-center mt-2"></div>
    </div>
  );
};

export default BannerSwiper; 