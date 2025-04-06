import { ReactNode } from "react";
import BottomNavigation from "../BottomNavigation";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  hideNavigation?: boolean;
  fullHeight?: boolean;
  noPadding?: boolean;
}

const PageLayout = ({
  children,
  className,
  hideNavigation = false,
  fullHeight = false,
  noPadding = false,
}: PageLayoutProps) => {
  return (
    <div 
      className={cn(
        "min-h-screen flex flex-col",
        fullHeight ? "h-screen" : "",
        className
      )}
    >
      <main 
        className={cn(
          "flex-1 w-full max-w-screen-md mx-auto",
          !noPadding && "px-4 py-4 pb-20",
          "animate-fade-in"
        )}
      >
        {children}
      </main>
      
      {!hideNavigation && (
        <div className="fixed bottom-0 left-0 right-0 z-10 w-full">
          <BottomNavigation />
        </div>
      )}
    </div>
  );
};

export default PageLayout; 