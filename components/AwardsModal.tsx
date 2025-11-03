
import React, { useEffect, useState } from 'react';
import type { Badge } from '../types';
import * as Icons from './icons';

interface AwardsModalProps {
    badge: Badge;
    onClose: () => void;
}

const BadgeIcon: React.FC<{ iconName: Badge['icon'], className: string }> = ({ iconName, className }) => {
    const IconComponent = Icons[iconName] || Icons.SparklesIcon;
    return <IconComponent className={className} />;
};


export const AwardsModal: React.FC<AwardsModalProps> = ({ badge, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    return (
        <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
        >
            <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-md"></div>
            <div
                onClick={(e) => e.stopPropagation()}
                className={`relative bg-gradient-to-br from-indigo-800/50 via-gray-900 to-gray-900 border border-indigo-500/50 rounded-2xl shadow-2xl p-8 text-center max-w-sm w-full transition-all duration-300 transform ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            >
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-500 rounded-full flex items-center justify-center border-4 border-gray-900 shadow-lg shadow-indigo-500/50">
                    <BadgeIcon iconName={badge.icon} className="w-20 h-20 text-white" />
                    <Icons.SparklesIcon className="w-8 h-8 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
                </div>
                
                <div className="mt-16">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-300">BADGE UNLOCKED!</h2>
                    <p className="text-3xl font-extrabold text-white mt-2">{badge.title}</p>
                    <p className="text-gray-300 mt-4">{badge.description}</p>
                </div>
                
                <button
                    onClick={handleClose}
                    className="mt-8 w-full bg-white/10 text-white font-semibold py-3 px-4 rounded-lg hover:bg-white/20 transition-colors duration-200 border border-white/20"
                >
                    Awesome!
                </button>
            </div>
        </div>
    );
};
