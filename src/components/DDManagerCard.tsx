import React from 'react';
import { ArrowRight } from 'lucide-react';
import managerBg from '@/assets/managerbg.webp';

const DDManagerCard: React.FC = () => {
  return (
    <a 
      href="https://t.me/dd_helper" 
      target="_blank" 
      rel="noopener noreferrer"
      className="bg-cover bg-center rounded-lg p-4 shadow-sm hover-lift flex flex-col justify-between transform hover:-translate-y-1 hover:shadow-md transition-all duration-300"
      style={{ backgroundImage: `url(${managerBg})` }}
    >
      <div>
        <h3 className="font-medium text-white">DD MANAGER</h3>
        <p className="text-xs text-white/80">Поможет определиться с цветом и размером</p>
      </div>
      <div className="flex justify-end mt-1">
        <ArrowRight size={20} className="text-white/70" />
      </div>
    </a>
  );
};

export default DDManagerCard; 