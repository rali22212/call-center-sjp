'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { API_URL } from '../../config';

export default function AdminQueriesList() {
    const [queries, setQueries] = useState<any[]>([]);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const url = filter === 'ALL'
            ? `${API_URL}/queries`
            : `${API_URL}/queries?status=${filter}`;

        fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setQueries(data));
    }, [filter]);

    const getStatusColor = (status: string) => {
        const colors: any = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            IN_PROGRESS: 'bg-blue-100 text-blue-800',
            RESOLVED: 'bg-green-100 text-green-800',
            CLOSED: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Navigation */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-3">
                            <img src="/logo.jpg" alt="SJP Logo" className="w-10 h-10 rounded-full" />
                            <h1 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                Admin - All Queries
                            </h1>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex-1 max-w-7xl mx-auto px-4 w-full py-8">
                <div className="mb-6">
                    <Button variant="outline" onClick={() => window.location.href = '/admin'}>
                        ← Back to Admin Dashboard
                    </Button>
                </div>

                <Card>
                    <div className="mb-6 overflow-x-auto">
                        <div className="flex gap-2 min-w-max">
                            {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${filter === status
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white'
                                        }`}
                                >
                                    {status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {queries.map((query) => (
                                    <tr
                                        key={query.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                                        onClick={() => window.location.href = `/admin/queries/${query.id}`}
                                    >
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">#{query.id}</td>
                                        <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">{query.title}</td>
                                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {query.user?.name || 'Unknown'} ({query.user?.role || 'N/A'})
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(query.status)}`}>
                                                {query.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(query.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {queries.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No queries found</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <footer className="text-center py-6 text-sm text-gray-500">
                Developed by Call Center Internees
            </footer>
        </div>
    );
}
