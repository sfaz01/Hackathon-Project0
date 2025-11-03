
import React, { useState, useMemo } from 'react';
import type { User, UserRole } from '../types';
import { TrophyIcon } from './icons';

interface LeaderboardViewProps {
    users: User[];
    currentUser: User;
    userRole: UserRole;
}

const LeaderboardScopeButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            isActive ? 'bg-white text-gray-900 shadow' : 'text-gray-200 hover:bg-white/20'
        }`}
    >
        {children}
    </button>
);

const LeaderboardRow: React.FC<{ user: User; rank: number }> = ({ user, rank }) => {
    const rankColors = {
        1: 'border-yellow-400 text-yellow-400 bg-yellow-400/10',
        2: 'border-gray-400 text-gray-400 bg-gray-400/10',
        3: 'border-amber-600 text-amber-600 bg-amber-600/10',
    };
    const rankStyle = rankColors[rank] || 'border-gray-700 text-gray-400';

    return (
        <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
            <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center text-lg font-bold rounded-full border-2 ${rankStyle}`}>
                {rank}
            </div>
            <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
            <div className="flex-grow">
                <p className="font-bold text-white">{user.name}</p>
                <p className="text-sm text-gray-400">{user.neighborhood}</p>
            </div>
            <div className="text-right">
                <p className="text-xl font-bold text-white">{user.credits}</p>
                <p className="text-xs text-gray-400">Credits</p>
            </div>
        </div>
    );
};

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ users, currentUser, userRole }) => {
    const [scope, setScope] = useState<string>('global');

    const neighborhoods = useMemo(() => {
        const unique = new Set(users.map(u => u.neighborhood));
        return Array.from(unique).sort();
    }, [users]);
    
    const sortedUsers = useMemo(() => {
        const filteredUsers = scope === 'global'
            ? users
            : users.filter(u => u.neighborhood === scope);
            
        return filteredUsers
            .filter(user => user.isPhoneVerified)
            .sort((a, b) => b.credits - a.credits);
    }, [users, scope]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <TrophyIcon className="w-12 h-12 text-yellow-400 flex-shrink-0" />
                    <div>
                        <h1 className="text-4xl font-extrabold text-white">Community Leaderboard</h1>
                        <p className="text-lg text-gray-400 mt-1">See who's making the biggest impact.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 p-1 bg-black/30 rounded-lg border border-white/10">
                    {userRole === 'citizen' ? (
                        <>
                             <LeaderboardScopeButton isActive={scope === 'global'} onClick={() => setScope('global')}>
                                Global
                            </LeaderboardScopeButton>
                            <LeaderboardScopeButton isActive={scope === currentUser.neighborhood} onClick={() => setScope(currentUser.neighborhood)}>
                                My Neighborhood
                            </LeaderboardScopeButton>
                        </>
                    ) : (
                        <select
                            value={scope}
                            onChange={(e) => setScope(e.target.value)}
                            className="bg-white/10 border-none rounded-md text-sm font-semibold h-9 px-3 focus:ring-2 focus:ring-indigo-500 transition"
                        >
                            <option value="global">Global Leaderboard</option>
                            {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    )}
                </div>
            </div>

            <div className="space-y-4 max-w-3xl mx-auto">
                {sortedUsers.length > 0 ? (
                    sortedUsers.map((user, index) => (
                        <LeaderboardRow key={user.id} user={user} rank={index + 1} />
                    ))
                ) : (
                    <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
                        <h3 className="text-xl font-semibold text-white">No users to display</h3>
                        <p className="text-gray-400 mt-2">There are no verified users in this leaderboard scope yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};