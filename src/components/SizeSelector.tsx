import React from 'react';
import { cn } from '@/lib/utils';

interface SizeSelectorProps {
  availableSizes: string[];
  selectedSize: string;
  onChange: (size: string) => void;
  className?: string;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  availableSizes,
  selectedSize,
  onChange,
  className,
}) => {
  const handleSizeChange = (size: string) => {
    onChange(size);
  };

  return (
    <div className={cn('w-full', className)}>
      <h3 className="text-sm font-medium text-telegram-text mb-2">Выберите размер</h3>
      
      <div className="flex flex-wrap gap-2">
        {availableSizes.map((size) => (
          <button
            key={size}
            className={cn(
              'px-4 py-2 rounded-full border transition-all duration-200',
              selectedSize === size
                ? 'border-telegram-button bg-telegram-button/10 text-telegram-button'
                : 'border-telegram-hint/30 bg-telegram-bg text-telegram-text hover:border-telegram-hint/50'
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
