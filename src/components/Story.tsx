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
  // Format the title to handle newlines
  const formattedTitle = title.split('\n').map((line, index, array) => (
    <React.Fragment key={index}>
      {line}
      {index < array.length - 1 && <br />}
    </React.Fragment>
  ));

  return (
    <div className="flex flex-col items-center" onClick={onClick}>
      <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${viewed ? 'border-gray-300' : 'border-telegram-blue'} cursor-pointer`}>
        <img 
          src={previewImage} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="text-xs text-center w-16 mt-1 leading-tight">
        {formattedTitle}
      </div>
    </div>
  );
};

export default Story; 