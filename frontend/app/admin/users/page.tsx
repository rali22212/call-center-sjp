'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Pagination } from '../../components/Pagination';
import { TablePageSkeleton } from '../../components/Skeleton';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { getCache, setCache } from '../../utils/cache';
import { API_URL } from '../../config';

export default function UsersManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: any }>({ isOpen: false, user: null });
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        name: '',
        role: 'AGENT',
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [stats, setStats] = useState({ total: 0, active: 0, disabled: 0 });

    // Load cached data on mount (client-side only)
    useEffect(() => {
        setMounted(true);
        const cachedUsers = getCache<any[]>('admin_users');
        const cachedStats = getCache<{ total: number; active: number; disabled: number }>('admin_users_stats');
        if (cachedUsers) {
            setUsers(cachedUsers);
            setLoading(false);
        }
        if (cachedStats) {
            setStats(cachedStats);
        }
    }, []);

    const fetchStats = () => {
        const token = localStorage.getItem('access_token');
        fetch(`${API_URL}/users/stats`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setCache('admin_users_stats', data);
            })
            .catch(err => console.error('Failed to fetch user stats', err));
    };

    const fetchUsers = () => {
        const token = localStorage.getItem('access_token');
        fetch(`${API_URL}/users?page=${page}&limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(response => {
                const usersArr = response.data || [];
                setUsers(usersArr);
                setTotalPages(response.meta?.lastPage || 1);
                setTotalItems(response.meta?.total || 0);

                if (page === 1) {
                    setCache('admin_users', usersArr);
                }
                setLoading(false);
                fetchStats(); // Fetch stats whenever users are fetched (to keep counts in sync)
            });
    };

    useEffect(() => {
        if (!mounted) return;
        fetchUsers();
    }, [mounted, page]);

    // Filter users by search query
    const filteredUsers = useMemo(() => {
        if (!search) return users;
        const q = search.toLowerCase();
        return users.filter(u =>
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q)
        );
    }, [users, search]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');

        try {
            await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(newUser),
            });

            setShowCreateModal(false);
            setNewUser({ email: '', password: '', name: '', role: 'AGENT' });
            fetchUsers();
        } catch (error) {
            alert('Failed to create user');
        }
    };

    const handleToggleActive = async (id: number) => {
        const token = localStorage.getItem('access_token');
        try {
            await fetch(`${API_URL}/users/${id}/toggle-active`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            fetchUsers();
        } catch (error) {
            alert('Failed to toggle user status');
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteModal.user) return;
        const token = localStorage.getItem('access_token');
        try {
            await fetch(`${API_URL}/users/${deleteModal.user.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            fetchUsers();
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    if (loading) {
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
                        <h1 className="text-lg font-semibold text-slate-800 dark:text-white">
                            User Management
                        </h1>
                        <Button onClick={() => setShowCreateModal(true)}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create User
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</div>
                        <div className="text-sm text-slate-500">Total Users</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
                        <div className="text-sm text-slate-500">Active Users</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <div className="text-2xl font-bold text-red-600">{stats.disabled}</div>
                        <div className="text-sm text-slate-500">Disabled Users</div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search users by name, email, or role..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">S.No</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        {search ? 'No users found matching your search.' : 'No users found.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, index) => (
                                    <tr key={user.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${user.isActive === false ? 'opacity-60' : ''}`}>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-white">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-medium">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-slate-800 dark:text-white">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive !== false
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {user.isActive !== false ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleActive(user.id)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${user.isActive !== false
                                                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                                                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        }`}
                                                >
                                                    {user.isActive !== false ? 'Disable' : 'Enable'}
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModal({ isOpen: true, user })}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {users.length > 0 && (
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        totalItems={totalItems}
                        itemsPerPage={10}
                    />
                )}
            </main>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Create New User</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <Input
                                label="Full Name"
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                required
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                required
                            />
                            <Input
                                label="Password"
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Role
                                </label>
                                <select
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="AGENT">Agent</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1">Create User</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, user: null })}
                onConfirm={handleDeleteUser}
                title="Delete User"
                message="Are you sure you want to delete this user? All their queries and data will be permanently removed."
                itemName={deleteModal.user?.name || deleteModal.user?.email}
            />
        </div>
    );
}
