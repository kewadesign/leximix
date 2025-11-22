import React from 'react';
import { Crown } from 'lucide-react';

interface Props {
    isPremium: boolean;
    premiumActivatedAt?: number;
}

export const PremiumStatus: React.FC<Props> = ({ isPremium, premiumActivatedAt }) => {
    if (!isPremium || !premiumActivatedAt) return null;

    const daysSinceActivation = Math.floor((Date.now() - premiumActivatedAt) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 30 - daysSinceActivation);

    const isExpiringSoon = daysRemaining <= 7;

    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isExpiringSoon ? 'bg-orange-900/30 border-orange-500/30' : 'bg-yellow-900/30 border-yellow-500/30'}`}>
            <Crown size={16} className={isExpiringSoon ? 'text-orange-400' : 'text-yellow-400'} fill="currentColor" />
            <div className="text-xs">
                <span className={`font-bold ${isExpiringSoon ? 'text-orange-300' : 'text-yellow-300'}`}>
                    Premium aktiv
                </span>
                <span className="text-gray-400 ml-2">
                    {daysRemaining} {daysRemaining === 1 ? 'Tag' : 'Tage'} übrig
                </span>
            </div>
        </div>
    );
};
