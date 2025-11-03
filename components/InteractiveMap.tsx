
import React from 'react';
import type { Report, Prediction, Geolocation } from '../types';
import { MapPinIcon } from './icons';

type MapItem = Report | Prediction;

interface InteractiveMapProps {
    items: MapItem[];
    hoveredItemId: string | null;
    setHoveredItemId: (id: string | null) => void;
    mapType: 'report' | 'prediction';
}

// Simple hash function to generate deterministic coordinates for items without location
const simpleHash = (str: string): { x: number, y: number } => {
    let hash1 = 0, hash2 = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash1 = ((hash1 << 5) - hash1) + char;
        hash1 |= 0; 
        if (i < str.length / 2) {
             hash2 = ((hash2 << 5) - hash2) + char;
             hash2 |= 0;
        }
    }
    return { x: (Math.abs(hash1) % 80) + 10, y: (Math.abs(hash2) % 80) + 10 };
};

const normalizeCoords = (lat: number, lon: number): { x: number, y: number } => {
    const x = ((lon + 180) % 360) / 3.6; 
    const y = ((lat * -1 + 90) % 180) / 1.8;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
}

const getItemData = (item: MapItem): { id: string, location: Geolocation | null, description: string, variant: string } => {
    if ('description' in item) { // It's a Report
        return {
            id: item.id,
            location: item.location,
            description: item.description,
            variant: item.status,
        };
    } else { // It's a Prediction
        return {
            id: item.id,
            location: item.location,
            description: `${item.riskLevel} Risk: ${item.type}`,
            variant: item.riskLevel,
        };
    }
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ items, hoveredItemId, setHoveredItemId, mapType }) => {
    
    const getPinStyle = (variant: string) => {
        if (mapType === 'report') {
            switch (variant) {
                case 'complete': return 'text-green-400';
                case 'triaging': return 'text-cyan-400 animate-pulse';
                default: return 'text-red-400';
            }
        } else { // prediction
            switch (variant) {
                case 'High': return 'text-red-500';
                case 'Medium': return 'text-yellow-400';
                default: return 'text-blue-400';
            }
        }
    };
    
    const title = mapType === 'report' ? 'Dispatcher Map View' : 'Predictive Hotspot Map';
    
    return (
        <div className="relative w-full h-full bg-black/30 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                     {items.length === 0 ? (
                        <>
                            <h3 className="text-2xl font-bold text-white/60">No Data to Display</h3>
                            <p className="text-white/40">{ mapType === 'report' ? 'Try adjusting your filters' : 'Generate a new prediction'}</p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-2xl font-bold text-white/60">{title}</h3>
                            <p className="text-white/40">{items.length} item(s) shown</p>
                        </>
                    )}
                </div>
            </div>

            {items.map(item => {
                const { id, location, description, variant } = getItemData(item);
                
                const position = location ? normalizeCoords(location.latitude, location.longitude) : simpleHash(id);
                const isHovered = id === hoveredItemId;
                const colorClass = getPinStyle(variant);

                return (
                    <div
                        key={id}
                        className="absolute group"
                        style={{ 
                            left: `${position.x}%`, 
                            top: `${position.y}%`, 
                            transform: 'translate(-50%, -100%)',
                            zIndex: isHovered ? 10 : 1,
                        }}
                        onMouseEnter={() => setHoveredItemId(id)}
                        onMouseLeave={() => setHoveredItemId(null)}
                    >
                        <MapPinIcon className={`w-8 h-8 drop-shadow-lg transition-all duration-200 ${colorClass} ${isHovered ? 'scale-150 -translate-y-2' : 'group-hover:scale-125'}`} />
                        <div className={`absolute bottom-full mb-2 w-max max-w-xs p-2 text-sm bg-black/60 backdrop-blur-md text-white rounded-md shadow-lg transition-opacity duration-200 pointer-events-none -translate-x-1/2 left-1/2 ${isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            {description}
                            <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-black/60 transform -translate-x-1/2 translate-y-1/2 rotate-45"></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
