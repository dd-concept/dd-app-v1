
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order } from '@/services/api';

interface OrderHistoryItemProps {
  order: Order;
  className?: string;
}

const OrderHistoryItem: React.FC<OrderHistoryItemProps> = ({
  order,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Map status to color
  const getStatusStyles = (status: string) => {
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
        'border rounded-lg overflow-hidden transition-all duration-300',
        isExpanded ? 'shadow-md' : 'shadow-sm',
        className
      )}
    >
      {/* Order header */}
      <div 
        className="p-4 bg-white flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-medium">Order #{order.id}</h3>
            <span className={cn(
              'text-xs px-2 py-1 rounded-full font-medium capitalize',
              getStatusStyles(order.status)
            )}>
              {order.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{formatDate(order.date)}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="font-medium">${order.totalAmount.toFixed(2)}</span>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      {/* Order details */}
      {isExpanded && (
        <div className="p-4 bg-gray-50 border-t animate-slide-down">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items</h4>
          
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <div className="text-gray-500 text-xs">
                    {item.color} • Size {item.size} • Qty: {item.quantity}
                  </div>
                </div>
                <span>${item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t flex justify-between">
            <span className="font-medium">Total</span>
            <span className="font-medium">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryItem;
