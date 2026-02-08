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
            <div className="min-h-screen flex items-center justify-center bg-emerald-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-emerald-700">Loading report...</p>
                </div>
            </div>
        );
    }

    if (!query) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-emerald-50">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Query Not Found</h2>
                    <p className="text-gray-500">Unable to generate report.</p>
                </div>
            </div>
        );
    }

    const getStatusStyle = (status: string) => {
        const styles: any = {
            PENDING: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
            IN_PROGRESS: { bg: '#dbeafe', text: '#1e40af', border: '#60a5fa' },
            RESOLVED: { bg: '#d1fae5', text: '#065f46', border: '#34d399' },
            CLOSED: { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' },
        };
        return styles[status] || styles.PENDING;
    };

    const getPriorityStyle = (priority: string) => {
        const styles: any = {
            LOW: { bg: '#d1fae5', text: '#065f46' },
            MEDIUM: { bg: '#fef3c7', text: '#92400e' },
            HIGH: { bg: '#fee2e2', text: '#991b1b' },
            URGENT: { bg: '#fecaca', text: '#7f1d1d' },
        };
        return styles[priority] || styles.MEDIUM;
    };

    const statusStyle = getStatusStyle(query.status);
    const priorityStyle = getPriorityStyle(query.priority);

    return (
        <>
            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body { 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important; 
                        background: white !important;
                    }
                    .no-print { display: none !important; }
                    .print-container { 
                        padding: 0 !important; 
                        max-width: 100% !important;
                    }
                }
                @page { 
                    margin: 0.4in; 
                    size: A4; 
                }
            `}</style>

            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
                {/* Print Button */}
                <div className="no-print fixed top-4 right-4 flex gap-2 z-50">
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
                        onClick={() => window.close()}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>

                {/* Report Content - Compact for 1 page */}
                <div className="print-container max-w-3xl mx-auto py-6 px-6">
                    {/* Header with emerald gradient */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-5 mb-4 text-white shadow-lg">
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
                        <div
                            className="flex-1 px-4 py-2 rounded-lg text-center font-semibold text-sm"
                            style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, border: `2px solid ${statusStyle.border}` }}
                        >
                            Status: {query.status?.replace('_', ' ')}
                        </div>
                        <div
                            className="flex-1 px-4 py-2 rounded-lg text-center font-semibold text-sm"
                            style={{ backgroundColor: priorityStyle.bg, color: priorityStyle.text }}
                        >
                            Priority: {query.priority}
                        </div>
                    </div>

                    {/* Query Info */}
                    <div className="bg-white rounded-xl border border-emerald-200 p-4 mb-4 shadow-sm">
                        <h2 className="text-sm font-bold text-emerald-700 uppercase tracking-wide mb-2">Query Information</h2>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{query.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{query.description || 'No description provided.'}</p>
                    </div>

                    {/* Customer Details - WITH Customer Name */}
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
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex items-center gap-3">
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
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex items-center gap-3">
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

                    {/* Remarks - Compact */}
                    {remarks.length > 0 && (
                        <div className="bg-white rounded-xl border border-emerald-200 p-4 mb-4 shadow-sm">
                            <h2 className="text-sm font-bold text-emerald-700 uppercase tracking-wide mb-3">
                                Remarks ({remarks.length})
                            </h2>
                            <div className="space-y-2">
                                {remarks.slice(0, 3).map((remark, index) => (
                                    <div key={remark.id} className="bg-gray-50 rounded-lg p-3 border-l-3 border-emerald-500">
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
        </>
    );
}

