'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TablePageSkeleton } from '../../components/Skeleton';
import { Pagination } from '../../components/Pagination';
import { getCache, setCache } from '../../utils/cache';
import { API_URL } from '../../config';

export default function AdminQueriesList() {
    const [stats, setStats] = useState({ total: 0, byStatus: { PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0 } });

    const [queries, setQueries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [filter, setFilter] = useState<string>('ALL');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        setMounted(true);
        const cached = getCache('admin_queries');
        const cachedStats = getCache<{ total: number; byStatus: any }>('admin_queries_stats');
        if (cached) {
            setQueries(cached as any[]);
            setLoading(false);
        }
        if (cachedStats) {
            setStats(cachedStats);
        }
    }, []);

    const fetchStats = () => {
        const token = localStorage.getItem('access_token');
        fetch(`${API_URL}/queries/stats`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setCache('admin_queries_stats', data);
            })
            .catch(err => console.error('Failed to fetch query stats', err));
    };

    const fetchQueries = async () => {
        setLoading(true);
        const token = localStorage.getItem('access_token');

        const queryParams = new URLSearchParams();
        if (filter && filter !== 'ALL') queryParams.append('status', filter);
        if (search) queryParams.append('search', search);
        queryParams.append('page', page.toString());
        queryParams.append('limit', '10');

        const url = `${API_URL}/queries?${queryParams.toString()}`;

        try {
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const response = await res.json();

            const queriesData = response.data || [];
            setQueries(queriesData);
            setTotalPages(response.meta?.lastPage || 1);
            setTotalItems(response.meta?.total || 0);

            if (filter === 'ALL' && !search && page === 1) {
                setCache('admin_queries', queriesData);
            }
            fetchStats(); // Fetch stats to update counts
        } catch (error) {
            console.error("Failed to fetch queries:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (mounted) {
            fetchQueries();
        }
    }, [page, filter, search, mounted]);

    const getStatusStyles = (status: string) => {
        const styles: any = {
            PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            RESOLVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            CLOSED: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
        };
        return styles[status] || styles.CLOSED;
    };

    // Show skeleton on first load
    if (!mounted) {
        return <TablePageSkeleton />;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/admin'}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Dashboard
                            </Button>
                        </div>
                        <h1 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="hidden sm:inline">Admin -</span> All Queries
                        </h1>
                        <div className="flex items-center gap-4">
                            <Button size="sm" onClick={() => window.location.href = '/admin/queries/create'}>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Query
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
                {/* Stats Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Total</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                        <p className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending</p>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.byStatus.PENDING || 0}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider">In Progress</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.byStatus.IN_PROGRESS || 0}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Resolved</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.byStatus.RESOLVED || 0}</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Complaint #, CNIC, or Title..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1); // Reset to page 1 on search
                            }}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all"
                        />
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6 flex gap-2 flex-wrap">
                    {(['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => {
                                setFilter(status);
                                setPage(1); // Reset to page 1 on filter change
                            }}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === status
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* Queries Table */}
                <Card noPadding>
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                                <svg className="w-6 h-6 text-emerald-600 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                            <p className="text-slate-500">Loading queries...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Complaint #</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">CNIC</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Created By</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {queries.map((query) => (
                                        <tr
                                            key={query.id}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                                            onClick={() => window.location.href = `/admin/queries/${query.id}`}
                                        >
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                    {query.complaintNumber || `#${query.id}`}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-slate-800 dark:text-white text-sm">
                                                    {query.title}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                                                {query.cnic}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        {query.user?.name || 'Unknown'}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {query.user?.role || 'N/A'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusStyles(query.status)}`}>
                                                    {query.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                {new Date(query.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button
                                                    size="xs"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent row click
                                                        window.location.href = `/admin/queries/${query.id}/edit`;
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {queries.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
                                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">No queries found</p>
                                    <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filter</p>
                                </div>
                            )}
                        </div>
                    )}
                    {queries.length > 0 && (
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            totalItems={totalItems}
                            itemsPerPage={10}
                        />
                    )}
                </Card>
            </main>

            <footer className="border-t border-slate-200 dark:border-slate-700 py-6">
                <p className="text-center text-sm text-slate-500">
                    © 2026 Call Center Management System
                </p>
            </footer>
        </div>
    );
}
