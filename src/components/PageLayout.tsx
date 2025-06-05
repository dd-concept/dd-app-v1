import React, { ReactNode, useEffect, useState } from 'react';
import BottomNavigation from './BottomNavigation';
import { cn } from '@/lib/utils';
import { getSafeAreaInset, isFullscreen, isMobileDevice } from '@/utils/telegramUtils';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  fullHeight?: boolean;
  hideNavigation?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className,
  fullHeight = false,
  hideNavigation = false,
}) => {
  const [topPadding, setTopPadding] = useState('pt-4');
  
  useEffect(() => {
    // Function to calculate appropriate top padding
    const calculateTopPadding = () => {
      const isMobile = isMobileDevice();
      const isInFullscreen = isFullscreen();
      const safeArea = getSafeAreaInset();
      
      console.log('PageLayout padding calculation:', {
        isMobile,
        isInFullscreen,
        safeArea
      });
      
      if (isMobile) {
        // On mobile, always use extra padding whether in fullscreen or not
        // This accounts for potential fullscreen mode and mobile safe areas
        const topInset = safeArea?.top || 44; // Default for mobile notch/status bar
        const basePadding = 20; // Base padding for mobile
        const totalPadding = topInset + basePadding;
        
        console.log('Mobile padding calculation:', {
          topInset,
          basePadding,
          totalPadding
        });
        
        // Convert to Tailwind classes based on total padding needed
        if (totalPadding >= 80) {
          setTopPadding('pt-24'); // 96px
        } else if (totalPadding >= 64) {
          setTopPadding('pt-20'); // 80px
        } else if (totalPadding >= 48) {
          setTopPadding('pt-16'); // 64px
        } else if (totalPadding >= 32) {
          setTopPadding('pt-12'); // 48px
        } else {
          setTopPadding('pt-10'); // 40px - minimum for mobile
        }
      } else {
        // Desktop - use normal padding
        setTopPadding('pt-4'); // 16px
      }
    };
    
    // Calculate initial padding
    calculateTopPadding();
    
    // Set up interval to check for changes more frequently
    const interval = setInterval(calculateTopPadding, 500);
    
    // Also listen for window resize events
    const handleResize = () => {
      setTimeout(calculateTopPadding, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <div
      className={cn(
        'w-full pb-52 max-w-md mx-auto', // Increased bottom padding for better mobile spacing
        topPadding, // Dynamic top padding based on device and fullscreen state
        fullHeight ? 'min-h-screen' : '',
        className
      )}
      style={{ backgroundColor: 'transparent' }}
    >
      <div className="animate-fade-in">
        {children}
      </div>
      {!hideNavigation && <BottomNavigation />}
    </div>
  );
};

export default PageLayout;
