'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export default function QueriesList() {
    const [queries, setQueries] = useState<any[]>([]);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const url = filter === 'ALL'
            ? 'http://localhost:3000/queries'
            : `http://localhost:3000/queries?status=${filter}`;

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

    const getPriorityColor = (priority: string) => {
        const colors: any = {
            LOW: 'text-gray-600',
            MEDIUM: 'text-blue-600',
            HIGH: 'text-orange-600',
            URGENT: 'text-red-600',
        };
        return colors[priority] || 'text-gray-600';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-6 flex justify-between items-center">
                    <Button variant="outline" onClick={() => window.location.href = '/agent'}>
                        ← Back to Dashboard
                    </Button>
                    <Button onClick={() => window.location.href = '/agent/create-query'}>
                        + Create Query
                    </Button>
                </div>

                <Card>
                    <div className="mb-6">
                        <div className="flex gap-2">
                            {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === status
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
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNIC</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {queries.map((query) => (
                                    <tr
                                        key={query.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                                        onClick={() => window.location.href = `/agent/queries/${query.id}`}
                                    >
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">#{query.id}</td>
                                        <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">{query.title}</td>
                                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{query.cnic}</td>
                                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {query.category?.name || 'N/A'}
                                        </td>
                                        <td className={`px-4 py-4 text-sm font-semibold ${getPriorityColor(query.priority)}`}>
                                            {query.priority}
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
        </div>
    );
}
