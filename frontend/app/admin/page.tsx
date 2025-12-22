'use client';

import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export default function AdminDashboard() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({ users: 0, queries: 0, categories: 0 });

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        // Fetch user profile
        fetch('http://localhost:3000/auth/profile', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                setUser(data);
                localStorage.setItem('user_role', data.role);
                if (data.role !== 'ADMIN') {
                    window.location.href = '/agent';
                    return;
                }
            })
            .catch(() => window.location.href = '/login');

        // Fetch stats
        Promise.all([
            fetch('http://localhost:3000/users', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('http://localhost:3000/queries', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('http://localhost:3000/categories', { headers: { 'Authorization': `Bearer ${token}` } }),
        ])
            .then(([usersRes, queriesRes, catsRes]) =>
                Promise.all([usersRes.json(), queriesRes.json(), catsRes.json()])
            )
            .then(([users, queries, categories]) => {
                setStats({
                    users: users.length,
                    queries: queries.length,
                    categories: categories.length,
                });
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        window.location.href = '/login';
    };

    if (!user) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Navigation */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-3">
                            <img src="/logo.jpg" alt="SJP Logo" className="w-10 h-10 rounded-full" />
                            <h1 className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                Admin Dashboard
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
            <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    <Card title="Total Users">
                        <p className="text-3xl sm:text-4xl font-bold text-emerald-600">{stats.users}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 w-full sm:w-auto"
                            onClick={() => window.location.href = '/admin/users'}
                        >
                            Manage Users →
                        </Button>
                    </Card>

                    <Card title="Total Queries">
                        <p className="text-3xl sm:text-4xl font-bold text-blue-600">{stats.queries}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 w-full sm:w-auto"
                            onClick={() => window.location.href = '/admin/queries'}
                        >
                            View Queries →
                        </Button>
                    </Card>

                    <Card title="Categories">
                        <p className="text-3xl sm:text-4xl font-bold text-purple-600">{stats.categories}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 w-full sm:w-auto"
                            onClick={() => window.location.href = '/admin/categories'}
                        >
                            Manage Categories →
                        </Button>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card title="Quick Actions">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Button onClick={() => window.location.href = '/admin/queries/create'}>
                            ➕ Create New Query
                        </Button>
                        <Button onClick={() => window.location.href = '/admin/users'}>
                            👥 Manage Users
                        </Button>
                        <Button onClick={() => window.location.href = '/admin/categories'}>
                            📁 Manage Categories
                        </Button>
                        <Button onClick={() => window.location.href = '/admin/reports'}>
                            📊 View Reports
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Footer */}
            <footer className="text-center py-6 text-sm text-gray-500">
                Developed by Call Center Internees
            </footer>
        </div>
    );
}
