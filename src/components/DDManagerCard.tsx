import React from 'react';
import { ArrowRight } from 'lucide-react';

const DDManagerCard: React.FC = () => {
  return (
    <a 
      href="https://t.me/dd_helper" 
      target="_blank" 
      rel="noopener noreferrer"
      style={{
        backgroundColor: '#FFFFFF',
        color: '#000000',
        borderRadius: '0.75rem',
        padding: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
      className="transform hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 style={{ fontWeight: 500, color: '#000000' }}>DD MANAGER</h3>
          <p style={{ fontSize: '0.75rem', color: '#666666' }}>Поможет определиться с цветом и размером</p>
        </div>
        <div className="flex justify-end mt-1">
          <ArrowRight size={20} style={{ color: '#666666' }} />
        </div>
      </div>
    </a>
  );
};

export default DDManagerCard; 