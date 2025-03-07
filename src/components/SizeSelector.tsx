
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface SizeSelectorProps {
  sizes: string[];
  onChange: (size: string) => void;
  className?: string;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  onChange,
  className,
}) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes.length > 0 ? sizes[0] : null);

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    onChange(size);
  };

  return (
    <div className={cn('w-full', className)}>
      <h3 className="text-sm font-medium text-gray-700 mb-2">Select Size</h3>
      
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            className={cn(
              'px-4 py-2 rounded-full border transition-all duration-200',
              selectedSize === size
                ? 'border-telegram-blue bg-telegram-light text-telegram-blue'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            )}
            onClick={() => handleSizeChange(size)}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeSelector;
