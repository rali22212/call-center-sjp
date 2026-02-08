'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input, Textarea } from '../../components/Input';
import { API_URL } from '../../config';

export default function CreateQuery() {
    const [formData, setFormData] = useState({
        customerName: '',
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
            .then(response => {
                // Handle both paginated response and plain array
                const data = response.data || response;
                setCategories(Array.isArray(data) ? data : []);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

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
                    cnic: formData.cnic,
                    phone: formData.phone,
                    title: formData.title,
                    description: formData.description,
                    priority: formData.priority,
                    categoryId: parseInt(formData.categoryId),
                    userId: JSON.parse(atob(token!.split('.')[1])).sub,
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/agent'}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back
                            </Button>
                        </div>
                        <h1 className="text-lg font-semibold text-slate-800 dark:text-white">
                            Create New Query
                        </h1>
                        <div className="w-20"></div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card>
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                            New Customer Query
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Fill in the details below to register a new customer query.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Customer Information */}
                        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 space-y-4">
                            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                Customer Information
                            </h3>
                            <Input
                                label="Customer Name"
                                placeholder="Enter customer name"
                                hint="Max 20 characters"
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value.slice(0, 20) })}
                                required
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                }
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="CNIC"
                                    placeholder="3520212345678"
                                    hint="Enter 13-digit CNIC without dashes"
                                    value={formData.cnic}
                                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value.replace(/\D/g, '').slice(0, 13) })}
                                    required
                                    icon={
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                        </svg>
                                    }
                                />
                                <Input
                                    label="Phone Number"
                                    placeholder="03001234567"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    icon={
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    }
                                />
                            </div>
                        </div>

                        {/* Query Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                Query Details
                            </h3>

                            <Input
                                label="Query Title"
                                placeholder="Brief description of the issue"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />

                            <Textarea
                                label="Description"
                                rows={4}
                                placeholder="Provide detailed information about the customer's query or issue..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        {/* Classification */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.filter(cat => cat.isHidden !== true).map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Priority
                                </label>
                                <select
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="LOW">🟢 Low</option>
                                    <option value="MEDIUM">🟡 Medium</option>
                                    <option value="HIGH">🟠 High</option>
                                    <option value="URGENT">🔴 Urgent</option>
                                </select>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => window.location.href = '/agent'}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                loading={loading}
                            >
                                {loading ? 'Creating...' : 'Create Query'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </main>
        </div>
    );
}
