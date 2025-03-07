
import React from 'react';
import { cn } from '@/lib/utils';
import { Order } from '@/services/api';

export interface OrderHistoryItemProps {
  order: Order;
  className?: string;
  animationDelay?: string;
}

const OrderHistoryItem: React.FC<OrderHistoryItemProps> = ({ 
  order, 
  className,
  animationDelay 
}) => {
  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className={cn(
        'bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 animate-fade-in',
        className
      )}
      style={animationDelay ? { animationDelay } : {}}
    >
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">Order #{order.order_id}</span>
            <h3 className="font-medium">{formatDate(order.order_date)}</h3>
          </div>
          <div>
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              getStatusColor(order.status)
            )}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <div>
                <span className="font-medium">{item.item_name}</span>
                <p className="text-gray-500">
                  {item.color_code}, {item.size}
                </p>
              </div>
              <span className="font-medium">₽{item.price_rub.toFixed(0)}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between font-medium">
          <span>Total:</span>
          <span className="text-telegram-blue">₽{order.total_amount.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryItem;
