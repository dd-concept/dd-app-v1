import React from 'react';

interface StoryItemProps {
  previewImage: string;
  title: string;
  onClick: () => void;
  viewed?: boolean;
}

const Story: React.FC<StoryItemProps> = ({ 
  previewImage, 
  title, 
  onClick, 
  viewed = false 
}) => {
  return (
    <div className="flex flex-col items-center" onClick={onClick}>
      <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${viewed ? 'border-gray-300' : 'border-telegram-blue'} cursor-pointer mb-1`}>
        <img 
          src={previewImage} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      </div>
      <span className="text-xs text-center line-clamp-1 w-16">
        {title}
      </span>
    </div>
  );
};

export default Story; 