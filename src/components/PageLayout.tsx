import React, { ReactNode } from 'react';
import BottomNavigation from './BottomNavigation';
import { cn } from '@/lib/utils';

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
  return (
    <div
      className={cn(
        'w-full pb-52 max-w-md mx-auto', // Increased bottom padding for better mobile spacing
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
