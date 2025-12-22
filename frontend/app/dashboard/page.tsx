'use client';

import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { API_URL } from '../config';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('access_token');

            if (!token) {
                window.location.href = '/login';
                return;
            }

            try {
                console.log('[Dashboard] Fetching user profile...');
                const response = await fetch(`${API_URL}/auth/profile`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Unauthorized');
                }

                const data = await response.json();
                console.log('[Dashboard] User data received:', data);
                console.log('[Dashboard] User role:', data.role);

                // Store role in localStorage for consistency
                localStorage.setItem('user_role', data.role);
                localStorage.setItem('user_email', data.email);
                localStorage.setItem('user_name', data.name || '');

                // Redirect based on role
                if (data.role === 'ADMIN') {
                    console.log('[Dashboard] Redirecting to /admin');
                    window.location.href = '/admin';
                } else {
                    console.log('[Dashboard] Redirecting to /agent');
                    window.location.href = '/agent';
                }
            } catch (error) {
                console.error('[Dashboard] Error:', error);
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_role');
                window.location.href = '/login';
            }
        };

        fetchUser();
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}
