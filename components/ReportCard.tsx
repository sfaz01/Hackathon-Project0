
import React, { useState } from 'react';
import type { Report, Feedback, UserRole } from '../types';
import { TagIcon, MapPinIcon, AlertTriangleIcon, CpuChipIcon, XCircleIcon, LinkIcon, CheckCircleIcon, StarIcon, QuestionMarkCircleIcon, CheckBadgeIcon, NoSymbolIcon, TrophyIcon } from './icons';

interface ReportCardProps {
    report: Report;
    userRole: UserRole;
    hoveredItemId: string | null;
    setHoveredItemId: (id: string | null) => void;
    onMarkAsResolved?: (reportId: string) => void;
    onSubmitFeedback: (reportId: string, feedback: Feedback) => void;
    onAcceptReport?: (reportId: string) => void;
    onRejectReport?: (reportId: string) => void;
    onValidateReport?: (reportId: string) => void;
}

const AcceptanceStatusBadge: React.FC<{ status: Report['acceptanceStatus'] }> = ({ status }) => {
    const styles = {
        pending: 'text-yellow-300 bg-yellow-400/10',
        accepted: 'text-green-300 bg-green-400/10',
        rejected: 'text-red-300 bg-red-400/10',
    };
     const text = {
        pending: 'Pending Review',
        accepted: 'Request Accepted',
        rejected: 'Request Rejected',
    };
    return <p className={`text-xs font-semibold px-2 py-1 rounded-full ${styles[status]}`}>{text[status]}</p>;
};

