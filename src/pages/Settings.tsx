import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Sun, Check, Bell } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { getClientInfo, updateClientInfo } from '@/services/api/clientService';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { telegramUser } = useUser();
  const useScrollToTopHook = useScrollToTop();
  
  // Form state
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [mailingFlg, setMailingFlg] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [isResetting, setIsResetting] = useState<boolean>(false);
  
  // Load user data from API
  useEffect(() => {
    const loadClientInfo = async () => {
      setIsLoading(true);
      try {
        const clientInfo = await getClientInfo();
        if (clientInfo) {
          setEmail(clientInfo.email || '');
          setPhone(clientInfo.phone_number || '');
          setAddress(clientInfo.address || '');
          // If mailing_flg exists in the response, use it, otherwise default to true
          setMailingFlg(clientInfo.mailing_flg !== undefined ? clientInfo.mailing_flg : true);
        }
      } catch (error) {
        console.error('Error loading client info:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadClientInfo();
  }, []);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Email validation
      if (!email.trim()) {
        toast.error('Пожалуйста, введите ваш email');
        setIsSubmitting(false);
        return;
      }
      
      // Phone validation
      if (!phone.trim()) {
        toast.error('Пожалуйста, введите ваш номер телефона');
        setIsSubmitting(false);
        return;
      }
      
      // Address validation
      if (!address.trim()) {
        toast.error('Пожалуйста, введите ваш адрес');
        setIsSubmitting(false);
        return;
      }
      
      // Call the API to update client info
      const success = await updateClientInfo(phone, email, address, mailingFlg);
      
      if (success) {
        // Return to profile page
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Ошибка сохранения настроек. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleThemeChange = (theme: 'light' | 'dark') => {
    setIsSaving(true);
    setCurrentTheme(theme);
    // Implement theme change logic here
    setIsSaving(false);
  };
  
  const handleResetSettings = () => {
    setIsResetting(true);
    // Implement reset settings logic here
    setIsResetting(false);
  };
  
  return (
    <PageLayout>
      <div className="p-4">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/profile')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-xl font-semibold">Настройки</h1>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Адрес электронной почты *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-telegram-blue focus:border-telegram-blue dark:bg-gray-800"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Номер телефона *
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-telegram-blue focus:border-telegram-blue dark:bg-gray-800"
                placeholder="+7 (999) 123-4567"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Адрес *
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-telegram-blue focus:border-telegram-blue dark:bg-gray-800"
                placeholder="Ваш полный адрес"
                rows={3}
                required
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-gray-600 dark:text-gray-400" />
                  <label htmlFor="mailing" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Получать уведомления
                  </label>
                </div>
                <button
                  type="button"
                  id="mailing"
                  onClick={() => setMailingFlg(!mailingFlg)}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-telegram-blue focus:ring-offset-2 ${
                    mailingFlg ? 'bg-telegram-blue' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                      mailingFlg ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-telegram-blue text-white py-2 px-4 rounded-md hover:bg-telegram-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="xs" inline className="mr-2" />
                  Сохраняем...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Сохранить
                </>
              )}
            </button>
          </form>
        )}

        {isSaving && (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="md" />
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Settings; 