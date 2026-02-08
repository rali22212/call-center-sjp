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
    const [showReport, setShowReport] = useState(false);

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
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium text-gray-500">Customer Name</label>
                                        <p className="text-gray-900 dark:text-white mt-1 text-lg font-semibold">{query.customerName || 'Candidate'}</p>
                                    </div>
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
                            {/* View Report as PDF - Always available */}
                            <div className="mb-4">
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={() => setShowReport(true)}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    View Report as PDF
                                </Button>
                            </div>

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

            {/* PDF Report Modal Overlay with Dark Theme */}
            {showReport && (
                <div className="fixed inset-0 z-50 overflow-auto bg-slate-900/95 backdrop-blur-sm">
                    {/* Close Button */}
                    <div className="fixed top-4 right-4 z-50 flex gap-2">
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Save as PDF
                        </button>
                        <button
                            onClick={() => setShowReport(false)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>

                    {/* Report Content */}
                    <div className="max-w-3xl mx-auto py-16 px-6">
                        {/* Header with emerald gradient */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-5 mb-4 text-white shadow-lg print:shadow-none">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-bold mb-1">Query Report</h1>
                                    <p className="text-emerald-100 text-lg font-mono">
                                        {query.complaintNumber || `#${query.id}`}
                                    </p>
                                </div>
                                <div className="text-right text-sm">
                                    <p className="text-emerald-200">Generated</p>
                                    <p className="font-medium">
                                        {new Date().toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status & Priority Row */}
                        <div className="flex gap-3 mb-4">
                            <div className={`flex-1 px-4 py-2 rounded-lg text-center font-semibold text-sm ${query.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300' :
                                    query.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' :
                                        query.status === 'RESOLVED' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
                                            'bg-gray-100 text-gray-800 border-2 border-gray-300'
                                }`}>
                                Status: {query.status?.replace('_', ' ')}
                            </div>
                            <div className={`flex-1 px-4 py-2 rounded-lg text-center font-semibold text-sm ${query.priority === 'LOW' ? 'bg-green-100 text-green-800' :
                                    query.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                        query.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                            'bg-red-200 text-red-900'
                                }`}>
                                Priority: {query.priority}
                            </div>
                        </div>

                        {/* Query Info */}
                        <div className="bg-white rounded-xl border border-emerald-200 p-4 mb-4 shadow-sm">
                            <h2 className="text-sm font-bold text-emerald-700 uppercase tracking-wide mb-2">Query Information</h2>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{query.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{query.description || 'No description provided.'}</p>
                        </div>

                        {/* Customer Details */}
                        <div className="bg-white rounded-xl border border-emerald-200 p-4 mb-4 shadow-sm">
                            <h2 className="text-sm font-bold text-emerald-700 uppercase tracking-wide mb-3">Customer Details</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-emerald-600 font-medium uppercase">Customer Name</p>
                                    <p className="text-lg font-bold text-gray-900">{query.customerName || 'Candidate'}</p>
                                </div>
                                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-emerald-600 font-medium uppercase">CNIC</p>
                                    <p className="text-lg font-bold text-gray-900 font-mono">{query.cnic}</p>
                                </div>
                                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-emerald-600 font-medium uppercase">Phone</p>
                                    <p className="text-lg font-bold text-gray-900">{query.phone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Category & Agent Row */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                                <p className="text-xs text-purple-600 font-medium uppercase">Category</p>
                                <p className="text-base font-bold text-purple-900">{query.category?.name || 'Uncategorized'}</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                                <p className="text-xs text-blue-600 font-medium uppercase">Assigned Agent</p>
                                <p className="text-base font-bold text-blue-900">{query.user?.name || 'Unassigned'}</p>
                            </div>
                        </div>

                        {/* Timeline Row */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-white rounded-xl p-3 border border-gray-200 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Created</p>
                                    <p className="font-semibold text-gray-900 text-sm">
                                        {new Date(query.createdAt).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-gray-200 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Last Updated</p>
                                    <p className="font-semibold text-gray-900 text-sm">
                                        {new Date(query.updatedAt).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Remarks */}
                        {remarks.length > 0 && (
                            <div className="bg-white rounded-xl border border-emerald-200 p-4 mb-4 shadow-sm">
                                <h2 className="text-sm font-bold text-emerald-700 uppercase tracking-wide mb-3">
                                    Remarks ({remarks.length})
                                </h2>
                                <div className="space-y-2">
                                    {remarks.slice(0, 3).map((remark: any) => (
                                        <div key={remark.id} className="bg-gray-50 rounded-lg p-3 border-l-4 border-emerald-500">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-semibold text-gray-900 text-sm">
                                                    {remark.user?.name || 'Agent'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(remark.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short', day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm">{remark.content}</p>
                                        </div>
                                    ))}
                                    {remarks.length > 3 && (
                                        <p className="text-xs text-gray-500 text-center">+ {remarks.length - 3} more remarks</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="bg-emerald-600 rounded-lg p-3 text-center text-white text-xs">
                            <p className="font-medium">Call Center Management System</p>
                            <p className="text-emerald-200">© {new Date().getFullYear()} - Official Query Report</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
