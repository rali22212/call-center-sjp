import React from 'react';

// Skeleton shimmer animation
export const Skeleton: React.FC<{
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}> = ({ className = '', variant = 'rectangular', width, height }) => {
    const baseClass = 'animate-pulse bg-slate-200 dark:bg-slate-700';

    const variants = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-xl',
    };

    return (
        <div
            className={`${baseClass} ${variants[variant]} ${className}`}
            style={{ width, height }}
        />
    );
};

// Table Row Skeleton
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 6 }) => {
    return (
        <tr className="border-b border-slate-100 dark:border-slate-700/50">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-6 py-4">
                    <Skeleton height={16} className={i === 0 ? 'w-24' : 'w-20'} />
                </td>
            ))}
        </tr>
    );
};

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <Skeleton height={14} className="w-20 mb-3" />
                    <Skeleton height={32} className="w-16" />
                </div>
                <Skeleton variant="rectangular" width={48} height={48} />
            </div>
        </div>
    );
};

// Card Content Skeleton
export const CardSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <Skeleton height={20} className="w-32 mb-4" />
            <div className="space-y-3">
                {Array.from({ length: lines }).map((_, i) => (
                    <Skeleton key={i} height={14} className={i === lines - 1 ? 'w-3/4' : 'w-full'} />
                ))}
            </div>
        </div>
    );
};

// Dashboard Skeleton - Full page loading state
export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            {/* Header Skeleton */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Skeleton variant="rectangular" width={40} height={40} />
                        <div>
                            <Skeleton height={18} className="w-32 mb-1" />
                            <Skeleton height={12} className="w-24" />
                        </div>
                    </div>
                    <Skeleton height={36} className="w-24" />
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Welcome Skeleton */}
                <div className="mb-8">
                    <Skeleton height={28} className="w-64 mb-2" />
                    <Skeleton height={16} className="w-80" />
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                </div>

                {/* Cards Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CardSkeleton lines={4} />
                    <CardSkeleton lines={4} />
                </div>
            </main>
        </div>
    );
};

// Table Page Skeleton
export const TablePageSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                    <Skeleton height={32} className="w-24" />
                    <Skeleton height={18} className="w-32" />
                    <Skeleton height={32} className="w-24" />
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
                {/* Stats Summary Skeleton */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <Skeleton height={80} className="rounded-xl" />
                    <Skeleton height={80} className="rounded-xl" />
                    <Skeleton height={80} className="rounded-xl" />
                </div>

                {/* Search Skeleton */}
                <Skeleton height={48} className="w-full mb-6" />

                {/* Table Skeleton */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <th key={i} className="px-6 py-4">
                                        <Skeleton height={12} className="w-16" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <TableRowSkeleton key={i} columns={6} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};
