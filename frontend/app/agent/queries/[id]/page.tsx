'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { API_URL } from '../../../config';

export default function QueryDetailPage() {
    const params = useParams();
    const id = params.id;
    const [query, setQuery] = useState<any>(null);
    const [remarks, setRemarks] = useState<any[]>([]);
    const [newRemark, setNewRemark] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');

        // Fetch query details
        fetch(`${API_URL}/queries/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                setQuery(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));

        // Fetch remarks
        fetch(`${API_URL}/remarks?queryId=${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setRemarks(data));
    }, [id]);

    const handleStatusUpdate = async (newStatus: string) => {
        const token = localStorage.getItem('access_token');
        try {
            await fetch(`${API_URL}/queries/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });
            setQuery({ ...query, status: newStatus });
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const handleAddRemark = async () => {
        if (!newRemark.trim()) return;

        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`${API_URL}/remarks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    queryId: parseInt(id as string),
                    content: newRemark,
                }),
            });
            const newRemarkData = await response.json();
            setRemarks([...remarks, newRemarkData]);
            setNewRemark('');
        } catch (error) {
            alert('Failed to add remark');
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
                    <Button onClick={() => window.location.href = '/agent/queries'}>
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
                <div className="mb-6">
                    <Button variant="outline" onClick={() => window.location.href = '/agent/queries'}>
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
                                    <label className="text-sm font-medium text-gray-500">Description</label>
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
                        <Card title="Remarks & Updates">
                            <div className="space-y-4 mb-6">
                                {remarks.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No remarks yet</p>
                                ) : (
                                    remarks.map((remark) => (
                                        <div key={remark.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {remark.user?.name || 'Agent'}
                                                </p>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(remark.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300">{remark.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    rows={3}
                                    placeholder="Add a remark or update..."
                                    value={newRemark}
                                    onChange={(e) => setNewRemark(e.target.value)}
                                />
                                <div className="mt-2">
                                    <Button onClick={handleAddRemark}>Add Remark</Button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Actions Sidebar */}
                    <div className="space-y-6">
                        <Card title="Actions">
                            {query.status === 'CLOSED' ? (
                                <div className="text-center py-4">
                                    <p className="text-gray-500">This query is closed.</p>
                                    <p className="text-sm text-gray-400 mt-2">No further actions available.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {query.status !== 'IN_PROGRESS' && (
                                        <Button
                                            className="w-full"
                                            onClick={() => handleStatusUpdate('IN_PROGRESS')}
                                        >
                                            Start Working
                                        </Button>
                                    )}
                                    {query.status !== 'RESOLVED' && (
                                        <Button
                                            className="w-full"
                                            variant="outline"
                                            onClick={() => handleStatusUpdate('RESOLVED')}
                                        >
                                            Mark as Resolved
                                        </Button>
                                    )}
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => handleStatusUpdate('CLOSED')}
                                    >
                                        Close Query
                                    </Button>
                                </div>
                            )}
                        </Card>

                        <Card title="Information">
                            <div className="space-y-3 text-sm">
                                <div>
                                    <label className="text-gray-500">Created</label>
                                    <p className="text-gray-900 dark:text-white">
                                        {new Date(query.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-gray-500">Last Updated</label>
                                    <p className="text-gray-900 dark:text-white">
                                        {new Date(query.updatedAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
