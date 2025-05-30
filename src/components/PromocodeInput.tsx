import React, { useState } from 'react';
import { validatePromocode, calculateDiscountedPrice, Promocode } from '@/services/api/promocodeService';
import { Tag, TicketIcon } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';

interface PromocodeInputProps {
  className?: string;
  originalPrice: number;
  onPromocodeApplied: (promocode: Promocode, finalPrice: number) => void;
  onPromocodeRemoved: () => void;
  currentPromocode?: Promocode;
}

const PromocodeInput: React.FC<PromocodeInputProps> = ({
  className,
  originalPrice,
  onPromocodeApplied,
  onPromocodeRemoved,
  currentPromocode
}) => {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Пожалуйста, введите промокод');
      return;
    }

    setIsLoading(true);
    try {
      const response = await validatePromocode(code.trim());
      if (response.success && response.promocode) {
        const finalPrice = calculateDiscountedPrice(originalPrice, response.promocode);
        onPromocodeApplied(response.promocode, finalPrice);
        toast.success('Промокод успешно применен!');
      } else {
        toast.error(response.message || 'Недействительный промокод');
      }
    } catch (error) {
      console.error('Error validating promocode:', error);
      toast.error('Не удалось проверить промокод');
    } finally {
      setIsLoading(false);
    }
  };

  if (currentPromocode) {
    return (
      <div className={`flex items-center justify-between p-3 bg-telegram-secondary-bg rounded-lg ${className}`}>
        <div className="flex items-center gap-2">
          <Tag className="text-telegram-blue" size={16} />
          <span className="text-sm font-medium">{currentPromocode.promocode_text}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentPromocode.discount_fixed ? 
              `-${currentPromocode.discount_fixed}₽` : 
              currentPromocode.discount_percent && currentPromocode.discount_percent !== 'null' ? 
                `-${currentPromocode.discount_percent}%` : 
                ''
            }
          </span>
          <button
            onClick={onPromocodeRemoved}
            className="text-sm text-red-500 hover:text-red-600"
          >
            Удалить
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Введите промокод"
        className="flex-1 p-2 text-sm bg-white dark:bg-sidebar-primary/30 border border-gray-300 dark:border-gray-700 rounded-md"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !code.trim()}
        className="px-4 py-2 bg-telegram-blue text-white rounded-md disabled:opacity-70 flex items-center"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="xs" inline className="mr-2" />
            Проверка...
          </>
        ) : (
          'Применить'
        )}
      </button>
    </form>
  );
};

export default PromocodeInput; 