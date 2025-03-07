
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { getRandomAvatarEmoji, getConsistentEmoji } from '@/utils/emojiUtils';

interface EmojiAvatarProps {
  emoji?: string;
  username?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  randomize?: boolean;
}

const EmojiAvatar: React.FC<EmojiAvatarProps> = ({
  emoji,
  username,
  size = 'md',
  className,
  randomize = false,
}) => {
  const [displayEmoji, setDisplayEmoji] = useState<string>(emoji || '😊');

  useEffect(() => {
    if (emoji) {
      setDisplayEmoji(emoji);
    } else if (username) {
      setDisplayEmoji(getConsistentEmoji(username, 'avatar'));
    } else if (randomize) {
      setDisplayEmoji(getRandomAvatarEmoji());
    }
  }, [emoji, username, randomize]);

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
  };

  return (
    <div 
      className={cn(
        'flex items-center justify-center rounded-full bg-telegram-light animate-pulse-slow',
        sizeClasses[size],
        className
      )}
    >
      <span className="animate-float">{displayEmoji}</span>
    </div>
  );
};

export default EmojiAvatar;
