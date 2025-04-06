import { useEffect, useState } from 'react';
import { registerReferral } from '@/services/api';

/**
 * Hook to handle referral detection and registration
 */
export const useReferral = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isProcessed, setIsProcessed] = useState<boolean>(false);
  
  // On mount, check URL for referral code
  useEffect(() => {
    const detectReferralCode = () => {
      try {
        // Get current URL
        const url = new URL(window.location.href);
        
        // Check for referral code in search params
        const code = url.searchParams.get('ref');
        
        // Also check for "start" parameter with ref_ prefix (Telegram deep link format)
        const startParam = url.searchParams.get('start');
        if (startParam && startParam.startsWith('ref_')) {
          const telegramCode = startParam.substring(4); // Remove 'ref_' prefix
          if (telegramCode) {
            console.log('Referral code detected from Telegram deep link:', telegramCode);
            setReferralCode(telegramCode);
            // Remove the start parameter from the URL without refreshing the page
            url.searchParams.delete('start');
            window.history.replaceState({}, document.title, url.toString());
            return;
          }
        }
        
        // Check path for /ref/CODE format
        const pathParts = window.location.pathname.split('/');
        if (pathParts.length >= 3 && pathParts[1] === 'ref') {
          const pathCode = pathParts[2];
          if (pathCode) {
            console.log('Referral code detected from path:', pathCode);
            setReferralCode(pathCode);
            // Remove the referral code from the path without refreshing the page
            const newPath = window.location.pathname.replace(/\/ref\/[^\/]+/, '');
            window.history.replaceState({}, document.title, newPath + window.location.search);
            return;
          }
        }
        
        if (code) {
          console.log('Referral code detected from query parameter:', code);
          setReferralCode(code);
          
          // Remove the referral code from the URL without refreshing the page
          url.searchParams.delete('ref');
          window.history.replaceState({}, document.title, url.toString());
        }
      } catch (error) {
        console.error('Error detecting referral code:', error);
      }
    };
    
    detectReferralCode();
  }, []);
  
  // When referral code is detected, register it
  useEffect(() => {
    const processReferral = async () => {
      if (!referralCode || isProcessed || isProcessing) return;
      
      setIsProcessing(true);
      try {
        // Store in local storage first to prevent duplicate processing
        const processedReferrals = JSON.parse(localStorage.getItem('processedReferrals') || '[]');
        
        // If this referral was already processed, skip
        if (processedReferrals.includes(referralCode)) {
          console.log('Referral already processed:', referralCode);
          setIsProcessed(true);
          setIsProcessing(false);
          return;
        }
        
        // Call the API to register the referral
        const success = await registerReferral(referralCode);
        
        if (success) {
          console.log('Referral registered successfully');
          
          // Add to processed referrals
          processedReferrals.push(referralCode);
          localStorage.setItem('processedReferrals', JSON.stringify(processedReferrals));
        }
        
        setIsProcessed(true);
      } catch (error) {
        console.error('Error processing referral:', error);
      } finally {
        setIsProcessing(false);
      }
    };
    
    processReferral();
  }, [referralCode, isProcessed, isProcessing]);
  
  return {
    referralCode,
    isProcessing,
    isProcessed
  };
};

export default useReferral; 