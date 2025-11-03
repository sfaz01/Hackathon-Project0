
import React, { useState } from 'react';
import type { Report, UserRole } from '../types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
    title: string;
    status: Report['kanbanStatus'];
    reports: Report[];
    userRole: UserRole;
    onUpdateStatus: (reportId: string, newStatus: Report['kanbanStatus']) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, status, reports, userRole, onUpdateStatus }) => {
    const [isDraggedOver, setIsDraggedOver] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (userRole === 'admin') {
            e.preventDefault();
            setIsDraggedOver(true);
        }
    };

    const handleDragLeave = () => {
        if (userRole === 'admin') {
            setIsDraggedOver(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (userRole === 'admin') {
            e.preventDefault();
            const reportId = e.dataTransfer.getData("reportId");
            if (reportId) {
                onUpdateStatus(reportId, status);
            }
            setIsDraggedOver(false);
        }
    };
    
    return (
        <div 
            className={`flex flex-col bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 transition-colors ${isDraggedOver ? 'bg-white/20' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="p-4 border-b border-white/10 sticky top-0 bg-black/30 backdrop-blur-xl rounded-t-xl">
                <h2 className="font-bold text-lg text-white flex items-center justify-between">
                    {title}
                    <span className="text-sm font-medium bg-white/10 text-gray-300 rounded-full px-2.5 py-0.5">{reports.length}</span>
                </h2>
            </div>
            <div className="p-4 space-y-4 flex-grow overflow-y-auto">
                {reports.length > 0 ? (
                    reports.map(report => (
                        <KanbanCard key={report.id} report={report} userRole={userRole} />
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                        No issues in this column.
                    </div>
                )}
            </div>
        </div>
    );
};
