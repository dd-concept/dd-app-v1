import React, { useState, useEffect } from 'react';
import { updateClientInfo, getClientInfo } from '@/services/api/clientService';
import { Loader2 } from 'lucide-react';
import { getDeliveryRates } from '@/services/api/userService';
import { DeliveryRate } from '@/services/api/types';
import { toast } from 'sonner';

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
  const [deliveryRates, setDeliveryRates] = useState<DeliveryRate[]>([]);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<string>('');
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(false);
  
  // Determine if all required fields are already filled
  const hasAllRequiredInfo = Boolean(email && phone && address);

  // Fetch delivery rates on component mount
  useEffect(() => {
    const fetchDeliveryRates = async () => {
      setIsLoadingRates(true);
      try {
        const rates = await getDeliveryRates();
        setDeliveryRates(rates);
        
        // Set default rate if available (prefer courier, then shipping, then self_pickup)
        if (rates.length > 0) {
          const courierRate = rates.find(rate => rate.delivery_type === 'courier');
          const shippingRate = rates.find(rate => rate.delivery_type === 'shipping');
          const defaultRate = courierRate || shippingRate || rates[0];
          setSelectedDeliveryType(defaultRate.delivery_type);
        }
      } catch (error) {
        console.error('Failed to load delivery rates:', error);
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
    
    fetchDeliveryRates();
    fetchClientInfo();
  }, [clientInfo]);

  // Get the selected delivery rate object
  const selectedDeliveryRate = deliveryRates.find(rate => rate.delivery_type === selectedDeliveryType);
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

  // Helper function to get a user-friendly name for delivery type
  const getDeliveryTypeName = (type: string): string => {
    switch (type) {
      case 'self_pickup':
        return 'Self Pickup';
      case 'courier':
        return 'Courier Delivery';
      case 'shipping':
        return 'Shipping';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
    }
  };

  // Helper function to get a description for delivery type
  const getDeliveryTypeDescription = (type: string): string => {
    switch (type) {
      case 'self_pickup':
        return 'Pick up your order from our store';
      case 'courier':
        return 'Delivery to your address by courier';
      case 'shipping':
        return 'Delivery via postal service';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-sidebar-accent rounded-lg shadow-lg max-w-md w-full my-8">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold">Complete Your Information</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {hasAllRequiredInfo ? 'Please review your contact information or select continue.' : 'We need your contact information to process your order.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded dark:bg-sidebar-primary"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Phone Number <span className="text-red-500">*</span>
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
              Delivery Method <span className="text-red-500">*</span>
            </label>
            {isLoadingRates ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading delivery options...</span>
              </div>
            ) : deliveryRates.length === 0 ? (
              <div className="text-red-500">
                Error loading delivery options. Please try again later.
              </div>
            ) : (
              <div className="grid gap-2">
                {deliveryRates.map(rate => (
                  <div 
                    key={rate.delivery_type}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDeliveryType === rate.delivery_type
                        ? 'border-telegram-blue bg-telegram-blue/10'
                        : 'border-gray-300 dark:border-gray-700'
                    }`}
                    onClick={() => setSelectedDeliveryType(rate.delivery_type)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{getDeliveryTypeName(rate.delivery_type)}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {getDeliveryTypeDescription(rate.delivery_type)}
                        </div>
                      </div>
                      <div className="text-telegram-blue font-medium">
                        {rate.price_rub > 0 ? `₽${rate.price_rub}` : 'Free'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Only show editable address field for non-pickup options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {isSelfPickup ? 'Pickup Address' : 'Shipping Address'} <span className="text-red-500">*</span>
            </label>
            {isSelfPickup ? (
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                Москва, Ильменский проезд, 14к8
              </div>
            ) : (
              <textarea
                value={address}
                onChange={handleAddressChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded dark:bg-sidebar-primary"
                rows={3}
                placeholder="Your full shipping address"
                required
              />
            )}
          </div>

          <div className="flex gap-3 mt-6 pb-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded text-gray-700 dark:text-gray-300"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-1 p-2 bg-telegram-blue text-white rounded flex items-center justify-center"
              disabled={isSubmitting || isLoadingRates}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Order!'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientInfoForm; 