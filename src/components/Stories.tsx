import React from 'react';
import Story from './Story';

export interface StoryContent {
  id: string;
  images: string[];
  title: string;
  previewImage: string;
  viewed?: boolean;
}

interface StoriesProps {
  stories: StoryContent[];
  onStoryClick: (storyId: string) => void;
  className?: string;
}

const Stories: React.FC<StoriesProps> = ({ stories, onStoryClick, className = '' }) => {
  if (!stories || stories.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex overflow-x-auto gap-5 no-scrollbar">
        {stories.map((story) => (
          <Story
            key={story.id}
            previewImage={story.previewImage}
            title={story.title}
            viewed={story.viewed}
            onClick={() => onStoryClick(story.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Stories; 