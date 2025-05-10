import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const storyDuration = 5000; // 5 seconds per image

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

    if (currentProgress < 100) {
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
  }, [currentImageIndex, progress, story, onStoryViewed, onClose]);

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

  // Handle click on left/right sides to navigate
  const handleScreenClick = (e: React.MouseEvent) => {
    const { clientX, currentTarget } = e;
    const { left, width } = currentTarget.getBoundingClientRect();
    const clickPosition = clientX - left;
    
    if (clickPosition < width / 3) {
      goToPrevious();
    } else if (clickPosition > (width / 3) * 2) {
      goToNext();
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Progress bars */}
      <div className="flex gap-1 px-4 pt-4 z-10">
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

      {/* Close button */}
      <button 
        onClick={() => {
          hapticSelection();
          onClose();
        }}
        className="absolute top-4 right-4 z-10 text-white p-2"
      >
        <X size={24} />
      </button>

      {/* Main content with navigation areas */}
      <div 
        className="flex-1 flex items-center justify-center"
        onClick={handleScreenClick}
      >
        <img 
          src={story.images[currentImageIndex]} 
          alt={`${story.title} - ${currentImageIndex + 1}`}
          className="max-h-full max-w-full object-contain"
        />
        
        {/* Navigation buttons */}
        {currentImageIndex > 0 && (
          <button 
            className="absolute left-4 text-white p-2 bg-black/30 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
          >
            <ChevronLeft size={24} />
          </button>
        )}
        
        {currentImageIndex < story.images.length - 1 && (
          <button 
            className="absolute right-4 text-white p-2 bg-black/30 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default StoryViewer; 