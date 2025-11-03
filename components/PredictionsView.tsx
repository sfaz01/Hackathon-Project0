
import React, { useState } from 'react';
import type { Prediction, Geolocation } from '../types';
import { PredictionCard } from './PredictionCard';
import { InteractiveMap } from './InteractiveMap';
import { BrainCircuitIcon } from './icons';
import { generatePredictions } from '../services/geminiService';

interface PredictionsViewProps {
    predictions: Prediction[];
    setPredictions: React.Dispatch<React.SetStateAction<Prediction[]>>;
    userLocation: Geolocation | null;
}

export const PredictionsView: React.FC<PredictionsViewProps> = ({ predictions, setPredictions, userLocation }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generatePredictions(userLocation);
            setPredictions(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const EmptyState = () => (
        <div className="text-center bg-black/30 backdrop-blur-xl rounded-xl p-12 border border-white/10">
            <div className="mb-4 text-indigo-400">
                <BrainCircuitIcon className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Predictive Analysis</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
                Use AI to forecast potential infrastructure issues by analyzing simulated weather, traffic, and historical data relevant to your location.
            </p>
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-500 transition-colors duration-200 shadow-lg shadow-indigo-500/50 disabled:bg-gray-500 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center mx-auto gap-2"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        AI is Analyzing Your Area...
                    </>
                ) : (
                    'Generate Predictive Report'
                )}
            </button>
            {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>
    );

    return (
        <div className="space-y-8">
            {predictions.length === 0 ? (
                <EmptyState />
            ) : (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">AI Forecast</h2>
                             <button
                                onClick={handleGenerate}
                                disabled={isLoading}
                                className="bg-white/10 text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/20 transition-colors duration-200 border border-white/10 text-sm"
                            >
                                {isLoading ? 'Generating...' : 'Regenerate'}
                            </button>
                        </div>
                        
                        {error && <p className="text-red-400 mb-4 p-3 bg-red-500/20 rounded-md">{error}</p>}

                        <div className="space-y-4 max-h-[65vh] lg:max-h-[calc(100vh-14rem)] overflow-y-auto pr-2 -mr-2">
                            {predictions.map(prediction => (
                                <PredictionCard key={prediction.id} prediction={prediction} hoveredItemId={hoveredItemId} setHoveredItemId={setHoveredItemId} />
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-2 rounded-xl overflow-hidden h-96 lg:h-auto min-h-[500px] lg:min-h-0">
                         <InteractiveMap
                            items={predictions}
                            hoveredItemId={hoveredItemId}
                            setHoveredItemId={setHoveredItemId}
                            mapType="prediction"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