const SeverityIndicator: React.FC<{ level: number }> = ({ level }) => {
    const colors = {
        1: 'bg-green-500/20 text-green-300',
        2: 'bg-cyan-500/20 text-cyan-300',
        3: 'bg-yellow-500/20 text-yellow-300',
        4: 'bg-orange-500/20 text-orange-300',
        5: 'bg-red-500/20 text-red-300',
    };
    const text = {
        1: 'Very Low', 2: 'Low', 3: 'Medium', 4: 'High', 5: 'Critical'
    };
    return (
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${colors[level]}`}>
            <AlertTriangleIcon className="h-3.5 w-3.5" />
            <span>Severity: {text[level]}</span>
        </div>
    );
};

const TriagingSkeleton: React.FC = () => (
    <div className="animate-pulse">
        <div className="h-4 bg-gray-600 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-700 rounded-full w-24 mb-4"></div>
        <div className="h-10 bg-gray-600 rounded-lg"></div>
    </div>
);

const FeedbackForm: React.FC<{ onSubmit: (feedback: Feedback) => void }> = ({ onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating > 0) {
            onSubmit({ rating, comment });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-black/30 p-4 rounded-lg border border-white/10">
            <h4 className="font-semibold text-sm text-gray-200 text-center">How satisfied are you with the resolution?</h4>
            <div className="flex justify-center items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        type="button"
                        key={star}
                        className="text-2xl transition-colors"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                    >
                        <StarIcon className={`w-7 h-7 ${(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-600'}`} />
                    </button>
                ))}
            </div>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Optional: Leave a comment..."
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-gray-100 text-sm focus:ring-1 focus:ring-indigo-500 transition"
            />
            <button
                type="submit"
                disabled={rating === 0}
                className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-indigo-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                Submit Feedback
            </button>
        </form>
    );
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, userRole, hoveredItemId, setHoveredItemId, onMarkAsResolved, onSubmitFeedback, onAcceptReport, onRejectReport, onValidateReport }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const isHovered = report.id === hoveredItemId;

    const triageStatusStyles = {
        complete: 'text-green-300 bg-green-400/10',
        triaging: 'text-cyan-300 bg-cyan-400/10 animate-pulse',
        error: 'text-red-300 bg-red-400/10',
        pending: 'text-gray-400 bg-gray-500/10',
        resolved: 'text-indigo-300 bg-indigo-400/10'
    };

    const triageStatusText = {
        complete: 'Triage Complete',
        triaging: 'AI Triaging...',
        error: 'Triage Failed',
        pending: 'Submitted',
        resolved: 'Resolved'
    };

    const showAdminActions = userRole === 'admin' && report.status === 'complete' && report.acceptanceStatus === 'pending' && onAcceptReport && onRejectReport;
    const showValidationAction = userRole === 'admin' && report.status === 'complete' && !report.validatedAt && onValidateReport;

    return (
        <div 
            className={`bg-white/10 backdrop-blur-xl rounded-lg overflow-hidden border border-white/10 shadow-lg transition-all duration-300 ${isHovered ? 'border-indigo-500/50 scale-[1.02]' : 'hover:border-white/20'}`}
            onMouseEnter={() => setHoveredItemId(report.id)}
            onMouseLeave={() => setHoveredItemId(null)}
        >
            <div className="p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex gap-4">
                    <img src={report.photo.url} alt="Issue" className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start">
                             { report.status === 'triaging' ?
                                <p className={`text-xs font-semibold px-2 py-1 rounded-full ${triageStatusStyles.triaging}`}>{triageStatusText.triaging}</p>
                               : <AcceptanceStatusBadge status={report.acceptanceStatus} />
                             }
                             {report.thinkingMode && <div className="flex items-center text-xs text-indigo-300 bg-indigo-500/20 px-2 py-1 rounded-full gap-1.5"><CpuChipIcon className="w-4 h-4" /><span>Pro</span></div>}
                        </div>
                        <p className="font-semibold text-white mt-2 leading-tight truncate">{report.description}</p>
                        
                        {(report.status === 'complete' || report.status === 'resolved') && report.triageResult && (
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                                <div className="text-xs font-medium bg-white/10 px-2 py-1 rounded-full flex items-center gap-1.5">
                                    <TagIcon className="h-3.5 w-3.5" />
                                    {report.triageResult.category}
                                </div>
                            </div>
                        )}

                        {report.feedback && (
                             <div className="mt-2 flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon key={i} className={`w-4 h-4 ${i < report.feedback.rating ? 'text-yellow-400' : 'text-gray-600'}`} />
                                ))}
                            </div>
                        )}

                    </div>
                </div>
            </div>
            
            {isExpanded && (
                <div className="p-4 border-t border-white/10 bg-black/20 space-y-4">
                    {report.status === 'triaging' && <TriagingSkeleton />}
                    {report.status === 'error' && (
                         <div className="flex items-center gap-3 text-red-300 bg-red-500/20 p-3 rounded-lg">
                            <XCircleIcon className="h-6 w-6 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">An error occurred</p>
                                <p className="text-sm opacity-80">{report.errorMessage}</p>
                            </div>
                        </div>
                    )}
                    {(report.status === 'complete' || report.status === 'resolved') && report.triageResult && (
                        <div className="space-y-4">
                            {report.acceptanceStatus === 'rejected' && (
                                <div className="bg-red-500/20 p-3 rounded-lg text-red-300">
                                    <h4 className="font-semibold text-sm">Reason for Rejection</h4>
                                    <p className="text-sm italic mt-1">"{report.rejectionReason || 'No reason provided.'}"</p>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <SeverityIndicator level={report.triageResult.severity} />
                                <div className="text-right">
                                    <div className="text-xs text-gray-400">Priority</div>
                                    <div className="text-xl font-bold text-white">{report.triageResult.priority_score} <span className="text-base font-normal text-gray-300">/ 100</span></div>
                                </div>
                            </div>
                             <div>
                                <h4 className="font-semibold text-sm text-gray-300 mb-1">AI Summary</h4>
                                <p className="text-gray-200 text-sm">{report.triageResult.summary}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-300 mb-1 flex items-center gap-1.5"><QuestionMarkCircleIcon className="w-4 h-4"/>Probable Cause</h4>
                                <p className="text-gray-200 text-sm">{report.triageResult.probable_cause}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-sm text-gray-300 mb-1">Suggested Action</h4>
                                <p className="text-gray-200 text-sm bg-white/10 p-3 rounded-md">{report.triageResult.suggested_action}</p>
                            </div>
                        </div>
                    )}
                    
                    {showValidationAction && onValidateReport && (
                        <button onClick={() => onValidateReport(report.id)} className="w-full flex items-center justify-center gap-2 bg-amber-600/80 text-white font-semibold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors duration-200 text-sm">
                            <TrophyIcon className="h-5 w-5" /> Validate Report (+10 Credits)
                        </button>
                    )}

                    {showAdminActions && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => onRejectReport && onRejectReport(report.id)} className="w-full flex items-center justify-center gap-2 bg-red-600/20 text-red-300 font-semibold py-2 px-4 rounded-lg hover:bg-red-600/40 transition-colors duration-200 text-sm">
                                <NoSymbolIcon className="h-5 w-5" /> Reject
                            </button>
                            <button onClick={() => onAcceptReport && onAcceptReport(report.id)} className="w-full flex items-center justify-center gap-2 bg-green-600/20 text-green-300 font-semibold py-2 px-4 rounded-lg hover:bg-green-600/40 transition-colors duration-200 text-sm">
                                <CheckBadgeIcon className="h-5 w-5" /> Accept
                            </button>
                        </div>
                    )}

                    {userRole === 'admin' && report.status === 'complete' && report.acceptanceStatus === 'accepted' && onMarkAsResolved && (
                        <button onClick={() => onMarkAsResolved(report.id)} className="w-full flex items-center justify-center gap-2 bg-green-600/80 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm">
                            <CheckCircleIcon className="h-5 w-5" /> Mark as Resolved
                        </button>
                    )}

                    {report.status === 'resolved' && userRole === 'citizen' && !report.feedback && (
                        <FeedbackForm onSubmit={(feedback) => onSubmitFeedback(report.id, feedback)} />
                    )}

                    {report.status === 'resolved' && report.feedback && (
                        <div className="bg-black/30 p-3 rounded-lg border border-white/10">
                             <h4 className="font-semibold text-sm text-gray-300 mb-2">User Feedback</h4>
                             <div className="flex items-center gap-2">
                                <div className="flex items-center gap-0.5">
                                     {[...Array(5)].map((_, i) => (
                                        <StarIcon key={i} className={`w-5 h-5 ${i < report.feedback.rating ? 'text-yellow-400' : 'text-gray-600'}`} />
                                    ))}
                                </div>
                                <span className="text-sm font-semibold">{report.feedback.rating} out of 5</span>
                             </div>
                             {report.feedback.comment && (
                                <p className="text-gray-200 text-sm mt-2 italic border-l-2 border-indigo-400 pl-3">"{report.feedback.comment}"</p>
                             )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
