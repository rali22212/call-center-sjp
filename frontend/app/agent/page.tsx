'use client';

import { useEffect, useState } from 'react';
import { Card, StatsCard } from '../components/Card';
import { Button } from '../components/Button';
import { DashboardSkeleton } from '../components/Skeleton';
import { getCache, setCache } from '../utils/cache';
import { API_URL } from '../config';

type AgentStats = { total: number; pending: number; resolved: number; inProgress: number };

export default function AgentDashboard() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<AgentStats>({ total: 0, pending: 0, resolved: 0, inProgress: 0 });
    const [dataLoaded, setDataLoaded] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Load cached data on mount (client-side only)
    useEffect(() => {
        setMounted(true);
        const cachedUser = getCache('agent_user');
        const cachedStats = getCache<AgentStats>('agent_stats');
        if (cachedUser) setUser(cachedUser);
        if (cachedStats) {
            setStats(cachedStats);
            setDataLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        fetch(`${API_URL}/auth/profile`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                setUser(data);
                setCache('agent_user', data);
                localStorage.setItem('user_role', data.role);
            })
            .catch(() => window.location.href = '/login');

        fetch(`${API_URL}/queries/stats`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                const newStats = {
                    total: data.total || 0,
                    pending: data.byStatus?.PENDING || 0,
                    inProgress: data.byStatus?.IN_PROGRESS || 0,
                    resolved: data.byStatus?.RESOLVED || 0,
                };
                setStats(newStats);
                setCache('agent_stats', newStats);
                setDataLoaded(true);
            })
            .catch(err => {
                console.error('Failed to fetch stats', err);
                setDataLoaded(true);
            });
    }, [mounted]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        window.location.href = '/login';
    };

    // Show skeleton only if no data yet
    if (!user || !dataLoaded) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <img src="/logo.jpg" alt="SJP" className="w-8 h-8 rounded-lg object-cover" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-800 dark:text-white">
                                    Agent Dashboard
                                </h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Call Center Portal
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-emerald-600">
                                        {user.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                                    </span>
                                </div>
                                <div className="text-sm">
                                    <p className="font-medium text-slate-700 dark:text-slate-200">
                                        {user.name || 'Agent'} ({user.role})
                                    </p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        Hello, {user.name || 'Agent'} ({user.role})! 👋
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Ready to help customers today? Here's your overview.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <Button onClick={() => window.location.href = '/agent/create-query'} size="lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Query
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                    <StatsCard
                        title="Total Queries"
                        value={stats.total}
                        color="emerald"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                    />
                    <StatsCard
                        title="Pending"
                        value={stats.pending}
                        color="orange"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <StatsCard
                        title="In Progress"
                        value={stats.inProgress}
                        color="blue"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    />
                    <StatsCard
                        title="Resolved"
                        value={stats.resolved}
                        color="emerald"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Your Queries" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            View and manage all your queries. Filter by status and search by complaint number.
                        </p>
                        <Button onClick={() => window.location.href = '/agent/queries'}>
                            View All Queries →
                        </Button>
                    </Card>

                    <Card title="Quick Tips" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                <span className="text-lg">📝</span>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Always note the <strong>Complaint Number</strong> for reference.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <span className="text-lg">🔍</span>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Use the search bar to find queries by CNIC or complaint number.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                <span className="text-lg">✅</span>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Update query status as you work through each case.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-700 py-6">
                <p className="text-center text-sm text-slate-500">
                    © 2026 Call Center Management System • Developed by Internees
                </p>
            </footer>
        </div>
    );
}
