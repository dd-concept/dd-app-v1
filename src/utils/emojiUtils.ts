
// List of emojis that can be used as avatars
const avatarEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
];

// List of emojis that can be used as product placeholders
const productEmojis = [
  '👕', '👚', '👔', '👗', '👖', '🧥', '🧦', '👟', '👞', '🧢',
  '👒', '🎩', '🧣', '🧤', '👜', '👝', '👛', '👓', '🕶️', '🥾',
  '🥿', '🌂', '☂️', '💼', '🎒', '👑', '💄', '💍', '💎', '⌚',
  '🧸', '🔮', '🧩', '🧶', '🧵', '🔭', '🧬', '🔬', '🧪', '📱',
  '💻', '🖥️', '🖱️', '🖨️', '📷', '🎮', '🎧', '🎵', '📚', '✏️',
];

// List of emojis for banners
const bannerEmojis = [
  '🎉', '🎊', '🎁', '🎈', '🎀', '🎐', '🎇', '🎆', '✨', '🔥',
  '💫', '⭐', '🌟', '💥', '💯', '💢', '💦', '💤', '💨', '🕊️',
  '💝', '💖', '💗', '💓', '💞', '💕', '❤️', '🧡', '💛', '💚',
];

/**
 * Generates a random emoji from the avatar emoji list
 * @returns a random avatar emoji
 */
export const getRandomAvatarEmoji = (): string => {
  const randomIndex = Math.floor(Math.random() * avatarEmojis.length);
  return avatarEmojis[randomIndex];
};

/**
 * Generates a random emoji from the product emoji list
 * @returns a random product emoji
 */
export const getRandomProductEmoji = (): string => {
  const randomIndex = Math.floor(Math.random() * productEmojis.length);
  return productEmojis[randomIndex];
};

/**
 * Generates a random emoji from the banner emoji list
 * @returns a random banner emoji
 */
export const getRandomBannerEmoji = (): string => {
  const randomIndex = Math.floor(Math.random() * bannerEmojis.length);
  return bannerEmojis[randomIndex];
};

/**
 * Generates a consistent emoji based on a string input
 * @param input String to generate emoji from
 * @returns emoji
 */
export const getConsistentEmoji = (input: string, type: 'avatar' | 'product' | 'banner'): string => {
  // Simple hash function for the input string
  const hash = Array.from(input).reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  // Get the appropriate emoji list
  const emojiList = type === 'avatar' 
    ? avatarEmojis 
    : type === 'product' 
      ? productEmojis 
      : bannerEmojis;
  
  // Use the hash to get a consistent index
  const index = hash % emojiList.length;
  
  return emojiList[index];
};
