'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, StatsCard } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Pagination } from '../../components/Pagination';
import { API_URL } from '../../config';

export default function AdminReports() {
    const [stats, setStats] = useState<any>(null);
    const [queries, setQueries] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);

    // Detailed Queries Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    // User Performance Pagination
    const [reportUsers, setReportUsers] = useState<any[]>([]);
    const [reportUsersLoading, setReportUsersLoading] = useState(false);
    const [usersPage, setUsersPage] = useState(1);
    const [usersTotalPages, setUsersTotalPages] = useState(1);
    const [usersTotalItems, setUsersTotalItems] = useState(0);
    const [usersSearch, setUsersSearch] = useState('');

    // Category Stats Pagination
    const [reportCategories, setReportCategories] = useState<any[]>([]);
    const [reportCategoriesLoading, setReportCategoriesLoading] = useState(false);
    const [categoriesPage, setCategoriesPage] = useState(1);
    const [categoriesTotalPages, setCategoriesTotalPages] = useState(1);
    const [categoriesTotalItems, setCategoriesTotalItems] = useState(0);
    const [categoriesSearch, setCategoriesSearch] = useState('');

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedUser, setSelectedUser] = useState('ALL');

    // Initial load of stats and metadata
    useEffect(() => {
        const token = localStorage.getItem('access_token');

        Promise.all([
            fetch(`${API_URL}/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/categories`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/queries/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        ])
            .then(([usersRes, catsRes, statsRes]) =>
                Promise.all([usersRes.json(), catsRes.json(), statsRes.json()])
            )
            .then(([usersResponse, categoriesResponse, statsData]) => {
                // Handle paginated responses
                const usersTotal = usersResponse.meta?.total || 0;
                const catsTotal = categoriesResponse.meta?.total || 0;

                // Construct stats with correct totals
                const enrichedStats = {
                    ...statsData,
                    byCategory: statsData.byCategory || [],
                    byUser: statsData.byUser || [],
                    users: usersTotal,
                    categories: catsTotal
                };

                setStats(enrichedStats);
                setLoading(false);
            });
    }, []);

    // Fetch paginated queries when filters or page changes
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        setTableLoading(true);

        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('limit', '10');
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
        if (selectedUser !== 'ALL') queryParams.append('userId', selectedUser);
        if (searchQuery) queryParams.append('search', searchQuery);

        fetch(`${API_URL}/queries?${queryParams.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(response => {
                setQueries(response.data || []);
                setTotalPages(response.meta?.lastPage || 1);
                setTotalItems(response.meta?.total || 0);
                setTableLoading(false);
            });
    }, [page, startDate, endDate, selectedUser, searchQuery]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [startDate, endDate, selectedUser, searchQuery]);

    const downloadCSV = async () => {
        const token = localStorage.getItem('access_token');
        const queryParams = new URLSearchParams();
        // Fetch all matching records for export (limit 1000 up to max)
        queryParams.append('limit', '1000');
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
        if (selectedUser !== 'ALL') queryParams.append('userId', selectedUser);

        try {
            const res = await fetch(`${API_URL}/queries?${queryParams.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const response = await res.json();
            const dataToExport = response.data || [];

            if (!dataToExport.length) {
                alert('No queries to export with current filters');
                return;
            }

            const headers = ['Complaint #', 'Title', 'Status', 'Priority', 'Category', 'Created By', 'CNIC', 'Phone', 'Created Date'];
            const rows = dataToExport.map((q: any) => [
                q.complaintNumber || `#${q.id}`,
                `"${q.title.replace(/"/g, '""')}"`,
                q.status,
                q.priority,
                q.category?.name || 'N/A',
                q.user?.name || 'Unknown',
                `="${q.cnic}"`,
                `="${q.phone}"`,
                new Date(q.createdAt).toLocaleString(),
            ]);

            const csvContent = [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            let filename = 'queries_report';
            if (selectedUser !== 'ALL') {
                const user = reportUsers.find(u => u.id === parseInt(selectedUser));
                if (user) filename += `_${user.name.replace(/\s+/g, '_')}`;
            }
            if (startDate) filename += `_from_${startDate}`;
            if (endDate) filename += `_to_${endDate}`;
            filename += `.csv`;

            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data');
        }
    };

    // Fetch paginated users for report
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        setReportUsersLoading(true);
        const url = new URL(`${API_URL}/users`);
        url.searchParams.append('page', usersPage.toString());
        url.searchParams.append('limit', '5');
        if (usersSearch) url.searchParams.append('search', usersSearch);

        fetch(url.toString(), {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(response => {
                setReportUsers(response.data || []);
                setUsersTotalPages(response.meta?.lastPage || 1);
                setUsersTotalItems(response.meta?.total || 0);
                setReportUsersLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch report users', err);
                setReportUsersLoading(false);
            });
    }, [usersPage, usersSearch]);

    // Fetch paginated categories for report
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        setReportCategoriesLoading(true);
        const url = new URL(`${API_URL}/categories`);
        url.searchParams.append('page', categoriesPage.toString());
        url.searchParams.append('limit', '5');
        if (categoriesSearch) url.searchParams.append('search', categoriesSearch);

        fetch(url.toString(), {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(response => {
                setReportCategories(response.data || []);
                setCategoriesTotalPages(response.meta?.lastPage || 1);
                setCategoriesTotalItems(response.meta?.total || 0);
                setReportCategoriesLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch report categories', err);
                setReportCategoriesLoading(false);
            });
    }, [categoriesPage, categoriesSearch]);

    const downloadUserReport = async (userId: number, userName: string) => {
        const token = localStorage.getItem('access_token');
        try {
            // Fetch all queries for this user
            const res = await fetch(`${API_URL}/queries?userId=${userId}&limit=1000`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const response = await res.json();
            const userQueries = response.data || [];

            if (!userQueries.length) {
                alert(`No queries found for ${userName}`);
                return;
            }

            const headers = ['Complaint #', 'Customer Name', 'Title', 'Status', 'Priority', 'Category', 'CNIC', 'Phone', 'Created Date'];
            const rows = userQueries.map((q: any) => [
                q.complaintNumber || `#${q.id}`,
                `"${(q.customerName || 'Candidate').replace(/"/g, '""')}"`,
                `"${q.title.replace(/"/g, '""')}"`,
                q.status,
                q.priority,
                q.category?.name || 'N/A',
                `="${q.cnic}"`,
                `="${q.phone}"`,
                new Date(q.createdAt).toLocaleString(),
            ]);

            const csvContent = [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${userName.replace(/\s+/g, '_')}_queries_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export user report failed:', error);
            alert('Failed to export user report');
        }
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedUser('ALL');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                        <svg className="w-6 h-6 text-emerald-600 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <p className="text-slate-500">Loading reports...</p>
                </div>
            </div>
        );
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
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Reports & Analytics
                        </h1>
                        <div className="w-24"></div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatsCard title="Total Queries" value={stats.total} color="emerald" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>} />
                    <StatsCard title="Pending" value={stats.byStatus.PENDING} color="orange" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                    <StatsCard title="Total Users" value={stats.users} color="blue" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
                    <StatsCard title="Categories" value={stats.categories} color="purple" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>} />
                </div>

                {/* Export Filters */}
                <Card className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Export Filters</h3>
                            <p className="text-sm text-slate-500">Filter data before downloading</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Start Date</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">End Date</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Filter by User</label>
                            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            >
                                <option value="ALL">All Users</option>
                                {reportUsers.map((user) => (
                                    <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <Button variant="secondary" onClick={clearFilters} className="w-full">Clear Filters</Button>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                            📊 Filtered Results: <span className="font-bold">{totalItems}</span> queries found
                        </p>
                    </div>
                </Card>

                {/* Export Buttons */}
                <div className="mb-6 flex gap-3 flex-wrap">
                    <Button onClick={downloadCSV}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Filtered CSV
                    </Button>
                    <Button variant="outline" onClick={() => { clearFilters(); setTimeout(downloadCSV, 100); }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download All CSV
                    </Button>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Status Breakdown */}
                    <Card title="Queries by Status">
                        <div className="space-y-4">
                            {Object.entries(stats.byStatus).map(([status, count]: any) => {
                                const colors: any = {
                                    PENDING: 'bg-amber-500',
                                    IN_PROGRESS: 'bg-blue-500',
                                    RESOLVED: 'bg-emerald-500',
                                    CLOSED: 'bg-slate-500',
                                };
                                const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0;
                                return (
                                    <div key={status}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-600 dark:text-slate-400">{status.replace('_', ' ')}</span>
                                            <span className="font-semibold text-slate-800 dark:text-white">{count} ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                            <div className={`${colors[status]} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Priority Breakdown */}
                    <Card title="Queries by Priority">
                        <div className="space-y-4">
                            {Object.entries(stats.byPriority).map(([priority, count]: any) => {
                                const colors: any = { LOW: 'bg-emerald-500', MEDIUM: 'bg-amber-500', HIGH: 'bg-red-500' };
                                const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0;
                                return (
                                    <div key={priority}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-600 dark:text-slate-400">{priority}</span>
                                            <span className="font-semibold text-slate-800 dark:text-white">{count} ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                            <div className={`${colors[priority]} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>

                {/* User Performance Table */}
                <Card
                    title="User Performance"
                    className="mb-6"
                    noPadding
                    action={
                        <div className="w-64">
                            <Input
                                placeholder="Search users..."
                                value={usersSearch}
                                onChange={(e) => { setUsersSearch(e.target.value); setUsersPage(1); }}
                                icon={
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                }
                            />
                        </div>
                    }
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Queries</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        #
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {reportUsersLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading users...</td>
                                    </tr>
                                ) : reportUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No users found</td>
                                    </tr>
                                ) : (
                                    reportUsers.map((user: any) => (
                                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                                        <span className="text-sm font-semibold text-emerald-600">{user.name?.charAt(0) || '?'}</span>
                                                    </div>
                                                    <span className="font-medium text-slate-800 dark:text-white">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-slate-800 dark:text-white">{user._count?.queries || 0}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button size="xs" variant="outline" onClick={() => downloadUserReport(user.id, user.name)} disabled={(user._count?.queries || 0) === 0}>
                                                    Download
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            {usersTotalItems > 0 ? (
                                <>
                                    Showing <span className="font-medium text-slate-800 dark:text-white">{Math.min((usersPage - 1) * 5 + 1, usersTotalItems)}</span> to <span className="font-medium text-slate-800 dark:text-white">{Math.min(usersPage * 5, usersTotalItems)}</span> of <span className="font-medium text-slate-800 dark:text-white">{usersTotalItems}</span> results
                                </>
                            ) : (
                                'No results found'
                            )}
                        </div>
                        <Pagination
                            currentPage={usersPage}
                            totalPages={usersTotalPages}
                            onPageChange={setUsersPage}
                            totalItems={usersTotalItems}
                            itemsPerPage={5}
                        />
                    </div>
                </Card>

                {/* Category Breakdown Table */}
                <Card
                    title="Queries by Category"
                    className="mb-6"
                    noPadding
                    action={
                        <div className="w-64">
                            <Input
                                placeholder="Search categories..."
                                value={categoriesSearch}
                                onChange={(e) => { setCategoriesSearch(e.target.value); setCategoriesPage(1); }}
                                icon={
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                }
                            />
                        </div>
                    }
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Queries</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {reportCategoriesLoading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading categories...</td>
                                    </tr>
                                ) : reportCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No categories found</td>
                                    </tr>
                                ) : (
                                    reportCategories.map((cat: any, index: number) => (
                                        <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                                                #{(categoriesPage - 1) * 5 + index + 1}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">{cat.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${cat.isHidden ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                                    {cat.isHidden ? 'Hidden' : 'Visible'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-slate-800 dark:text-white">{cat._count?.queries || 0}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            {categoriesTotalItems > 0 ? (
                                <>
                                    Showing <span className="font-medium text-slate-800 dark:text-white">{Math.min((categoriesPage - 1) * 5 + 1, categoriesTotalItems)}</span> to <span className="font-medium text-slate-800 dark:text-white">{Math.min(categoriesPage * 5, categoriesTotalItems)}</span> of <span className="font-medium text-slate-800 dark:text-white">{categoriesTotalItems}</span> results
                                </>
                            ) : (
                                'No results found'
                            )}
                        </div>
                        <Pagination
                            currentPage={categoriesPage}
                            totalPages={categoriesTotalPages}
                            onPageChange={setCategoriesPage}
                            totalItems={categoriesTotalItems}
                            itemsPerPage={5}
                        />
                    </div>
                </Card>

                {/* Detailed Query Report Table */}
                <Card
                    title="Detailed Query Report"
                    className="mb-6"
                    noPadding
                    action={
                        <div className="w-64">
                            <Input
                                placeholder="Search queries..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); }}
                                icon={
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                }
                            />
                        </div>
                    }
                >
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="w-full relative">
                            <thead className="sticky top-0 z-10">
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shadow-sm">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Complaint #</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {tableLoading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : queries.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                            No queries found matching the selected filters.
                                        </td>
                                    </tr>
                                ) : (
                                    queries.map((query: any) => (
                                        <tr key={query.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                    {query.complaintNumber || `#${query.id}`}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                                                        {query.customerName || 'Candidate'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 font-mono">
                                                        {query.cnic}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs truncate font-medium text-slate-800 dark:text-white" title={query.title}>
                                                    {query.title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${query.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                                                    query.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                                                        query.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                                                            'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                    }`}>
                                                    {query.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${query.priority === 'HIGH' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    query.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${query.priority === 'HIGH' ? 'bg-red-500' :
                                                        query.priority === 'MEDIUM' ? 'bg-amber-500' :
                                                            'bg-emerald-500'
                                                        }`}></span>
                                                    {query.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {query.category?.name || 'Uncategorized'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {query.user?.name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="xs"
                                                        variant="outline"
                                                        onClick={() => window.open(`/agent/queries/${query.id}/report`, '_blank')}
                                                        title="View Report as PDF"
                                                    >
                                                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        variant="ghost"
                                                        onClick={() => window.location.href = `/admin/queries/${query.id}`}
                                                        title="View Details"
                                                    >
                                                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            {totalItems > 0 ? (
                                <>
                                    Showing <span className="font-medium text-slate-800 dark:text-white">{Math.min((page - 1) * 10 + 1, totalItems)}</span> to <span className="font-medium text-slate-800 dark:text-white">{Math.min(page * 10, totalItems)}</span> of <span className="font-medium text-slate-800 dark:text-white">{totalItems}</span> results
                                </>
                            ) : (
                                'No results found'
                            )}
                        </div>
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            totalItems={totalItems}
                            itemsPerPage={10}
                        />
                    </div>
                </Card>
            </main>

            <footer className="border-t border-slate-200 dark:border-slate-700 py-6">
                <p className="text-center text-sm text-slate-500">© 2026 Call Center Management System</p>
            </footer>
        </div >
    );
}
