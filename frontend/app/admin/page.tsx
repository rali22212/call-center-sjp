'use client';

import { useState, useEffect } from 'react';
import { Card, StatsCard } from '../components/Card';
import { Button } from '../components/Button';
import { DashboardSkeleton } from '../components/Skeleton';
import { getCache, setCache } from '../utils/cache';
import { API_URL } from '../config';

type AdminStats = { users: number; queries: number; categories: number; pending: number };
type OnlineStats = { online: number; total: number };

export default function AdminDashboard() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<AdminStats>({ users: 0, queries: 0, categories: 0, pending: 0 });
    const [onlineStats, setOnlineStats] = useState<OnlineStats>({ online: 0, total: 0 });
    const [dataLoaded, setDataLoaded] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [systemHealth, setSystemHealth] = useState<{ status: 'OPERATIONAL' | 'ISSUE', message: string }>({ status: 'OPERATIONAL', message: 'System is operational' });

    // Load cached data on mount (client-side only)
    useEffect(() => {
        setMounted(true);
        const cachedUser = getCache('admin_user');
        const cachedStats = getCache<AdminStats>('admin_stats');
        const cachedOnline = getCache<OnlineStats>('admin_online');
        if (cachedUser) setUser(cachedUser);
        if (cachedStats) {
            setStats(cachedStats);
            setDataLoaded(true);
        }
        if (cachedOnline) setOnlineStats(cachedOnline);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        // Check System Health
        fetch(`${API_URL}/`)
            .then(res => {
                if (!res.ok) throw new Error(`Error ${res.status}`);
                setSystemHealth({ status: 'OPERATIONAL', message: 'System is operational' });
            })
            .catch(err => {
                setSystemHealth({
                    status: 'ISSUE',
                    message: `System Issue: ${err.message === 'Failed to fetch' ? 'Backend Unreachable' : err.message}`
                });
            });

        fetch(`${API_URL}/auth/profile`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                setUser(data);
                setCache('admin_user', data);
                localStorage.setItem('user_role', data.role);
                if (data.role !== 'ADMIN') {
                    window.location.href = '/agent';
                    return;
                }
            })
            .catch(() => window.location.href = '/login');

        Promise.all([
            fetch(`${API_URL}/users/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/queries/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/categories/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/users/online`, { headers: { 'Authorization': `Bearer ${token}` } }),
        ])
            .then(([usersRes, queriesRes, catsRes, onlineRes]) =>
                Promise.all([usersRes.json(), queriesRes.json(), catsRes.json(), onlineRes.json()])
            )
            .then(([userStats, queryStats, catStats, onlineData]) => {
                const newStats: AdminStats = {
                    users: userStats.total || 0,
                    queries: queryStats.total || 0,
                    categories: catStats.total || 0,
                    pending: queryStats.byStatus?.PENDING || 0,
                };
                setStats(newStats);
                setCache('admin_stats', newStats);
                const onlineResult = onlineData || { online: 0, total: 0 };
                setOnlineStats(onlineResult);
                setCache('admin_online', onlineResult);
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
                                    Admin Dashboard
                                </h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Call Center Management
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
                                        {user.name || 'Admin'} ({user.role})
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
                        Welcome back, {user.name || 'Admin'} ({user.role})! 👋
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Here's what's happening with your call center today.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                    <StatsCard
                        title="Total Queries"
                        value={stats.queries}
                        color="emerald"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
                    />
                    <StatsCard
                        title="Pending"
                        value={stats.pending}
                        color="orange"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <StatsCard
                        title="Total Users"
                        value={stats.users}
                        color="blue"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                    />
                    <StatsCard
                        title="Categories"
                        value={stats.categories}
                        color="purple"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
                    />
                </div>

                {/* Quick Actions */}
                <Card title="Quick Actions" subtitle="Manage your call center" className="mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button onClick={() => window.location.href = '/admin/queries'} className="justify-start">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            View All Queries
                        </Button>
                        <Button variant="outline" onClick={() => window.location.href = '/admin/users'} className="justify-start">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            Manage Users
                        </Button>
                        <Button variant="outline" onClick={() => window.location.href = '/admin/categories'} className="justify-start">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            Manage Categories
                        </Button>
                        <Button variant="outline" onClick={() => window.location.href = '/admin/reports'} className="justify-start">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            View Reports
                        </Button>
                    </div>
                </Card>

                {/* Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Recent Activity" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                        <div className="space-y-4">
                            {/* Active Users Indicator */}
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                        <strong>{onlineStats.online}</strong> of {onlineStats.total} users online
                                    </p>
                                </div>
                                <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-300 rounded-full font-medium">
                                    Live
                                </span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                <div className={`w-2 h-2 rounded-full ${systemHealth.status === 'OPERATIONAL' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                                <p className={`text-sm ${systemHealth.status === 'OPERATIONAL' ? 'text-slate-600 dark:text-slate-300' : 'text-red-600 dark:text-red-400 font-medium'}`}>
                                    {systemHealth.message}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{stats.queries} total queries in system</p>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{stats.pending} queries awaiting action</p>
                            </div>
                        </div>
                    </Card>

                    <Card title="Quick Tips" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}>
                        <div className="space-y-3">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                💡 Use the <strong>Reports</strong> section to export data by date range or user.
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                🔍 Search queries by complaint number for quick lookup.
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                📊 Download CSV reports for offline analysis.
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                ✏️ Click <strong>Edit</strong> on any query to update its status, priority, or category.
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                👥 Monitor user performance in Reports to identify top-performing agents.
                            </p>
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
