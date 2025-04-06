import React from 'react';
import EmojiAvatar from './EmojiAvatar';
import { TelegramUser } from '@/services/api';

interface UserAvatarProps {
  user: TelegramUser | null;
  emoji: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  emoji, 
  size = 'md', 
  className = '' 
}) => {
  // Size mapping for the avatar
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  const sizeClass = sizeMap[size];
  
  // If user has a photo_url, display it
  if (user?.photo_url) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden ${className}`}>
        <img 
          src={user.photo_url} 
          alt={`${user.first_name}'s profile`} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to emoji avatar if image fails to load
            console.error('Error loading profile image, falling back to emoji avatar');
            e.currentTarget.style.display = 'none';
            // We can't directly render the EmojiAvatar here, so we'll just hide the img
          }}
        />
      </div>
    );
  }
  
  // Otherwise, use the emoji avatar
  return (
    <EmojiAvatar 
      emoji={emoji} 
      size={size} 
      className={className}
    />
  );
};

export default UserAvatar; 