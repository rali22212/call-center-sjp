'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { API_URL } from '../../config';

export default function CategoriesManagement() {
    const [categories, setCategories] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name: '',
        parentId: '',
    });

    const fetchCategories = () => {
        const token = localStorage.getItem('access_token');
        fetch(`${API_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setCategories(data));
    };

    useEffect(() => {
        fetchCategories();
    }, []);

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

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('Are you sure? This will affect all queries using this category.')) return;

        const token = localStorage.getItem('access_token');
        try {
            await fetch(`${API_URL}/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            fetchCategories();
        } catch (error) {
            alert('Failed to delete category');
        }
    };

    const parentCategories = categories.filter(c => !c.parentId);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-6 flex justify-between items-center">
                    <Button variant="outline" onClick={() => window.location.href = '/admin'}>
                        ← Back to Dashboard
                    </Button>
                    <Button onClick={() => setShowCreateModal(true)}>
                        + Create Category
                    </Button>
                </div>

                <Card title="Category Management">
                    <div className="space-y-4">
                        {parentCategories.map((parent) => (
                            <div key={parent.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {parent.name}
                                    </h3>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDeleteCategory(parent.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>

                                {parent.children && parent.children.length > 0 && (
                                    <div className="ml-6 mt-3 space-y-2">
                                        <p className="text-sm text-gray-500">Subcategories:</p>
                                        {parent.children.map((child: any) => (
                                            <div
                                                key={child.id}
                                                className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded"
                                            >
                                                <span className="text-gray-700 dark:text-gray-300">↳ {child.name}</span>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteCategory(child.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {categories.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No categories yet. Create your first one!</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Create Category Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create New Category</h2>
                            <form onSubmit={handleCreateCategory} className="space-y-4">
                                <Input
                                    label="Category Name"
                                    placeholder="e.g., Technical Support"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    required
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Parent Category (Optional)
                                    </label>
                                    <select
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                        value={newCategory.parentId}
                                        onChange={(e) => setNewCategory({ ...newCategory, parentId: e.target.value })}
                                    >
                                        <option value="">None (Main Category)</option>
                                        {parentCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Select a parent to create a subcategory
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1">Create</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
