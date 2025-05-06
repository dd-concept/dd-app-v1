import React from 'react';
import { ArrowRight } from 'lucide-react';
import managerBg from '@/assets/manager_banner.webp';

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
        <h3 className="text-xl font-medium text-black/80">DD MANAGER</h3>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-xs text-black/50">Поможет определиться с цветом и размером</p>
        {/* <ArrowRight size={20} className="text-white" /> */}
      </div>
      <div className="flex justify-end mt-1">
              <ArrowRight size={20} className="text-white" />
      </div>
    </a>
  );
};

export default DDManagerCard; 