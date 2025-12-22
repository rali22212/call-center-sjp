'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { API_URL } from '../../config';

export default function CreateQuery() {
    const [formData, setFormData] = useState({
        cnic: '',
        phone: '',
        title: '',
        description: '',
        categoryId: '',
        priority: 'MEDIUM',
    });
    const [categories, setCategories] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        fetch(`${API_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setCategories(data));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // CNIC Validation
        if (!/^\d{13}$/.test(formData.cnic)) {
            setError('CNIC must be exactly 13 digits');
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('access_token');

        try {
            const response = await fetch(`${API_URL}/queries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    categoryId: parseInt(formData.categoryId),
                    userId: JSON.parse(atob(token!.split('.')[1])).sub, // Get user ID from token
                    status: 'PENDING',
                }),
            });

            if (!response.ok) throw new Error('Failed to create query');

            window.location.href = '/agent/queries';
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-3xl mx-auto px-4">
                <div className="mb-6">
                    <Button variant="outline" onClick={() => window.location.href = '/agent'}>
                        ← Back to Dashboard
                    </Button>
                </div>

                <Card title="Create New Query">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="CNIC (13 digits)"
                            placeholder="e.g., 3520212345678"
                            value={formData.cnic}
                            onChange={(e) => setFormData({ ...formData, cnic: e.target.value.replace(/\D/g, '').slice(0, 13) })}
                            required
                        />

                        <Input
                            label="Phone Number"
                            placeholder="e.g., 03001234567"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />

                        <Input
                            label="Query Title"
                            placeholder="Brief description of the issue"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                rows={4}
                                placeholder="Detailed description of the query..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Category
                            </label>
                            <select
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Priority
                            </label>
                            <select
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Query'}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
