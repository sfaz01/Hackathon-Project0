import React from 'react';
import type { User, UserRole } from '../types';
import { BuildingLibraryIcon, ClipboardDocumentListIcon, ChartBarSquareIcon, ViewColumnsIcon, ArrowPathIcon, TrophyIcon, SparklesIcon } from './icons';

interface HeaderProps {
    currentView: 'dashboard' | 'form' | 'predictions' | 'kanban' | 'leaderboard' | 'badges';
    setCurrentView: (view: 'dashboard' | 'predictions' | 'kanban' | 'leaderboard' | 'badges') => void;
    userRole: UserRole;
    user: User;
    onSwitchRole: () => void;
}

const NavButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    children: React.ReactNode;
}> = ({ isActive, onClick, icon, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
    >
        {icon}
        {children}
    </button>
);


export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, userRole, user, onSwitchRole }) => {
    return (
        <header className="bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-600 rounded-lg">
                            <BuildingLibraryIcon className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">
                            Civic Triage <span className="text-indigo-400">AI</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-xs font-semibold bg-white/5 text-indigo-300 px-3 py-1.5 rounded-full border border-white/10">
                           <span>{userRole === 'admin' ? 'Admin View' : 'Citizen View'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                            <TrophyIcon className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm font-bold text-white">{user.credits}</span>
                        </div>

                        <nav className="hidden md:flex items-center gap-1">
                            <NavButton 
                                isActive={currentView === 'dashboard' || currentView === 'form'} 
                                onClick={() => setCurrentView('dashboard')}
                                icon={<ClipboardDocumentListIcon className="h-5 w-5" />}
                            >
                                Dashboard
                            </NavButton>
                             <NavButton 
                                isActive={currentView === 'predictions'} 
                                onClick={() => setCurrentView('predictions')}
                                icon={<ChartBarSquareIcon className="h-5 w-5" />}
                            >
                                Predictions
                            </NavButton>
                             <NavButton 
                                isActive={currentView === 'leaderboard'} 
                                onClick={() => setCurrentView('leaderboard')}
                                icon={<TrophyIcon className="h-5 w-5" />}
                            >
                                Leaderboard
                            </NavButton>
                             <NavButton 
                                isActive={currentView === 'badges'} 
                                onClick={() => setCurrentView('badges')}
                                icon={<SparklesIcon className="h-5 w-5" />}
                            >
                                Badges
                            </NavButton>
                             {userRole === 'admin' && (
                                <NavButton 
                                    isActive={currentView === 'kanban'} 
                                    onClick={() => setCurrentView('kanban')}
                                    icon={<ViewColumnsIcon className="h-5 w-5" />}
                                >
                                    Board
                                </NavButton>
                             )}
                        </nav>
                        
                        <div className="border-l border-white/10 h-6 mx-2"></div>

                        <button onClick={onSwitchRole} title="Switch Role" className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                            <ArrowPathIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};