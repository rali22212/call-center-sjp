'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';

export default function AdminQueryDetailPage() {
    const params = useParams();
    const id = params.id;
    const [query, setQuery] = useState<any>(null);
    const [remarks, setRemarks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');

        // Fetch query details with user info
        fetch(`http://localhost:3000/queries/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                setQuery(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));

        // Fetch remarks
        fetch(`http://localhost:3000/remarks?queryId=${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setRemarks(data));
    }, [id]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this query? This cannot be undone.')) return;

        const token = localStorage.getItem('access_token');
        try {
            await fetch(`http://localhost:3000/queries/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            window.location.href = '/admin/queries';
        } catch (error) {
            alert('Failed to delete query');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading query...</p>
                </div>
            </div>
        );
    }

    if (!query) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Query Not Found</h2>
                    <Button onClick={() => window.location.href = '/admin/queries'}>
                        ← Back to Queries
                    </Button>
                </Card>
            </div>
        );
    }

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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-6 flex gap-4">
                    <Button variant="outline" onClick={() => window.location.href = '/admin'}>
                        ← Back to Dashboard
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = '/admin/queries'}>
                        ← Back to Queries
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Query Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {query.title}
                                    </h1>
                                    <p className="text-sm text-gray-500">Query #{query.id}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(query.status)}`}>
                                    {query.status}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Description / Reason</label>
                                    <p className="text-gray-900 dark:text-white mt-1">{query.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">CNIC</label>
                                        <p className="text-gray-900 dark:text-white mt-1">{query.cnic}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Phone</label>
                                        <p className="text-gray-900 dark:text-white mt-1">{query.phone}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Category</label>
                                        <p className="text-gray-900 dark:text-white mt-1">{query.category?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Priority</label>
                                        <p className="text-gray-900 dark:text-white mt-1">{query.priority}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Remarks Section */}
                        <Card title="Remarks History">
                            <div className="space-y-4">
                                {remarks.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No remarks yet</p>
                                ) : (
                                    remarks.map((remark) => (
                                        <div key={remark.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {remark.user?.name || 'Agent'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{remark.user?.email}</p>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(remark.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300">{remark.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Admin Sidebar */}
                    <div className="space-y-6">
                        <Card title="Audit Information">
                            <div className="space-y-3 text-sm">
                                <div>
                                    <label className="text-gray-500 font-medium">Created By</label>
                                    <p className="text-gray-900 dark:text-white mt-1">
                                        {query.user?.name || 'Unknown'}
                                    </p>
                                    <p className="text-xs text-gray-500">{query.user?.email}</p>
                                </div>
                                <div>
                                    <label className="text-gray-500 font-medium">Role</label>
                                    <p className="text-gray-900 dark:text-white mt-1">
                                        {query.user?.role || 'N/A'}
                                    </p>
                                </div>
                                <div className="pt-3 border-t">
                                    <label className="text-gray-500 font-medium">Created On</label>
                                    <p className="text-gray-900 dark:text-white mt-1">
                                        {new Date(query.createdAt).toLocaleString('en-US', {
                                            dateStyle: 'full',
                                            timeStyle: 'short'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-gray-500 font-medium">Last Updated</label>
                                    <p className="text-gray-900 dark:text-white mt-1">
                                        {new Date(query.updatedAt).toLocaleString('en-US', {
                                            dateStyle: 'full',
                                            timeStyle: 'short'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card title="Admin Actions">
                            <div className="space-y-3">
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={() => window.location.href = `/agent/queries/${id}`}
                                >
                                    View as Agent
                                </Button>
                                <Button
                                    className="w-full"
                                    variant="danger"
                                    onClick={handleDelete}
                                >
                                    Delete Query
                                </Button>
                            </div>
                        </Card>

                        <Card title="Statistics">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Total Remarks</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{remarks.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Status</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{query.status}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
