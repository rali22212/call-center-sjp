'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { API_URL } from '../../../../config';

export default function QueryReportPDF() {
    const params = useParams();
    const id = params.id;
    const [query, setQuery] = useState<any>(null);
    const [remarks, setRemarks] = useState<any[]>([]);
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
            .then(data => setRemarks(Array.isArray(data) ? data : []));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading report...</p>
                </div>
            </div>
        );
    }

    if (!query) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Query Not Found</h2>
                    <p className="text-gray-500">Unable to generate report.</p>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        const colors: any = {
            PENDING: '#f59e0b',
            IN_PROGRESS: '#3b82f6',
            RESOLVED: '#10b981',
            CLOSED: '#6b7280',
        };
        return colors[status] || '#6b7280';
    };

    const getPriorityColor = (priority: string) => {
        const colors: any = {
            LOW: '#10b981',
            MEDIUM: '#f59e0b',
            HIGH: '#ef4444',
            URGENT: '#dc2626',
        };
        return colors[priority] || '#6b7280';
    };

    return (
        <>
            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .no-print { display: none !important; }
                    .page-break { page-break-before: always; }
                }
                @page { margin: 0.5in; size: A4; }
            `}</style>

            <div className="min-h-screen bg-white">
                {/* Print Button - Hidden when printing */}
                <div className="no-print fixed top-4 right-4 flex gap-2 z-50">
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print / Save as PDF
                    </button>
                    <button
                        onClick={() => window.close()}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>

                {/* Report Content */}
                <div className="max-w-4xl mx-auto py-8 px-8">
                    {/* Header */}
                    <div className="border-b-4 border-emerald-600 pb-6 mb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                    Query Report
                                </h1>
                                <p className="text-lg text-gray-600">
                                    {query.complaintNumber || `Query #${query.id}`}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500 mb-2">Generated On</div>
                                <div className="text-gray-900 font-medium">
                                    {new Date().toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status and Priority Badges */}
                    <div className="flex gap-4 mb-8">
                        <div
                            className="px-4 py-2 rounded-lg text-white font-medium"
                            style={{ backgroundColor: getStatusColor(query.status) }}
                        >
                            Status: {query.status?.replace('_', ' ')}
                        </div>
                        <div
                            className="px-4 py-2 rounded-lg text-white font-medium"
                            style={{ backgroundColor: getPriorityColor(query.priority) }}
                        >
                            Priority: {query.priority}
                        </div>
                    </div>

                    {/* Query Details Section */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 mb-8 border border-emerald-200">
                        <h2 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Query Information
                        </h2>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">{query.title}</h3>
                        <p className="text-gray-700 mb-6 leading-relaxed">{query.description || 'No description provided.'}</p>
                    </div>

                    {/* Customer Details */}
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Customer Details
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">CNIC Number</label>
                                <p className="text-xl font-semibold text-gray-900 mt-1">{query.cnic}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                                <p className="text-xl font-semibold text-gray-900 mt-1">{query.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Category and Assignment */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                            <h3 className="text-sm font-medium text-purple-600 uppercase tracking-wide mb-2">Category</h3>
                            <p className="text-xl font-semibold text-purple-900">{query.category?.name || 'Uncategorized'}</p>
                        </div>
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                            <h3 className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-2">Assigned Agent</h3>
                            <p className="text-xl font-semibold text-blue-900">{query.user?.name || 'Unassigned'}</p>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Timeline
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Created</p>
                                    <p className="font-semibold text-gray-900">
                                        {new Date(query.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Last Updated</p>
                                    <p className="font-semibold text-gray-900">
                                        {new Date(query.updatedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Remarks History */}
                    {remarks.length > 0 && (
                        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                Remarks & Updates ({remarks.length})
                            </h2>
                            <div className="space-y-4">
                                {remarks.map((remark, index) => (
                                    <div
                                        key={remark.id}
                                        className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border-l-4 border-indigo-500"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                                                    {index + 1}
                                                </span>
                                                <span className="font-semibold text-indigo-900">
                                                    {remark.user?.name || 'Agent'}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {new Date(remark.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed pl-8">{remark.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-12 pt-6 border-t-2 border-gray-200 text-center text-gray-500 text-sm">
                        <p>This report was generated from the Call Center Management System</p>
                        <p className="mt-1">© {new Date().getFullYear()} - All Rights Reserved</p>
                    </div>
                </div>
            </div>
        </>
    );
}
