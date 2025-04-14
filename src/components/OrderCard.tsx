import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface OrderItem {
  id: number;
  type: 'stock' | 'preorder';
  sku: string | null;
  item_name: string | null;
  size: string;
  price_cny: string;
  price_rub: string;
  status: string;
  dewu_url: string | null;
  shipping_type: string | null;
  category_type: string | null;
  weight_category: string | null;
  color_code: string | null;
  quantity: number;
}

interface OrderPromocode {
  promocode_text: string;
  discount_fixed: number | null;
  discount_percent: string | null;
}

interface Order {
  order_id: number;
  created_at: string;
  items: OrderItem[];
  prepay_amount: string;
  status: string;
  promocode: OrderPromocode | null;
  subtotal: string;
  final_price: string;
  discount_amount: string;
  dd_coins_used: string;
  delivery_type: string;
  delivery_price: string;
  delivery_address: string | null;
  delivery_info: string | null;
  delivery_code: string | null;
}

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'доставлен':
        return 'bg-green-500';
      case 'awaiting manager':
      case 'ожидает менеджера':
        return 'bg-yellow-500';
      case 'awaiting purchase':
      case 'ожидает покупки':
        return 'bg-blue-500';
      case 'cancelled':
      case 'отменён':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const translateStatus = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'Доставлен';
      case 'awaiting manager':
        return 'Ожидает менеджера';
      case 'awaiting purchase':
        return 'Ожидает покупки';
      case 'cancelled':
        return 'Отменён';
      default:
        return status;
    }
  };

  const formatPrice = (price: string | number | null): string => {
    if (!price) return '0';
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numericPrice.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getItemsCountText = (count: number): string => {
    // Rules for Russian pluralization
    if (count % 10 === 1 && count % 100 !== 11) {
      return 'товар';
    } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
      return 'товара';
    } else {
      return 'товаров';
    }
  };

  return (
    <div className="bg-white dark:bg-sidebar-accent rounded-lg shadow-sm overflow-hidden">
      {/* Order Summary - Always Visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-sidebar-primary/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Заказ #{order.order_id}</h3>
              <Badge className={`${getStatusColor(order.status)} text-white`}>
                {translateStatus(order.status)}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {formatDate(order.created_at)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {order.items.length} {getItemsCountText(order.items.length)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium text-lg">₽{formatPrice(order.final_price)}</p>
            {order.promocode && (
              <p className="text-sm text-telegram-blue">
                {order.promocode.promocode_text}
              </p>
            )}
            <button 
              className="mt-2 text-telegram-blue hover:text-telegram-dark transition-colors"
              aria-label={isExpanded ? 'Свернуть детали' : 'Развернуть детали'}
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Order Details - Expandable */}
      {isExpanded && (
        <div className="border-t border-gray-100 dark:border-gray-800/50">
          <div className="p-4 space-y-4">
            {/* Order Items */}
            {order.items.map((item, index) => (
              <div 
                key={`item-${index}-${item.id}`} 
                className="border-b dark:border-gray-700 pb-3 last:border-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-1">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {item.type === 'stock' ? 'Сток' : 'Предзаказ'}
                      </Badge>
                      {item.status && (
                        <Badge className={`${getStatusColor(item.status)} text-white`}>
                          {translateStatus(item.status)}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="font-medium">
                      {item.item_name || (item.dewu_url ? (
                        <a 
                          href={item.dewu_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-telegram-blue hover:underline flex items-center"
                        >
                          {item.dewu_url.substring(0, 30)}{item.dewu_url.length > 30 ? '...' : ''}
                          <ExternalLink size={14} className="ml-1" />
                        </a>
                      ) : 'Товар')}
                    </p>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Размер: {item.size} {item.quantity > 1 && `× ${item.quantity}`}
                    </p>
                    
                    {item.price_cny && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Цена (юани): ¥{formatPrice(item.price_cny)}
                      </p>
                    )}
                    
                    {item.sku && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Артикул: {item.sku}
                      </p>
                    )}
                    
                    {item.shipping_type && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Тип доставки: {item.shipping_type}
                      </p>
                    )}
                    
                    {item.category_type && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Категория: {item.category_type}
                      </p>
                    )}
                    
                    {item.weight_category && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Вес: {item.weight_category}
                      </p>
                    )}
                    
                    {item.color_code && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>Цвет:</span>
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300" 
                          style={{ backgroundColor: item.color_code }}
                        ></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium">₽{formatPrice(item.price_rub)}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Order Summary */}
            <div className="pt-3 border-t dark:border-gray-700">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Сумма товаров</span>
                <span>₽{formatPrice(order.subtotal)}</span>
              </div>

              {order.delivery_code && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Доставка: {order.delivery_code}
                  </span>
                  <span>
                    {order.delivery_price === "0" ? 
                      "Бесплатно" : 
                      `₽${formatPrice(order.delivery_price)}`}
                  </span>
                </div>
              )}

              {order.promocode && (
                <div className="flex justify-between text-sm text-telegram-blue mb-1">
                  <span>
                    Промокод: {order.promocode.promocode_text}
                    {order.promocode.discount_percent && order.promocode.discount_percent !== 'null' && 
                      ` (-${order.promocode.discount_percent}%)`}
                    {order.promocode.discount_fixed && 
                      ` (-${order.promocode.discount_fixed}₽)`}
                  </span>
                  <span>-₽{formatPrice(order.discount_amount)}</span>
                </div>
              )}

              {order.discount_amount && order.discount_amount !== "0" && !order.promocode && (
                <div className="flex justify-between text-sm text-telegram-blue mb-1">
                  <span>Скидка</span>
                  <span>-₽{formatPrice(order.discount_amount)}</span>
                </div>
              )}

              {order.dd_coins_used && order.dd_coins_used !== "0" && (
                <div className="flex justify-between text-sm text-yellow-500 mb-1">
                  <span>Использовано DD Коинов</span>
                  <span>-₽{formatPrice(order.dd_coins_used)}</span>
                </div>
              )}

              {order.prepay_amount && order.prepay_amount !== "0" && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Предоплата</span>
                  <span>₽{formatPrice(order.prepay_amount)}</span>
                </div>
              )}

              <div className="flex justify-between font-medium text-base mt-2">
                <span>Итого</span>
                <span>₽{formatPrice(order.final_price)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard; 