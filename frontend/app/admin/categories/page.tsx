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

export default function CategoriesManagement() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; category: any }>({ isOpen: false, category: null });
    const [newCategory, setNewCategory] = useState({
        name: '',
        parentId: '',
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [stats, setStats] = useState({ total: 0, visible: 0, hidden: 0 });

    // Load cached data on mount (client-side only)
    useEffect(() => {
        setMounted(true);
        const cachedCategories = getCache<any[]>('admin_categories');
        const cachedStats = getCache<{ total: number; visible: number; hidden: number }>('admin_categories_stats');
        if (cachedCategories) {
            setCategories(cachedCategories);
            setLoading(false);
        }
        if (cachedStats) {
            setStats(cachedStats);
        }
    }, []);

    const fetchStats = () => {
        const token = localStorage.getItem('access_token');
        fetch(`${API_URL}/categories/stats`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setCache('admin_categories_stats', data);
            })
            .catch(err => console.error('Failed to fetch category stats', err));
    };

    const fetchCategories = () => {
        const token = localStorage.getItem('access_token');
        fetch(`${API_URL}/categories?page=${page}&limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(response => {
                const catsArr = response.data || [];
                setCategories(catsArr);
                setTotalPages(response.meta?.lastPage || 1);
                setTotalItems(response.meta?.total || 0);

                if (page === 1) {
                    setCache('admin_categories', catsArr);
                }
                setLoading(false);
                fetchStats(); // Fetch stats whenever categories are fetched
            });
    };

    useEffect(() => {
        if (!mounted) return;
        fetchCategories();
    }, [mounted, page]);

    // Filter categories by search
    const filteredCategories = useMemo(() => {
        if (!search) return categories;
        const q = search.toLowerCase();
        return categories.filter(c => c.name?.toLowerCase().includes(q));
    }, [categories, search]);

    const parentCategories = filteredCategories.filter(c => !c.parentId);

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');

        try {
            await fetch(`${API_URL}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: newCategory.name,
                    ...(newCategory.parentId && { parentId: parseInt(newCategory.parentId) }),
                }),
            });

            setShowCreateModal(false);
            setNewCategory({ name: '', parentId: '' });
            fetchCategories();
        } catch (error) {
            alert('Failed to create category');
        }
    };

    const handleToggleHidden = async (id: number) => {
        const token = localStorage.getItem('access_token');
        try {
            await fetch(`${API_URL}/categories/${id}/toggle-hidden`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            fetchCategories();
        } catch (error) {
            alert('Failed to toggle category visibility');
        }
    };

    const handleDeleteCategory = async () => {
        if (!deleteModal.category) return;
        const token = localStorage.getItem('access_token');
        try {
            await fetch(`${API_URL}/categories/${deleteModal.category.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            fetchCategories();
        } catch (error) {
            alert('Failed to delete category');
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
                            Category Management
                        </h1>
                        <Button onClick={() => setShowCreateModal(true)}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Category
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</div>
                        <div className="text-sm text-slate-500">Total Categories</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <div className="text-2xl font-bold text-emerald-600">{stats.visible}</div>
                        <div className="text-sm text-slate-500">Visible</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <div className="text-2xl font-bold text-amber-600">{stats.hidden}</div>
                        <div className="text-sm text-slate-500">Hidden</div>
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
                            placeholder="Search categories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Categories Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">S.No</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Category Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Subcategories</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Visibility</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {parentCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        {search ? 'No categories found matching your search.' : 'No categories yet. Create your first one!'}
                                    </td>
                                </tr>
                            ) : (
                                parentCategories.map((category, index) => (
                                    <tr key={category.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${category.isHidden ? 'opacity-60' : ''}`}>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-white">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm font-medium text-slate-800 dark:text-white">{category.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                Main Category
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {category.children?.length || 0} subcategories
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${category.isHidden !== true
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}>
                                                {category.isHidden !== true ? 'Visible' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleHidden(category.id)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${category.isHidden !== true
                                                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                                                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        }`}
                                                >
                                                    {category.isHidden !== true ? 'Hide' : 'Show'}
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModal({ isOpen: true, category })}
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
                {parentCategories.length > 0 && (
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        totalItems={totalItems}
                        itemsPerPage={10}
                    />
                )}

                {/* Note about hidden categories */}
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-amber-800 dark:text-amber-200">
                            <strong>Hidden Categories:</strong> When you hide a category, it will not appear in the dropdown when agents create new queries. Existing queries using hidden categories are not affected.
                        </div>
                    </div>
                </div>
            </main>

            {/* Create Category Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Create New Category</h2>
                        <form onSubmit={handleCreateCategory} className="space-y-4">
                            <Input
                                label="Category Name"
                                placeholder="e.g., Technical Support"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Parent Category (Optional)
                                </label>
                                <select
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    value={newCategory.parentId}
                                    onChange={(e) => setNewCategory({ ...newCategory, parentId: e.target.value })}
                                >
                                    <option value="">None (Main Category)</option>
                                    {categories.filter(c => !c.parentId).map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-slate-500">
                                    Select a parent to create a subcategory
                                </p>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1">Create Category</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, category: null })}
                onConfirm={handleDeleteCategory}
                title="Delete Category"
                message="Are you sure you want to delete this category? All queries using this category will be affected."
                itemName={deleteModal.category?.name}
            />
        </div>
    );
}
