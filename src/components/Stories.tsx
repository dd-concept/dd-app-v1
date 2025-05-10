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
}

const Stories: React.FC<StoriesProps> = ({ stories, onStoryClick }) => {
  if (!stories || stories.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-6">
      <div className="flex overflow-x-auto gap-4 py-2 no-scrollbar">
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