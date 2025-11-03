
import React, { useState, useCallback, useEffect } from 'react';
import type { Report, Prediction, Feedback, UserRole, User, Badge, UserBadge } from './types';
import { MOCK_USERS, MOCK_BADGES } from './data/mockData';
import { Header } from './components/Header';
import { ReportForm } from './components/ReportForm';
import { Dashboard } from './components/Dashboard';
import { PredictionsView } from './components/PredictionsView';
import { KanbanView } from './components/KanbanView';
import { LeaderboardView } from './components/LeaderboardView';
import { BadgesView } from './components/BadgesView';
import { AwardsModal } from './components/AwardsModal';
import { generateTriageReport } from './services/geminiService';
import { RoleSelectionModal } from './components/RoleSelectionModal';
import { useGeolocation } from './hooks/useGeolocation';

const App: React.FC = () => {
    // Existing State
    const [reports, setReports] = useState<Report[]>([]);
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [currentView, setCurrentView] = useState<'dashboard' | 'form' | 'predictions' | 'kanban' | 'leaderboard' | 'badges'>('dashboard');
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const { location: userLocation, getLocation } = useGeolocation();

    // Gamification State
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [badges, setBadges] = useState<Badge[]>(MOCK_BADGES);
    const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
    const [newlyAwardedBadge, setNewlyAwardedBadge] = useState<Badge | null>(null);
    // For demo purposes, we'll hardcode the current user.
    const currentUser = userRole === 'citizen' ? users.find(u => u.id === 'user-5') : users.find(u => u.id === 'user-1');

    useEffect(() => {
        const storedRole = localStorage.getItem('userRole') as UserRole | null;
        if (storedRole) {
            setUserRole(storedRole);
            getLocation(); // Get location once the role is set
        } else {
            setIsRoleModalOpen(true);
        }
    }, [getLocation]);

    const handleSetRole = (role: UserRole) => {
        localStorage.setItem('userRole', role);
        setUserRole(role);
        setIsRoleModalOpen(false);
        getLocation();
    };

    const handleSwitchRole = () => {
        localStorage.removeItem('userRole');
        setUserRole(null);
        setIsRoleModalOpen(true);
        setCurrentView('dashboard');
    };

    const handleCreateReport = useCallback(async (
        description: string,
        photo: { base64: string, mimeType: string, url: string },
        location: { latitude: number, longitude: number } | null,
        thinkingMode: boolean
    ) => {
        if (!currentUser) return;
        const newReport: Report = {
            id: `report-${Date.now()}`,
            userId: currentUser.id,
            description,
            photo,
            location,
            thinkingMode,
            timestamp: new Date(),
            triageResult: null,
            groundingChunks: null,
            status: 'triaging',
            kanbanStatus: 'pending',
            acceptanceStatus: 'pending',
            validatedAt: null,
        };

        setReports(prev => [newReport, ...prev]);
        setCurrentView('dashboard');

        try {
            const { triageResult, groundingChunks } = await generateTriageReport(
                description,
                { base64: photo.base64, mimeType: photo.mimeType },
                location,
                thinkingMode
            );
            
            setReports(prev => prev.map(r => r.id === newReport.id ? { ...r, status: 'complete', triageResult, groundingChunks } : r));

        } catch (error) {
            console.error("Failed to triage report:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setReports(prev => prev.map(r => r.id === newReport.id ? { ...r, status: 'error', errorMessage } : r));
        }
    }, [currentUser]);

    const handleValidateReport = useCallback((reportId: string) => {
        let awardedBadge: Badge | null = null;

        setReports(prevReports => {
            const newReports = prevReports.map(r => {
                if (r.id === reportId && !r.validatedAt) {
                    return { ...r, validatedAt: new Date(), acceptanceStatus: 'accepted' as const, status: 'resolved' as const, kanbanStatus: 'done' as const };
                }
                return r;
            });

            const report = newReports.find(r => r.id === reportId);
            if (!report) return prevReports;

            setUsers(prevUsers => {
                const newUsers = prevUsers.map(u => {
                    if (u.id === report.userId) {
                        const today = new Date().toISOString().split('T')[0];
                        const lastValidation = u.lastValidationDate;
                        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                        
                        let newStreak = u.streak;
                        if (lastValidation === yesterday) {
                            newStreak += 1; // Continue streak
                        } else if (lastValidation !== today) {
                            newStreak = 1; // New or broken streak
                        }
                        
                        return {
                            ...u,
                            credits: u.credits + 10,
                            streak: newStreak,
                            lastValidationDate: today,
                        };
                    }
                    return u;
                });

                // Check for badges after state updates
                const updatedUser = newUsers.find(u => u.id === report.userId);
                const validatedReportsCount = newReports.filter(r => r.userId === report.userId && r.validatedAt).length;

                if (updatedUser) {
                    badges.forEach(badge => {
                        const hasBadge = userBadges.some(ub => ub.badgeId === badge.id && ub.userId === updatedUser.id);
                        if (hasBadge) return;

                        let criteriaMet = false;
                        if (badge.criteria.type === 'validated_count' && validatedReportsCount >= badge.criteria.threshold) {
                            criteriaMet = true;
                        } else if (badge.criteria.type === 'streak_length' && updatedUser.streak >= badge.criteria.threshold) {
                            criteriaMet = true;
                        }

                        if (criteriaMet) {
                            setUserBadges(prev => [...prev, { userId: updatedUser.id, badgeId: badge.id, awardedAt: new Date() }]);
                            awardedBadge = badge;
                        }
                    });
                }
                return newUsers;
            });
            return newReports;
        });

        if (awardedBadge) {
            setNewlyAwardedBadge(awardedBadge);
        }
    }, [badges, userBadges]);


    const handleAcceptReport = useCallback((reportId: string) => {
        setReports(prev => prev.map(r => 
            r.id === reportId ? { ...r, acceptanceStatus: 'accepted' } : r
        ));
    }, []);

    const handleRejectReport = useCallback((reportId: string) => {
        const reason = prompt("Optional: Please provide a reason for rejecting this report.");
        setReports(prev => prev.map(r => 
            r.id === reportId ? { ...r, acceptanceStatus: 'rejected', rejectionReason: reason || undefined, kanbanStatus: 'done' } : r
        ));
    }, []);


    const handleMarkAsResolved = useCallback((reportId: string) => {
        setReports(prev => prev.map(r => 
            r.id === reportId ? { ...r, status: 'resolved', kanbanStatus: 'done' } : r
        ));
    }, []);

    const handleSubmitFeedback = useCallback((reportId: string, feedback: Feedback) => {
        setReports(prev => prev.map(r =>
            r.id === reportId ? { ...r, feedback } : r
        ));
    }, []);
    
    const handleUpdateKanbanStatus = useCallback((reportId: string, newStatus: Report['kanbanStatus']) => {
        setReports(prev => prev.map(r => 
            r.id === reportId ? { ...r, kanbanStatus: newStatus } : r
        ));
    }, []);

    const renderContent = () => {
        if (!userRole || !currentUser) return null;

        switch (currentView) {
            case 'dashboard':
                return <Dashboard 
                    reports={reports.filter(r => userRole === 'citizen' ? r.userId === currentUser.id : true)} 
                    user={currentUser}
                    allUsers={users}
                    userRole={userRole}
                    onNewReport={() => setCurrentView('form')} 
                    onMarkAsResolved={userRole === 'admin' ? handleMarkAsResolved : undefined} 
                    onSubmitFeedback={handleSubmitFeedback}
                    onAcceptReport={userRole === 'admin' ? handleAcceptReport : undefined}
                    onRejectReport={userRole === 'admin' ? handleRejectReport : undefined}
                    onValidateReport={userRole === 'admin' ? handleValidateReport : undefined}
                />;
            case 'form':
                return <ReportForm onSubmit={handleCreateReport} onCancel={() => setCurrentView('dashboard')} />;
            case 'predictions':
                return <PredictionsView predictions={predictions} setPredictions={setPredictions} userLocation={userLocation} />;
            case 'kanban':
                return <KanbanView reports={reports} userRole={userRole} onUpdateStatus={handleUpdateKanbanStatus} />;
            case 'leaderboard':
                return <LeaderboardView users={users} currentUser={currentUser} userRole={userRole} />;
            case 'badges':
                return <BadgesView badges={badges} userBadges={userBadges.filter(ub => ub.userId === currentUser.id)} />;
            default:
                return <Dashboard 
                    reports={reports} 
                    user={currentUser}
                    allUsers={users}
                    userRole={userRole} 
                    onNewReport={() => setCurrentView('form')} 
                    onMarkAsResolved={userRole === 'admin' ? handleMarkAsResolved : undefined}
                    onSubmitFeedback={handleSubmitFeedback}
                    onAcceptReport={userRole === 'admin' ? handleAcceptReport : undefined}
                    onRejectReport={userRole === 'admin' ? handleRejectReport : undefined}
                    onValidateReport={userRole === 'admin' ? handleValidateReport : undefined}
                />;
        }
    };

    return (
        <div className="min-h-screen bg-transparent text-gray-100 flex flex-col">
             {isRoleModalOpen && <RoleSelectionModal onSelectRole={handleSetRole} />}
             {userRole && currentUser && (
                <Header 
                    currentView={currentView} 
                    setCurrentView={setCurrentView} 
                    userRole={userRole} 
                    onSwitchRole={handleSwitchRole}
                    user={currentUser}
                />
             )}
            <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 max-w-screen-2xl">
                {renderContent()}
            </main>
            {newlyAwardedBadge && (
                <AwardsModal badge={newlyAwardedBadge} onClose={() => setNewlyAwardedBadge(null)} />
            )}
        </div>
    );
};

export default App;
