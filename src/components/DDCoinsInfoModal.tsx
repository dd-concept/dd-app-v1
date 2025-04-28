import React from 'react';
import { X } from 'lucide-react';

interface DDCoinsInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DDCoinsInfoModal: React.FC<DDCoinsInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-5 pb-20 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[85vh] my-4 overflow-hidden">
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-end pt-2 px-3 pb-2">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 pt-0 pb-6 overflow-y-auto max-h-[calc(85vh-40px)]">
          <h2 className="text-xl font-bold text-telegram-button mb-3">О DD Coins</h2>
          
          <div className="space-y-3">
            {/* How to use DD section */}
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold">Как использовать $DD?</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Вы можете оплачивать покупки в нашем приложении с помощью $DD!
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Покрывайте до <span className="font-bold">50%</span> от общей стоимости заказа.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                1 $DD = 1 рубль.
              </p>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2"></div>
            
            {/* How to earn DD section */}
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold">Как заработать $DD?</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li><span className="font-bold">500 $DD</span> — за первый вход в приложение.</li>
                <li><span className="font-bold">500 $DD</span> — за каждого друга, который зарегистрируется и сделает первый заказ.</li>
              </ul>
              <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                *$DD за друга начисляются после его первой покупки.
              </p>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2"></div>
            
            {/* Bonuses section */}
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold">Бонусы и ивенты</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Следите за нашим <a 
                  href="https://t.me/dd_concept" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-telegram-button font-bold hover:underline"
                >
                  Telegram-каналом
                </a> — совсем скоро там появятся ивенты, где можно будет зарабатывать ещё больше $DD за участие в активностях!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DDCoinsInfoModal; 