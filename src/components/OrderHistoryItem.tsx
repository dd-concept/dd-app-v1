
import React from 'react';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order } from '@/services/api';

interface OrderHistoryItemProps {
  order: Order;
  className?: string;
  animationDelay?: string;
}

const OrderHistoryItem: React.FC<OrderHistoryItemProps> = ({ 
  order, 
  className,
  animationDelay 
}) => {
  // Format the date
  const formattedDate = format(new Date(order.order_date), 'MMM d, yyyy');
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className={cn(
        'bg-white rounded-lg shadow-sm overflow-hidden',
        className
      )}
      style={animationDelay ? { animationDelay } : undefined}
    >
      <div className="p-4 flex justify-between items-center border-b border-gray-100">
        <div>
          <h3 className="font-medium">Order #{order.order_id}</h3>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'px-2 py-1 text-xs rounded-full',
            getStatusColor(order.status)
          )}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          <span className="font-medium">₽{order.total_amount.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="p-4">
        <h4 className="text-sm font-medium mb-2">Items</h4>
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.item_name} ({item.color_code}, {item.size})
              </span>
              <span className="font-medium">₽{item.price_rub.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
      
      <button className="w-full py-2 px-4 flex justify-between items-center bg-gray-50 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
        <span>Order Details</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default OrderHistoryItem;
