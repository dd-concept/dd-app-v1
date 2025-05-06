import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Share2, Copy, RefreshCw, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import { getUserReferralInfo, getReferralStats, shareReferralLink } from '@/services/api/referralService';
import { ReferralInfo, ReferralStats } from '@/services/api/types';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ReferralCardProps {
  className?: string;
}

const ReferralCard: React.FC<ReferralCardProps> = ({ className }) => {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: referralInfo, refetch: refetchReferralInfo } = useQuery({
    queryKey: ['referralInfo'],
    queryFn: () => getUserReferralInfo(),
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
    retryDelay: 1000,
  });

  const { data: referralStats, refetch: refetchStats } = useQuery({
    queryKey: ['referralStats'],
    queryFn: () => getReferralStats(),
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
    retryDelay: 1000,
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        await Promise.all([
          refetchReferralInfo(),
          refetchStats()
        ]);
      } catch (error) {
        console.error('Error loading referral data:', error);
        setLoadError('Failed to load referral information');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [refetchReferralInfo, refetchStats]);

  const handleShare = async () => {
    if (!referralInfo) {
      toast.error('Реферальная информация недоступна');
      return;
    }
    
    if (!referralInfo.telegram_deep_link) {
      toast.error('Реферальная ссылка отсутствует');
      console.error('Empty referral link:', referralInfo);
      return;
    }
    
    await shareReferralLink(referralInfo);
  };

  const handleCopyLink = async () => {
    if (!referralInfo) {
      toast.error('Реферальная информация недоступна');
      return;
    }
    
    if (!referralInfo.telegram_deep_link) {
      toast.error('Реферальная ссылка отсутствует');
      console.error('Empty referral link:', referralInfo);
      return;
    }
    
    try {
      await navigator.clipboard.writeText(referralInfo.telegram_deep_link);
      toast.success('Реферальная ссылка скопирована в буфер обмена');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Не удалось скопировать реферальную ссылку');
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    setLoadError(null);
    Promise.all([
      refetchReferralInfo(),
      refetchStats()
    ]).finally(() => setIsLoading(false));
  };

  if (isLoading) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <LoadingSpinner size="sm" className="mx-auto" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Загрузка информации о рефералах...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">{loadError}</p>
        <button
          onClick={handleRetry}
          className="inline-flex items-center text-sm text-telegram-blue hover:text-telegram-dark"
        >
          <RefreshCw className="mr-1 h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Referral Link Section */}
      <div className="p-2 bg-telegram-secondary-bg rounded-lg">
        <h3 className="text-sm font-medium mb-2">Ваша реферальная ссылка</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={referralInfo?.telegram_deep_link || ''}
            placeholder={!referralInfo?.telegram_deep_link ? "Ссылка не найдена" : ""}
            className={`flex-1 p-2 text-sm bg-white dark:bg-sidebar-primary/30 border ${!referralInfo?.telegram_deep_link ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'} rounded-md`}
          />
          <button
            onClick={handleCopyLink}
            className="p-2 text-telegram-blue hover:text-telegram-dark"
            title="Copy link"
            disabled={!referralInfo?.telegram_deep_link}
          >
            <Copy size={18} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 text-telegram-blue hover:text-telegram-dark"
            title="Share link"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Referrals List Section */}
      <div className="p-2 bg-telegram-secondary-bg rounded-lg">
        <h3 className="text-sm font-medium mb-2">Приглашенные друзья</h3>
        {referralStats?.referred_users && referralStats.referred_users.length > 0 ? (
          <div className="space-y-2">
            {referralStats.referred_users.map((user) => (
              <div key={user.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  {user.username ? `@${user.username}` : `User ${user.id}`}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  С нами с {new Date(user.joined_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Тут пока никого нет..
          </p>
        )}
      </div>
    </div>
  );
};

export default ReferralCard; 