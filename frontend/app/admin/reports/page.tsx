'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export default function AdminReports() {
    const [stats, setStats] = useState<any>(null);
    const [queries, setQueries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');

        // Fetch all data
        Promise.all([
            fetch('http://localhost:3000/users', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('http://localhost:3000/queries', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('http://localhost:3000/categories', { headers: { 'Authorization': `Bearer ${token}` } }),
        ])
            .then(([usersRes, queriesRes, catsRes]) =>
                Promise.all([usersRes.json(), queriesRes.json(), catsRes.json()])
            )
            .then(([users, queries, categories]) => {
                setQueries(queries);

                // Calculate detailed stats
                const byStatus = {
                    PENDING: queries.filter((q: any) => q.status === 'PENDING').length,
                    IN_PROGRESS: queries.filter((q: any) => q.status === 'IN_PROGRESS').length,
                    RESOLVED: queries.filter((q: any) => q.status === 'RESOLVED').length,
                    CLOSED: queries.filter((q: any) => q.status === 'CLOSED').length,
                };

                const byPriority = {
                    LOW: queries.filter((q: any) => q.priority === 'LOW').length,
                    MEDIUM: queries.filter((q: any) => q.priority === 'MEDIUM').length,
                    HIGH: queries.filter((q: any) => q.priority === 'HIGH').length,
                };

                const byCategory = categories.map((cat: any) => ({
                    name: cat.name,
                    count: queries.filter((q: any) => q.categoryId === cat.id).length,
                }));

                const byUser = users.map((user: any) => ({
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    queryCount: queries.filter((q: any) => q.userId === user.id).length,
                }));

                setStats({
                    total: queries.length,
                    users: users.length,
                    categories: categories.length,
                    byStatus,
                    byPriority,
                    byCategory,
                    byUser,
                });
                setLoading(false);
            });
    }, []);

    const downloadCSV = () => {
        if (!queries.length) return;

        // Create CSV content
        const headers = ['ID', 'Title', 'Status', 'Priority', 'Category', 'Created By', 'CNIC', 'Phone', 'Created Date'];
        const rows = queries.map(q => [
            q.id,
            q.title.replace(/,/g, ';'), // Replace commas to avoid CSV issues
            q.status,
            q.priority,
            q.category?.name || 'N/A',
            q.user?.name || 'Unknown',
            q.cnic,
            q.phone,
            new Date(q.createdAt).toLocaleString(),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `queries_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const downloadPerformancePDF = () => {
        if (!stats) return;

        // Create printable HTML for PDF
        const printWindow = window.open('', '', 'height=600,width=800');
        if (!printWindow) return;

        printWindow.document.write(`
      <html>
        <head>
          <title>Performance Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #059669; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #059669; color: white; }
            .section { margin: 30px 0; }
          </style>
        </head>
        <body>
          <h1>Call Center Performance Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          
          <div class="section">
            <h2>Overview</h2>
            <table>
              <tr><th>Metric</th><th>Count</th></tr>
              <tr><td>Total Queries</td><td>${stats.total}</td></tr>
              <tr><td>Total Users</td><td>${stats.users}</td></tr>
              <tr><td>Total Categories</td><td>${stats.categories}</td></tr>
            </table>
          </div>

          <div class="section">
            <h2>Queries by Status</h2>
            <table>
              <tr><th>Status</th><th>Count</th><th>Percentage</th></tr>
              <tr><td>Pending</td><td>${stats.byStatus.PENDING}</td><td>${((stats.byStatus.PENDING / stats.total) * 100).toFixed(1)}%</td></tr>
              <tr><td>In Progress</td><td>${stats.byStatus.IN_PROGRESS}</td><td>${((stats.byStatus.IN_PROGRESS / stats.total) * 100).toFixed(1)}%</td></tr>
              <tr><td>Resolved</td><td>${stats.byStatus.RESOLVED}</td><td>${((stats.byStatus.RESOLVED / stats.total) * 100).toFixed(1)}%</td></tr>
              <tr><td>Closed</td><td>${stats.byStatus.CLOSED}</td><td>${((stats.byStatus.CLOSED / stats.total) * 100).toFixed(1)}%</td></tr>
            </table>
          </div>

          <div class="section">
            <h2>User Performance</h2>
            <table>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Queries Created</th></tr>
              ${stats.byUser.map((u: any) => `
                <tr>
                  <td>${u.name}</td>
                  <td>${u.email}</td>
                  <td>${u.role}</td>
                  <td>${u.queryCount}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        </body>
      </html>
    `);

        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Navigation */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-3">
                            <img src="/logo.jpg" alt="SJP Logo" className="w-10 h-10 rounded-full" />
                            <h1 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                Performance Reports
                            </h1>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex-1 max-w-7xl mx-auto px-4 w-full py-8">
                <div className="mb-6 flex gap-4 flex-wrap">
                    <Button variant="outline" onClick={() => window.location.href = '/admin'}>
                        ← Back to Dashboard
                    </Button>
                    <Button onClick={downloadCSV}>
                        📥 Download CSV
                    </Button>
                    <Button onClick={downloadPerformancePDF}>
                        📄 Download Performance Report
                    </Button>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Queries</h3>
                        <p className="text-4xl font-bold text-emerald-600">{stats.total}</p>
                    </Card>
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Users</h3>
                        <p className="text-4xl font-bold text-blue-600">{stats.users}</p>
                    </Card>
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Categories</h3>
                        <p className="text-4xl font-bold text-purple-600">{stats.categories}</p>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Status Breakdown */}
                    <Card title="Queries by Status">
                        <div className="space-y-3">
                            {Object.entries(stats.byStatus).map(([status, count]: any) => (
                                <div key={status} className="flex justify-between items-center">
                                    <span className="text-gray-700 dark:text-gray-300">{status}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-emerald-600 h-2 rounded-full"
                                                style={{ width: `${(count / stats.total) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="font-bold w-12 text-right">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Priority Breakdown */}
                    <Card title="Queries by Priority">
                        <div className="space-y-3">
                            {Object.entries(stats.byPriority).map(([priority, count]: any) => (
                                <div key={priority} className="flex justify-between items-center">
                                    <span className="text-gray-700 dark:text-gray-300">{priority}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${priority === 'HIGH' ? 'bg-red-600' :
                                                        priority === 'MEDIUM' ? 'bg-yellow-600' : 'bg-green-600'
                                                    }`}
                                                style={{ width: `${(count / stats.total) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="font-bold w-12 text-right">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* User Performance */}
                <Card title="User Performance">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Queries Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {stats.byUser.map((user: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{user.name}</td>
                                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                                        <td className="px-4 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">{user.queryCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Category Performance */}
                <Card title="Queries by Category" className="mt-6">
                    <div className="space-y-3">
                        {stats.byCategory.map((cat: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center">
                                <span className="text-gray-700 dark:text-gray-300">{cat.name}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-48 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-emerald-600 h-2 rounded-full"
                                            style={{ width: `${(cat.count / stats.total) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="font-bold w-12 text-right">{cat.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <footer className="text-center py-6 text-sm text-gray-500">
                Developed by Call Center Internees
            </footer>
        </div>
    );
}
