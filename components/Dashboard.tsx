
import React, { useState, useMemo } from 'react';
import type { Report, Feedback, UserRole, User } from '../types';
import { ReportCard } from './ReportCard';
import { InteractiveMap } from './InteractiveMap';
import { PlusIcon, ClipboardDocumentListIcon, ClockIcon, AlertTriangleIcon, RocketLaunchIcon } from './icons';

interface DashboardProps {
    reports: Report[];
    user: User;
    allUsers: User[];
    userRole: UserRole;
    onNewReport: () => void;
    onMarkAsResolved?: (reportId: string) => void;
    onSubmitFeedback: (reportId: string, feedback: Feedback) => void;
    onAcceptReport?: (reportId: string) => void;
    onRejectReport?: (reportId: string) => void;
    onValidateReport?: (reportId: string) => void;
}

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex items-center gap-4 transition-all hover:bg-white/20">
        <div className="p-3 bg-white/10 rounded-lg">{icon}</div>
        <div>
            <p className="text-sm text-gray-300">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const FilterButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded-md transition-colors ${active ? 'bg-white text-gray-900 shadow-md' : 'bg-white/10 text-gray-200 hover:bg-white/20'}`}>
        {children}
    </button>
);


export const Dashboard: React.FC<DashboardProps> = ({ reports, user, allUsers, userRole, onNewReport, onMarkAsResolved, onSubmitFeedback, onAcceptReport, onRejectReport, onValidateReport }) => {
    const [filter, setFilter] = useState<'all' | 'complete' | 'triaging' | 'error' | 'resolved'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
    const [sortBy, setSortBy] = useState<'newest' | 'priority'>('newest');
    const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
    const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>('all');

    const stats = useMemo(() => {
        const relevantReports = userRole === 'admin' ? reports : reports.filter(r => r.userId === user.id);
        return {
            total: relevantReports.length,
            pending: relevantReports.filter(r => r.status === 'triaging' || r.acceptanceStatus === 'pending').length,
            critical: relevantReports.filter(r => r.triageResult?.severity === 5).length,
        };
    }, [reports, userRole, user.id]);

    const categories = useMemo(() => {
        const uniqueCategories = new Set<string>();
        reports.forEach(report => {
            if (report.triageResult?.category) {
                uniqueCategories.add(report.triageResult.category);
            }
        });
        return Array.from(uniqueCategories).sort();
    }, [reports]);
    
    const neighborhoods = useMemo(() => {
        if (userRole !== 'admin') return [];
        const uniqueNeighborhoods = new Set<string>();
        allUsers.forEach(u => uniqueNeighborhoods.add(u.neighborhood));
        return Array.from(uniqueNeighborhoods).sort();
    }, [allUsers, userRole]);


    const processedReports = useMemo(() => {
        const usersInNeighborhood = userRole === 'admin' && neighborhoodFilter !== 'all'
            ? new Set(allUsers.filter(u => u.neighborhood === neighborhoodFilter).map(u => u.id))
            : null;

        return reports
            .filter(report => {
                if (userRole === 'admin' && usersInNeighborhood && !usersInNeighborhood.has(report.userId)) {
                    return false;
                }
                if (filter === 'triaging' && report.acceptanceStatus !== 'pending' && report.status !== 'triaging') return false;
                if (filter !== 'all' && filter !== 'triaging' && report.status !== filter) {
                    return false;
                }
                if (categoryFilter !== 'all' && (!report.triageResult || report.triageResult.category !== categoryFilter)) {
                    return false;
                }
                const reportDate = new Date(report.timestamp);
                if (dateRange.start) {
                    const startDate = new Date(dateRange.start + 'T00:00:00');
                    if (reportDate < startDate) return false;
                }
                if (dateRange.end) {
                    const endDate = new Date(dateRange.end + 'T00:00:00');
                    endDate.setHours(23, 59, 59, 999);
                    if (reportDate > endDate) return false;
                }
                return true;
            })
            .sort((a, b) => {
                if (sortBy === 'newest') {
                    return b.timestamp.getTime() - a.timestamp.getTime();
                }
                if (sortBy === 'priority') {
                    const priorityA = a.triageResult?.priority_score || 0;
                    const priorityB = b.triageResult?.priority_score || 0;
                    return priorityB - priorityA;
                }
                return 0;
            });
    }, [reports, filter, sortBy, categoryFilter, dateRange, userRole, neighborhoodFilter, allUsers]);
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title={userRole === 'admin' ? "Total Reports" : "My Reports"} value={stats.total} icon={<ClipboardDocumentListIcon className="w-6 h-6 text-indigo-400" />} />
                <StatCard title="Pending Review" value={stats.pending} icon={<ClockIcon className="w-6 h-6 text-cyan-400" />} />
                <StatCard title="Critical Issues" value={stats.critical} icon={<AlertTriangleIcon className="w-6 h-6 text-red-400" />} />
                <StatCard title="Your Streak" value={`${user.streak} Days`} icon={<RocketLaunchIcon className="w-6 h-6 text-amber-400" />} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 flex flex-col">
                    {userRole === 'admin' ? (
                        <div className="space-y-4 bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-white/10 mb-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
                                    <div className="flex items-center gap-1 p-1 bg-black/20 rounded-lg">
                                        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterButton>
                                        <FilterButton active={filter === 'triaging'} onClick={() => setFilter('triaging')}>Pending</FilterButton>
                                        <FilterButton active={filter === 'complete'} onClick={() => setFilter('complete')}>Done</FilterButton>
                                        <FilterButton active={filter === 'resolved'} onClick={() => setFilter('resolved')}>Resolved</FilterButton>
                                    </div>
                                </div>
                                <div className="sm:w-48">
                                    <label htmlFor="sort-by" className="block text-xs font-medium text-gray-400 mb-1.5">Sort By</label>
                                    <select
                                        id="sort-by"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as 'newest' | 'priority')}
                                        className="w-full bg-white/10 border border-white/10 rounded-md text-sm font-semibold h-9 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                    >
                                        <option value="newest">Sort by Newest</option>
                                        <option value="priority">Sort by Priority</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="neighborhood-filter" className="block text-xs font-medium text-gray-400 mb-1.5">Neighborhood</label>
                                    <select
                                        id="neighborhood-filter"
                                        value={neighborhoodFilter}
                                        onChange={(e) => setNeighborhoodFilter(e.target.value)}
                                        className="w-full bg-white/10 border border-white/10 rounded-md text-sm font-semibold h-9 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                    >
                                        <option value="all">All Neighborhoods</option>
                                        {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="category-filter" className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
                                    <select
                                        id="category-filter"
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="w-full bg-white/10 border border-white/10 rounded-md text-sm font-semibold h-9 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="start-date" className="block text-xs font-medium text-gray-400 mb-1.5">From</label>
                                    <input type="date" id="start-date" name="start" value={dateRange.start} onChange={handleDateChange} className="w-full bg-white/10 border border-white/10 rounded-md text-sm font-semibold h-9 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none" />
                                </div>
                                <div>
                                    <label htmlFor="end-date" className="block text-xs font-medium text-gray-400 mb-1.5">To</label>
                                    <input type="date" id="end-date" name="end" value={dateRange.end} onChange={handleDateChange} className="w-full bg-white/10 border border-white/10 rounded-md text-sm font-semibold h-9 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <h2 className="text-3xl font-bold text-white">My Reports</h2>
                            <p className="text-gray-400">Here are the issues you've submitted.</p>
                        </div>
                    )}
                    

                    {processedReports.length === 0 ? (
                        <div className="flex-grow flex flex-col items-center justify-center bg-white/10 rounded-lg p-8 text-center border-2 border-dashed border-white/20 mt-4 backdrop-blur-xl">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                            <h3 className="text-lg font-medium text-white">No reports to show</h3>
                            <p className="mt-1 text-sm text-gray-400">
                                {userRole === 'admin' ? 'Try adjusting the filters.' : 'Submit a new issue to get started.'}
                            </p>
                             <button onClick={onNewReport} className="mt-6 inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-500 transition-colors duration-200 shadow-lg shadow-indigo-600/30">
                                <PlusIcon className="h-5 w-5" />
                                Report a New Issue
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[65vh] lg:max-h-[calc(100vh-22rem)] overflow-y-auto pr-2 -mr-2">
                            {processedReports.map(report => (
                                <ReportCard 
                                    key={report.id} 
                                    report={report}
                                    userRole={userRole}
                                    hoveredItemId={hoveredItemId} 
                                    setHoveredItemId={setHoveredItemId} 
                                    onMarkAsResolved={onMarkAsResolved}
                                    onSubmitFeedback={onSubmitFeedback}
                                    onAcceptReport={onAcceptReport}
                                    onRejectReport={onRejectReport}
                                    onValidateReport={onValidateReport}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div className="lg:col-span-2 rounded-xl overflow-hidden h-96 lg:h-auto min-h-[500px] lg:min-h-0">
                    <InteractiveMap
                        items={processedReports}
                        hoveredItemId={hoveredItemId}
                        setHoveredItemId={setHoveredItemId}
                        mapType="report"
                    />
                </div>
            </div>
            { (reports.length > 0 || userRole === 'citizen') && (
                <button 
                    onClick={onNewReport} 
                    className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-500 transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 shadow-[0_0_20px_theme(colors.indigo.500)]"
                    aria-label="Report a new issue"
                >
                    <PlusIcon className="h-8 w-8" />
                </button>
            )}
        </div>
    );
};