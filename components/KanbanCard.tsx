
import React from 'react';
import type { Report, UserRole } from '../types';
import { SignalIcon } from './icons';

interface KanbanCardProps {
    report: Report;
    userRole: UserRole;
}

const PriorityBadge: React.FC<{ score: number }> = ({ score }) => {
    let level: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
    let colorClass = 'bg-cyan-500/20 text-cyan-300';
    
    if (score > 90) {
        level = 'Critical';
        colorClass = 'bg-red-500/20 text-red-300';
    } else if (score > 70) {
        level = 'High';
        colorClass = 'bg-orange-500/20 text-orange-300';
    } else if (score > 40) {
        level = 'Medium';
        colorClass = 'bg-yellow-500/20 text-yellow-300';
    }

    return (
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
           <SignalIcon className="h-3 w-3" />
            <span>{level}</span>
        </div>
    );
};


export const KanbanCard: React.FC<KanbanCardProps> = ({ report, userRole }) => {

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        if (userRole === 'admin') {
            e.dataTransfer.setData("reportId", report.id);
            e.dataTransfer.effectAllowed = "move";
        }
    };

    const isAdmin = userRole === 'admin';

    return (
        <div
            draggable={isAdmin}
            onDragStart={handleDragStart}
            className={`bg-white/10 backdrop-blur-lg rounded-lg p-3 border border-white/10 shadow-md transition-colors ${isAdmin ? 'cursor-grab active:cursor-grabbing hover:bg-white/20' : 'cursor-default'}`}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-gray-400">
                    {report.id.slice(0, 12)}...
                </span>
                {report.triageResult && <PriorityBadge score={report.triageResult.priority_score} />}
            </div>
            <p className="text-sm font-medium text-gray-100 leading-snug">
                {report.description}
            </p>
        </div>
    );
};
