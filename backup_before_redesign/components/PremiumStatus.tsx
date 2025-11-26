import React from 'react';
import { Crown } from 'lucide-react';

interface Props {
    isPremium: boolean;
    premiumActivatedAt?: number;
    theme: 'dark' | 'light';
}

export const PremiumStatus: React.FC<Props> = ({ isPremium, premiumActivatedAt, theme }) => {
    if (!isPremium || !premiumActivatedAt) return null;

    const daysSinceActivation = Math.floor((Date.now() - premiumActivatedAt) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 30 - daysSinceActivation);

    const isExpiringSoon = daysRemaining <= 7;
    const isDark = theme === 'dark';

    // Dark Mode Styles (Original)
    const darkStyles = {
        container: isExpiringSoon ? 'bg-orange-900/30 border-orange-500/30' : 'bg-yellow-900/30 border-yellow-500/30',
        icon: isExpiringSoon ? 'text-orange-400' : 'text-yellow-400',
        textTitle: isExpiringSoon ? 'text-orange-300' : 'text-yellow-300',
        textSub: 'text-gray-400'
    };

    // Light Mode Styles (New)
    const lightStyles = {
        container: isExpiringSoon ? 'bg-orange-100 border-orange-200' : 'bg-yellow-100 border-yellow-200',
        icon: isExpiringSoon ? 'text-orange-600' : 'text-yellow-600',
        textTitle: isExpiringSoon ? 'text-orange-700' : 'text-yellow-700',
        textSub: 'text-gray-600'
    };

    const styles = isDark ? darkStyles : lightStyles;

    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${styles.container}`}>
            <Crown size={16} className={styles.icon} fill="currentColor" />
            <div className="text-xs">
                <span className={`font-bold ${styles.textTitle}`}>
                    Premium aktiv
                </span>
                <span className="text-gray-400 ml-2">
                    <span className={styles.textSub}>
                        {daysRemaining} {daysRemaining === 1 ? 'Tag' : 'Tage'} übrig
                    </span>
                </span>
            </div>
        </div>
    );
};
