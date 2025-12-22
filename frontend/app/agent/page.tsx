'use client';

import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { API_URL } from '../config';

export default function AgentDashboard() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        // Fetch user profile
        fetch(`${API_URL}/auth/profile`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                setUser(data);
                // Store role for consistency
                localStorage.setItem('user_role', data.role);
            })
            .catch(() => window.location.href = '/login');

        // Fetch query stats
        fetch('http://localhost:3000/queries', {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(queries => {
                setStats({
                    total: queries.length,
                    pending: queries.filter((q: any) => q.status === 'PENDING').length,
                    resolved: queries.filter((q: any) => q.status === 'RESOLVED').length,
                });
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
    };

    if (!user) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Navigation */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-3">
                            <img src="/logo.jpg" alt="SJP Logo" className="w-10 h-10 rounded-full" />
                            <h1 className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                Agent Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="hidden sm:block text-gray-700 dark:text-gray-300">{user.email}</span>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Quick Actions */}
                <div className="mb-8">
                    <Button onClick={() => window.location.href = '/agent/create-query'}>
                        + Create New Query
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card title="Total Queries">
                        <p className="text-4xl font-bold text-emerald-600">{stats.total}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">All time</p>
                    </Card>

                    <Card title="Pending">
                        <p className="text-4xl font-bold text-yellow-600">{stats.pending}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Awaiting action</p>
                    </Card>

                    <Card title="Resolved">
                        <p className="text-4xl font-bold text-green-600">{stats.resolved}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Completed</p>
                    </Card>
                </div>

                {/* Recent Queries */}
                <Card title="Recent Queries">
                    <Button onClick={() => window.location.href = '/agent/queries'}>
                        View All Queries →
                    </Button>
                </Card>
            </div>

            {/* Footer */}
            <footer className="text-center py-6 text-sm text-gray-500">
                Developed by Call Center Internees
            </footer>
        </div>
    );
}
