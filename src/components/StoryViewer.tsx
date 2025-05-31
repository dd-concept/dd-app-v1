import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { StoryContent } from './Stories';
import { hapticSelection } from '@/utils/telegramUtils';

interface StoryViewerProps {
  story: StoryContent;
  onClose: () => void;
  onStoryViewed?: (storyId: string) => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ 
  story, 
  onClose, 
  onStoryViewed 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [progress, setProgress] = useState<number[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const storyDuration = 5000; // 5 seconds per image
  
  // Swipe state
  const [isDragging, setIsDragging] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const touchStartRef = useRef({ y: 0, x: 0 });
  const viewerRef = useRef<HTMLDivElement>(null);

  // Initialize progress
  useEffect(() => {
    setProgress(story.images.map(() => 0));
  }, [story]);

  // Set up progress update
  useEffect(() => {
    const totalSteps = 100; // For smooth progress bar
    const stepTime = storyDuration / totalSteps;
    let currentProgress = progress[currentImageIndex];
    let timer: ReturnType<typeof setInterval>;

    if (currentProgress < 100 && !isDragging && !isPaused) {
      timer = setInterval(() => {
        setProgress(prev => {
          const newProgress = [...prev];
          newProgress[currentImageIndex] += 1;
          
          // If completed, move to next image
          if (newProgress[currentImageIndex] >= 100) {
            clearInterval(timer);
            
            // Auto advance to next image
            if (currentImageIndex < story.images.length - 1) {
              setTimeout(() => {
                setCurrentImageIndex(currentImageIndex + 1);
              }, 50);
            } else {
              // Last image completed
              if (onStoryViewed) {
                onStoryViewed(story.id);
              }
              setTimeout(onClose, 300);
            }
          }
          
          return newProgress;
        });
      }, stepTime);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentImageIndex, progress, story, onStoryViewed, onClose, isDragging, isPaused]);

  // Handle navigation
  const goToPrevious = useCallback(() => {
    hapticSelection();
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      // Reset progress for the new current image
      setProgress(prev => {
        const newProgress = [...prev];
        newProgress[currentImageIndex - 1] = 0;
        return newProgress;
      });
    }
  }, [currentImageIndex]);

  const goToNext = useCallback(() => {
    hapticSelection();
    if (currentImageIndex < story.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      // Reset progress for the new current image
      setProgress(prev => {
        const newProgress = [...prev];
        newProgress[currentImageIndex + 1] = 0;
        return newProgress;
      });
    } else {
      // Last image, close the viewer
      if (onStoryViewed) {
        onStoryViewed(story.id);
      }
      onClose();
    }
  }, [currentImageIndex, story.images.length, onClose, story.id, onStoryViewed]);

  // Handle mobile touch to pause/resume only
  const handleMobileTouch = useCallback(() => {
    if (isDragging) return; // Don't handle touches while dragging
    
    // Toggle pause state for mobile
    setIsPaused(prev => !prev);
    hapticSelection();
  }, [isDragging]);

  // Handle desktop click for pause + navigation
  const handleDesktopClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return; // Don't handle clicks while dragging
    
    // Stop the story progression immediately
    setIsPaused(true);
    hapticSelection();
    
    // Handle navigation based on click position for desktop
    const { clientX, currentTarget } = e;
    const { left, width } = currentTarget.getBoundingClientRect();
    const clickPosition = clientX - left;
    
    if (clickPosition < width / 3) {
      goToPrevious();
    } else if (clickPosition > (width / 3) * 2) {
      goToNext();
    }
  }, [isDragging, goToPrevious, goToNext]);

  // Handle click on left/right sides to navigate (desktop only)
  const handleScreenClick = (e: React.MouseEvent) => {
    handleDesktopClick(e);
  };
  
  // Touch handlers for swipe-to-close
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { 
      y: e.touches[0].clientY,
      x: e.touches[0].clientX
    };
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    const touchY = e.touches[0].clientY;
    const touchX = e.touches[0].clientX;
    const deltaY = touchY - touchStartRef.current.y;
    const deltaX = Math.abs(touchX - touchStartRef.current.x);
    
    // Only handle vertical swipes (deltaY > deltaX means more vertical than horizontal)
    if (Math.abs(deltaY) > deltaX) {
      setIsDragging(true);
      // Pause the story when dragging
      setIsPaused(true);
      // Limit the maximum drag distance and apply resistance
      const newTranslateY = Math.min(Math.max(deltaY, -300), 300);
      setTranslateY(newTranslateY);
      
      // Gradually decrease opacity as user swipes up or down
      const newOpacity = Math.max(1 - Math.abs(newTranslateY) / 400, 0.3);
      setOpacity(newOpacity);
      
      // Prevent scrolling
      e.preventDefault();
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isDragging) {
      // If dragged more than the threshold in either direction, close the story
      if (Math.abs(translateY) > 100) {
        hapticSelection();
        onClose();
      } else {
        // Reset position with animation
        setTranslateY(0);
        setOpacity(1);
      }
      setIsDragging(false);
    } else {
      // Handle touch as a press to pause the story
      handleMobileTouch();
    }
  };

  // Resume story progression when user double taps or after a delay
  useEffect(() => {
    if (isPaused && !isDragging) {
      const resumeTimer = setTimeout(() => {
        setIsPaused(false);
      }, 5000); // Resume after 5 seconds of inactivity (increased from 3)
      
      return () => clearTimeout(resumeTimer);
    }
  }, [isPaused, isDragging]);

  return (
    <div 
      ref={viewerRef}
      className="fixed inset-0 bg-black z-50 flex flex-col"
      style={{ 
        transform: `translateY(${translateY}px)`, 
        opacity: opacity,
        transition: isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main content with navigation areas - moved to top of the stack so image extends to top edge */}
      <div 
        className="absolute inset-0 z-0"
        onClick={handleScreenClick}
      >
        <img 
          src={story.images[currentImageIndex]} 
          alt={`${story.title} - ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Darker top gradient overlay without blur */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/95 via-black/75 to-transparent z-10"></div>

      {/* Progress bars */}
      <div className="flex gap-1 px-4 pt-4 z-20 relative">
        {story.images.map((_, index) => (
          <div 
            key={index}
            className="h-1 bg-gray-700 rounded-full flex-1 overflow-hidden"
          >
            <div 
              className="h-full bg-white"
              style={{ width: `${progress[index]}%` }}
            />
          </div>
        ))}
      </div>

      {/* Pause indicator */}
      {isPaused && !isDragging && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 text-white text-lg px-6 py-3 bg-black/80 rounded-full flex items-center gap-2">
          <span className="text-2xl">⏸️</span>
          <span className="text-sm">Tap to resume</span>
        </div>
      )}

      {/* Close button - moved lower to avoid conflict with progress bar */}
      <button 
        onClick={() => {
          hapticSelection();
          onClose();
        }}
        className="absolute top-12 right-4 z-20 text-white p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
      >
        <X size={24} />
      </button>
      
      {/* Story indicator - positioned at the bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-white text-xs px-3 py-1 bg-black/50 rounded-full">
        {currentImageIndex + 1} / {story.images.length}
      </div>
    </div>
  );
};

export default StoryViewer; 