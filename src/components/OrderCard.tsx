import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Order as ApiOrder, OrderItem as ApiOrderItem, OrderPromocode } from '@/services/api/types';

// Extended Order interface that requires delivery properties
interface Order extends ApiOrder {
  delivery_type: string;
  delivery_price: string;
  delivery_address: string | null;
  delivery_info: string | null;
  delivery_code: string | null;
}

// Extended OrderItem interface that requires additional properties
interface OrderItem extends ApiOrderItem {
  id: number;
  type: 'stock' | 'preorder';
  status: string;
  dewu_url: string | null;
  shipping_type: string | null;
  category_type: string | null;
  weight_category: string | null;
  color_code: string | null;
}

interface OrderCardProps {
  order: ApiOrder;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle potentially missing properties
  const normalizedOrder: Order = {
    ...order,
    delivery_type: order.delivery_type || '',
    delivery_price: order.delivery_price || '0',
    delivery_address: order.delivery_address || null,
    delivery_info: order.delivery_info || null,
    delivery_code: order.delivery_code || null,
    items: order.items.map(item => ({
      ...item,
      id: typeof item.id === 'number' ? item.id : 0,
      type: (item.type as 'stock' | 'preorder') || 'stock',
      status: item.status || order.status || '',
      dewu_url: item.dewu_url || null,
      shipping_type: item.shipping_type || null,
      category_type: item.category_type || null,
      weight_category: item.weight_category || null,
      color_code: item.color_code || null,
      sku: item.sku || null,
      item_name: item.item_name || null,
      size: item.size || '',
      price_cny: item.price_cny || null,
      price_rub: item.price_rub || null,
      sale_price: item.sale_price || null,
      quantity: item.quantity || 1
    })) as OrderItem[]
  };

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
              <h3 className="text-lg font-medium">Заказ #{normalizedOrder.order_id}</h3>
              <Badge className={`${getStatusColor(normalizedOrder.status)} text-white`}>
                {translateStatus(normalizedOrder.status)}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {formatDate(normalizedOrder.created_at)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {normalizedOrder.items.length} {getItemsCountText(normalizedOrder.items.length)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium text-lg">₽{formatPrice(normalizedOrder.final_price)}</p>
            {normalizedOrder.promocode && (
              <p className="text-sm text-telegram-blue">
                {normalizedOrder.promocode.promocode_text}
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
            {normalizedOrder.items.map((item, index) => (
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
                    
                    {item.type === 'preorder' && item.price_cny && (
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
                <span>₽{formatPrice(normalizedOrder.subtotal)}</span>
              </div>

              {normalizedOrder.delivery_code && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Доставка: {normalizedOrder.delivery_code}
                  </span>
                  <span>
                    {normalizedOrder.delivery_price === "0" ? 
                      "Бесплатно" : 
                      `₽${formatPrice(normalizedOrder.delivery_price)}`}
                  </span>
                </div>
              )}

              {normalizedOrder.promocode && (
                <div className="flex justify-between text-sm text-telegram-blue mb-1">
                  <span>
                    Промокод: {normalizedOrder.promocode.promocode_text}
                    {normalizedOrder.promocode.discount_percent && normalizedOrder.promocode.discount_percent !== 'null' && 
                      ` (-${normalizedOrder.promocode.discount_percent}%)`}
                    {normalizedOrder.promocode.discount_fixed && 
                      ` (-${normalizedOrder.promocode.discount_fixed}₽)`}
                  </span>
                  <span>-₽{formatPrice(normalizedOrder.discount_amount)}</span>
                </div>
              )}

              {normalizedOrder.discount_amount && normalizedOrder.discount_amount !== "0" && !normalizedOrder.promocode && (
                <div className="flex justify-between text-sm text-telegram-blue mb-1">
                  <span>Скидка</span>
                  <span>-₽{formatPrice(normalizedOrder.discount_amount)}</span>
                </div>
              )}

              {normalizedOrder.dd_coins_used && normalizedOrder.dd_coins_used !== "0" && (
                <div className="flex justify-between text-sm text-yellow-500 mb-1">
                  <span>Использовано DD Коинов</span>
                  <span>-₽{formatPrice(normalizedOrder.dd_coins_used)}</span>
                </div>
              )}

              {normalizedOrder.prepay_amount && normalizedOrder.prepay_amount !== "0" && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Предоплата</span>
                  <span>₽{formatPrice(normalizedOrder.prepay_amount)}</span>
                </div>
              )}

              <div className="flex justify-between font-medium text-base mt-2">
                <span>Итого</span>
                <span>₽{formatPrice(normalizedOrder.final_price)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard; 