
import React from 'react';
import type { Prediction } from '../types';
import { AlertTriangleIcon, WrenchScrewdriverIcon, CloudRainIcon } from './icons';

interface PredictionCardProps {
    prediction: Prediction;
    hoveredItemId: string | null;
    setHoveredItemId: (id: string | null) => void;
}

const RiskIndicator: React.FC<{ level: Prediction['riskLevel'] }> = ({ level }) => {
    const styles = {
        High: 'bg-red-500/20 text-red-300',
        Medium: 'bg-yellow-500/20 text-yellow-300',
        Low: 'bg-blue-500/20 text-blue-300',
    };
    return (
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${styles[level]}`}>
            <AlertTriangleIcon className="h-3.5 w-3.5" />
            <span>{level} Risk</span>
        </div>
    );
};

const TypeIcon: React.FC<{ type: Prediction['type'] }> = ({ type }) => {
    const icons = {
        'Pothole/Crack Formation': <WrenchScrewdriverIcon className="h-5 w-5 text-orange-300" />,
        'Localized Flooding': <CloudRainIcon className="h-5 w-5 text-cyan-300" />,
        'Structural Stress': <div className="h-5 w-5 text-gray-300">S</div>, // Placeholder
    };
    return <div className="p-2 bg-white/10 rounded-lg">{icons[type] || null}</div>;
}


export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, hoveredItemId, setHoveredItemId }) => {
    const isHovered = prediction.id === hoveredItemId;

    return (
        <div
            className={`bg-white/10 backdrop-blur-xl rounded-lg border border-white/10 shadow-lg transition-all duration-300 p-4 space-y-3 ${isHovered ? 'border-indigo-500/50 scale-[1.02]' : 'hover:border-white/20'}`}
            onMouseEnter={() => setHoveredItemId(prediction.id)}
            onMouseLeave={() => setHoveredItemId(null)}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <TypeIcon type={prediction.type} />
                    <div>
                        <h3 className="font-semibold text-white">{prediction.type}</h3>
                        <p className="text-sm text-gray-400">{prediction.timeframe}</p>
                    </div>
                </div>
                <RiskIndicator level={prediction.riskLevel} />
            </div>

            <div>
                <h4 className="font-semibold text-xs text-gray-300 mb-1 uppercase tracking-wider">AI Reasoning</h4>
                <p className="text-gray-200 text-sm">{prediction.reasoning}</p>
            </div>
        </div>
    );
};
