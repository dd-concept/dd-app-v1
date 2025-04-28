import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Sun, Check } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { getClientInfo, updateClientInfo } from '@/services/api/clientService';
import LoadingSpinner from '@/components/LoadingSpinner';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { telegramUser } = useUser();
  
  // Form state
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
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
      const success = await updateClientInfo(phone, email, address);
      
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
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address *
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
                Phone Number *
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
                Address *
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-telegram-blue focus:border-telegram-blue dark:bg-gray-800"
                placeholder="Your full address"
                rows={3}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-telegram-blue text-white py-2 px-4 rounded-md hover:bg-telegram-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="xs" inline className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Settings
                </>
              )}
            </button>
          </form>
        )}

        {isSaving ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="md" />
          </div>
        ) : (
          <>
            <h3 className="text-lg font-medium">Изменить тему</h3>
            
            <div className="space-y-4 mt-4">
              {/* Light Theme */}
              <button
                onClick={() => handleThemeChange('light')}
                className={`w-full p-4 border rounded-lg flex items-center justify-between ${
                  currentTheme === 'light' 
                    ? 'border-telegram-blue bg-telegram-bg/10' 
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <Sun size={20} className="mr-3 text-yellow-500" />
                  <span>Светлая</span>
                </div>
                {currentTheme === 'light' && (
                  <Check className="h-5 w-5 text-telegram-blue" />
                )}
              </button>

              <button 
                className="px-4 py-2 text-white rounded"
                disabled={isResetting}
                onClick={handleResetSettings}
              >
                {isResetting ? (
                  <LoadingSpinner size="xs" inline />
                ) : (
                  'Сбросить настройки'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default Settings; 