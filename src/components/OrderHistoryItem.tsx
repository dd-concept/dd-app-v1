import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChevronRight, ChevronDown, ChevronUp, Package } from 'lucide-react';
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Format the date
  const formattedDate = format(new Date(order.created_at || new Date()), 'MMM d, yyyy');
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'awaiting_manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
    }
  };

  // Calculate the total amount from the items prices instead of prepay_amount
  const totalAmount = order.items.reduce((sum, item) => sum + parseFloat(item.price_rub), 0);

  // Helper to safely format prices
  const formatPrice = (price: string | number | undefined): string => {
    if (typeof price === 'string') {
      return parseFloat(price).toLocaleString();
    }
    if (typeof price === 'number') {
      return price.toLocaleString();
    }
    return '0';
  };
    
  // Toggle details view
  const toggleDetails = () => {
    setDetailsOpen(!detailsOpen);
  };

  return (
    <div 
      className={cn(
        'bg-white dark:bg-sidebar-accent/70 rounded-lg shadow-sm overflow-hidden',
        className
      )}
      style={animationDelay ? { animationDelay } : undefined}
    >
      <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800/50">
        <div>
          <h3 className="font-medium">Order #{order.order_id}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'px-2 py-1 text-xs rounded-full',
            getStatusColor(order.status)
          )}>
            {order.status === 'awaiting_manager' 
              ? 'Awaiting Manager' 
              : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          <span className="font-medium">₽{totalAmount.toLocaleString()}</span>
        </div>
      </div>
      
      <button 
        className="w-full py-2 px-4 flex justify-between items-center bg-gray-50 dark:bg-sidebar-primary/20 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-sidebar-primary/30 transition-colors"
        onClick={toggleDetails}
      >
        <span>Order Details</span>
        {detailsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      
      {detailsOpen && (
        <div className="p-4 bg-gray-50 dark:bg-sidebar-primary/10 border-t border-gray-100 dark:border-gray-800/20">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Items</h4>
              <div className="divide-y divide-gray-100 dark:divide-gray-800/20">
                {order.items.map((item, index) => (
                  <div key={`detail-${index}`} className="py-3 flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3">
                      <Package size={18} className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-gray-800 dark:text-gray-200">{item.item_name}</span>
                        <span className="font-medium">₽{formatPrice(item.price_rub)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <span><strong>Size:</strong> {item.size}</span>
                        <span><strong>SKU:</strong> {item.sku}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Order Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span>₽{order.items.reduce((sum, item) => sum + parseFloat(item.price_rub), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                  <span>₽0</span>
                </div>
                <div className="flex justify-between font-medium pt-1 border-t border-gray-200 dark:border-gray-700 mt-1">
                  <span>Total:</span>
                  <span>₽{order.items.reduce((sum, item) => sum + parseFloat(item.price_rub), 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryItem;
