
import React from 'react';
import type { Badge, UserBadge } from '../types';
import * as Icons from './icons';

interface BadgesViewProps {
    badges: Badge[];
    userBadges: UserBadge[];
}

const BadgeIcon: React.FC<{ iconName: Badge['icon'], className: string }> = ({ iconName, className }) => {
    const IconComponent = Icons[iconName] || Icons.SparklesIcon;
    return <IconComponent className={className} />;
};

const BadgeCard: React.FC<{ badge: Badge, isUnlocked: boolean, awardedAt?: Date }> = ({ badge, isUnlocked, awardedAt }) => {
    return (
        <div className={`
            bg-black/30 backdrop-blur-xl rounded-xl p-6 border transition-all duration-300
            ${isUnlocked 
                ? 'border-indigo-500/50 shadow-lg shadow-indigo-600/20' 
                : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/20'
            }
        `}>
            <div className="flex flex-col items-center text-center">
                <div className={`relative w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isUnlocked ? 'bg-indigo-600' : 'bg-white/10'}`}>
                    <BadgeIcon iconName={badge.icon} className={`w-12 h-12 ${isUnlocked ? 'text-white' : 'text-gray-500'}`} />
                    {isUnlocked && <Icons.CheckBadgeIcon className="absolute -bottom-1 -right-1 w-7 h-7 text-green-400 bg-gray-900 rounded-full" />}
                </div>
                <h3 className={`text-lg font-bold ${isUnlocked ? 'text-white' : 'text-gray-300'}`}>{badge.title}</h3>
                <p className="text-sm text-gray-400 mt-1 h-10">{badge.description}</p>
                {isUnlocked && awardedAt && (
                    <p className="text-xs text-indigo-300 mt-3 bg-indigo-500/10 px-2 py-1 rounded-full">
                        Unlocked: {awardedAt.toLocaleDateString()}
                    </p>
                )}
                 {!isUnlocked && (
                     <div className="text-xs text-gray-500 mt-3 bg-white/5 px-2 py-1 rounded-full">
                        {badge.criteria.type === 'validated_count' && `Validate ${badge.criteria.threshold} reports`}
                        {badge.criteria.type === 'streak_length' && `Reach a ${badge.criteria.threshold}-day streak`}
                     </div>
                 )}
            </div>
        </div>
    )
};


export const BadgesView: React.FC<BadgesViewProps> = ({ badges, userBadges }) => {
    const unlockedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-extrabold text-white">Your Achievements</h1>
                <p className="text-lg text-gray-400 mt-2">Unlock badges by contributing to your community.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {badges.map(badge => {
                    const userBadge = userBadges.find(ub => ub.badgeId === badge.id);
                    return (
                        <BadgeCard 
                            key={badge.id}
                            badge={badge}
                            isUnlocked={!!userBadge}
                            awardedAt={userBadge?.awardedAt}
                        />
                    )
                })}
            </div>
        </div>
    );
};
