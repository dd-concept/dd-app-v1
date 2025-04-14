import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay, A11y, EffectFade } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
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
      navigate(banner.link);
    }
  };
  
  if (!banners || banners.length === 0) {
    return null;
  }
  
  return (
    <div className={`banner-swiper-container w-full relative ${className}`}>
      <Swiper
        modules={[Pagination, Navigation, Autoplay, A11y, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{ 
          clickable: true,
          type: 'bullets',
          bulletClass: 'swiper-pagination-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active'
        }}
        navigation={banners.length > 1}
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
    </div>
  );
};

export default BannerSwiper; 