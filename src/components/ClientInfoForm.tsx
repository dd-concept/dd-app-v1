import React, { useState, useEffect } from 'react';
import { updateClientInfo, getClientInfo } from '@/services/api/clientService';
import { Loader2 } from 'lucide-react';
import { fetchDeliveryTypes } from '@/services/api/orderService';
import { DeliveryRate } from '@/services/api/types';
import { toast } from 'sonner';

interface DeliveryType {
  id: number;
  delivery_type: string;
  price_rub: number;
  delivery_info: string;
  delivery_code: string;
}

interface ClientInfoFormProps {
  initialEmail?: string;
  initialPhone?: string;
  initialAddress?: string;
  clientInfo?: { email: string; phone_number: string; address: string } | null;
  onComplete: (deliveryRate?: DeliveryRate) => void;
  onCancel?: () => void;
}

const ClientInfoForm: React.FC<ClientInfoFormProps> = ({
  initialEmail = '',
  initialPhone = '',
  initialAddress = '',
  clientInfo = null,
  onComplete,
  onCancel
}) => {
  // Use client info if provided, otherwise use initial values
  const [email, setEmail] = useState<string>(clientInfo?.email || initialEmail);
  const [phone, setPhone] = useState<string>(clientInfo?.phone_number || initialPhone);
  const [address, setAddress] = useState<string>(clientInfo?.address || initialAddress);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deliveryTypes, setDeliveryTypes] = useState<DeliveryType[]>([]);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<string>('');
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(false);
  
  // Determine if all required fields are already filled
  const hasAllRequiredInfo = Boolean(email && phone && address);

  // Fetch delivery types on component mount
  useEffect(() => {
    const fetchDeliveryOptions = async () => {
      setIsLoadingRates(true);
      try {
        const types = await fetchDeliveryTypes();
        setDeliveryTypes(types);
        
        // Set default delivery type if available
        if (types.length > 0) {
          const courierType = types.find(type => type.delivery_type === 'courier');
          const shippingType = types.find(type => type.delivery_type === 'shipping');
          const defaultType = courierType || shippingType || types[0];
          setSelectedDeliveryType(defaultType.delivery_type);
        }
      } catch (error) {
        console.error('Failed to load delivery types:', error);
      } finally {
        setIsLoadingRates(false);
      }
    };
    
    // Fetch client info if not provided
    const fetchClientInfo = async () => {
      if (!clientInfo) {
        try {
          const info = await getClientInfo();
          if (info) {
            setEmail(info.email || '');
            setPhone(info.phone_number || '');
            setAddress(info.address || '');
          }
        } catch (error) {
          console.error('Error fetching client info:', error);
        }
      }
    };
    
    fetchDeliveryOptions();
    fetchClientInfo();
  }, [clientInfo]);

  // Get the selected delivery type object
  const selectedDeliveryOption = deliveryTypes.find(type => type.delivery_type === selectedDeliveryType);
  // Convert to DeliveryRate format for compatibility with existing code
  const selectedDeliveryRate: DeliveryRate | undefined = selectedDeliveryOption ? {
    delivery_type: selectedDeliveryOption.delivery_type,
    price_rub: selectedDeliveryOption.price_rub
  } : undefined;
  
  const isSelfPickup = selectedDeliveryType === 'self_pickup';
  
  // Store the original user address
  const [userAddress, setUserAddress] = useState<string>('');

  // Update user address when it changes
  useEffect(() => {
    const initialAddr = clientInfo?.address || initialAddress;
    if (initialAddr) {
      setUserAddress(initialAddr);
    }
  }, [initialAddress, clientInfo]);

  // Set displayed address to the store address if self pickup is selected
  useEffect(() => {
    if (isSelfPickup) {
      setAddress('Москва, Ильменский проезд, 14к8');
    } else {
      setAddress(userAddress);
    }
  }, [isSelfPickup, userAddress]);

  // Update the user address when typing in the address field (only when not self-pickup)
  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    if (!isSelfPickup) {
      setUserAddress(newAddress);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!email || !phone || !selectedDeliveryType) {
        alert('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Always update client info with the user's actual address, not the pickup address
      const addressToStore = isSelfPickup ? userAddress : address;
      
      // Always update client info before proceeding with order
      const success = await updateClientInfo(phone, email, addressToStore);

      if (success) {
        // alert("Setting delivery type to " + selectedDeliveryRate?.delivery_type);
        onComplete(selectedDeliveryRate);
      } else {
        toast.error('Failed to update client information');
      }
    } catch (error) {
      console.error('Error updating client info:', error);
      toast.error('Failed to update client information');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-sidebar-accent rounded-lg shadow-lg max-w-md w-full my-8">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold">Заполните свои данные</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {hasAllRequiredInfo ? 'Пожалуйста, проверьте свои контактные данные.' : 'Нам нужны ваши контактные данные для обработки заказа.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Электронная почта <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded dark:bg-sidebar-primary"
              placeholder="ваша@почта.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Номер телефона <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded dark:bg-sidebar-primary"
              placeholder="+7 (999) 123-4567"
              required
            />
          </div>

          {/* Delivery Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Способ доставки <span className="text-red-500">*</span>
            </label>
            {isLoadingRates ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Загрузка вариантов доставки...</span>
              </div>
            ) : deliveryTypes.length === 0 ? (
              <div className="text-red-500">
                Ошибка загрузки вариантов доставки. Пожалуйста, попробуйте позже.
              </div>
            ) : (
              <div className="grid gap-2">
                {deliveryTypes.map(type => (
                  <div 
                    key={type.delivery_type}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDeliveryType === type.delivery_type
                        ? 'border-telegram-blue bg-telegram-blue/10'
                        : 'border-gray-300 dark:border-gray-700'
                    }`}
                    onClick={() => setSelectedDeliveryType(type.delivery_type)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{type.delivery_code}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {type.delivery_info}
                        </div>
                      </div>
                      <div className="text-telegram-blue font-medium">
                        {type.price_rub > 0 ? `₽${type.price_rub}` : 'Бесплатно'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Адрес доставки {(selectedDeliveryType === 'courier' || selectedDeliveryType === 'shipping') && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={address}
              onChange={handleAddressChange}
              className={`w-full p-2 border rounded resize-none h-24 ${
                isSelfPickup ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-sidebar-primary'
              } dark:border-gray-700`}
              placeholder="Укажите ваш полный адрес"
              disabled={isSelfPickup}
              required={selectedDeliveryType === 'courier' || selectedDeliveryType === 'shipping'}
            />
            {isSelfPickup && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                При самовывозе заказ можно забрать по указанному адресу
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t dark:border-gray-700">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                disabled={isSubmitting}
              >
                Отмена
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-telegram-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              disabled={isSubmitting || (!email || !phone || (isLoadingRates || !selectedDeliveryType) || ((selectedDeliveryType === 'courier' || selectedDeliveryType === 'shipping') && !address))}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                'Продолжить'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientInfoForm; 