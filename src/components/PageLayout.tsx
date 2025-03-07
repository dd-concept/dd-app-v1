
import React, { ReactNode } from 'react';
import BottomNavigation from './BottomNavigation';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  fullHeight?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className,
  fullHeight = false,
}) => {
  return (
    <div
      className={cn(
        'w-full pb-20 max-w-md mx-auto bg-background',
        fullHeight ? 'min-h-screen' : '',
        className
      )}
    >
      <div className="animate-fade-in">
        {children}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default PageLayout;
