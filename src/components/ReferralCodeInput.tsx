import React, { useState } from 'react';
import { registerReferral } from '@/services/api/referralService';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ReferralCodeInputProps {
  className?: string;
  onSuccess?: () => void;
}

const ReferralCodeInput: React.FC<ReferralCodeInputProps> = ({ className, onSuccess }) => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Please enter a referral code');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await registerReferral(code.trim());
      if (success) {
        toast.success('Referral code applied successfully!');
        onSuccess?.();
      } else {
        toast.error('Invalid referral code');
      }
    } catch (error) {
      console.error('Error applying referral code:', error);
      toast.error('Failed to apply referral code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-sidebar-accent rounded-lg shadow-sm overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-100 dark:border-gray-800/50">
        <h3 className="text-lg font-medium">Enter Referral Code</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Were you invited by a friend? Enter their referral code here
        </p>
      </div>
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter referral code"
            className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-sidebar-primary/30 text-sm"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !code.trim()}
            className="px-4 py-2 bg-telegram-blue text-white rounded-md disabled:opacity-70 flex items-center"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="xs" inline className="mr-2" />
                Активация...
              </>
            ) : (
              'Активировать'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReferralCodeInput; 