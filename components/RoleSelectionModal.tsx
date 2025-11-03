
import React from 'react';
import type { UserRole } from '../types';
import { UserIcon, ShieldCheckIcon } from './icons';

interface RoleSelectionModalProps {
    onSelectRole: (role: UserRole) => void;
}

const RoleCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}> = ({ icon, title, description, onClick }) => (
    <button
        onClick={onClick}
        className="w-full max-w-sm text-left bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20 transform hover:scale-105"
    >
        <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600/50 rounded-lg text-indigo-300">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="text-sm text-gray-400 mt-1">{description}</p>
            </div>
        </div>
    </button>
);

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({ onSelectRole }) => {
    return (
        <div className="fixed inset-0 z-50 bg-gray-950/80 backdrop-blur-lg flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-white mb-2">
                    Welcome to Civic Triage <span className="text-indigo-400">AI</span>
                </h1>
                <p className="text-lg text-gray-300 mb-12">Please select your role to continue.</p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <RoleCard
                        icon={<UserIcon className="w-8 h-8" />}
                        title="Citizen"
                        description="Report issues, track progress, and provide feedback."
                        onClick={() => onSelectRole('citizen')}
                    />
                    <RoleCard
                        icon={<ShieldCheckIcon className="w-8 h-8" />}
                        title="Administrator"
                        description="Manage reports, triage issues, and view analytics."
                        onClick={() => onSelectRole('admin')}
                    />
                </div>
            </div>
        </div>
    );
};
