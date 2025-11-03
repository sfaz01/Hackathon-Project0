
import React, { useMemo } from 'react';
import type { Report, UserRole } from '../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanViewProps {
    reports: Report[];
    userRole: UserRole;
    onUpdateStatus: (reportId: string, newStatus: Report['kanbanStatus']) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({ reports, userRole, onUpdateStatus }) => {
    
    const columns = useMemo(() => {
        const acceptedReports = reports.filter(r => r.acceptanceStatus === 'accepted');

        const pending = acceptedReports.filter(r => r.kanbanStatus === 'pending').sort((a,b) => (b.triageResult?.priority_score || 0) - (a.triageResult?.priority_score || 0));
        const inProgress = acceptedReports.filter(r => r.kanbanStatus === 'in-progress').sort((a,b) => (b.triageResult?.priority_score || 0) - (a.triageResult?.priority_score || 0));
        const done = acceptedReports.filter(r => r.kanbanStatus === 'done').sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        return { pending, inProgress, done };
    }, [reports]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            <KanbanColumn 
                title="Pending" 
                status="pending" 
                reports={columns.pending}
                userRole={userRole}
                onUpdateStatus={onUpdateStatus}
            />
            <KanbanColumn 
                title="In Progress" 
                status="in-progress"
                reports={columns.inProgress}
                userRole={userRole}
                onUpdateStatus={onUpdateStatus}
            />
            <KanbanColumn 
                title="Done" 
                status="done"
                reports={columns.done}
                userRole={userRole}
                onUpdateStatus={onUpdateStatus}
            />
        </div>
    );
};
