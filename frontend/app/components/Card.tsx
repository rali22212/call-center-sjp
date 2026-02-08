import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    title,
    subtitle,
    icon,
    action,
    noPadding = false
}) => {
    return (
        <div className={`
            bg-white dark:bg-slate-800 
            rounded-2xl 
            shadow-sm hover:shadow-md
            border border-slate-200 dark:border-slate-700
            transition-all duration-200 ease-out
            ${className}
        `}>
            {(title || icon) && (
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                {icon}
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white tracking-tight">
                                {title}
                            </h3>
                            {subtitle && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        {action && (
                            <div>
                                {action}
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className={noPadding ? '' : 'p-6'}>
                {children}
            </div>
        </div>
    );
};

// Stats Card for dashboard metrics
export const StatsCard: React.FC<{
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: { value: number; positive: boolean };
    color?: 'emerald' | 'blue' | 'purple' | 'orange' | 'red';
}> = ({ title, value, icon, trend, color = 'emerald' }) => {
    const colorClasses = {
        emerald: 'from-emerald-500 to-emerald-600 text-emerald-600',
        blue: 'from-blue-500 to-blue-600 text-blue-600',
        purple: 'from-purple-500 to-purple-600 text-purple-600',
        orange: 'from-orange-500 to-orange-600 text-orange-600',
        red: 'from-red-500 to-red-600 text-red-600',
    };

    const bgClasses = {
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20',
        blue: 'bg-blue-50 dark:bg-blue-900/20',
        purple: 'bg-purple-50 dark:bg-purple-900/20',
        orange: 'bg-orange-50 dark:bg-orange-900/20',
        red: 'bg-red-50 dark:bg-red-900/20',
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {title}
                    </p>
                    <p className={`text-3xl font-bold mt-2 bg-gradient-to-r ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} bg-clip-text text-transparent`}>
                        {value}
                    </p>
                    {trend && (
                        <p className={`text-sm mt-2 font-medium ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% from last period
                        </p>
                    )}
                </div>
                {icon && (
                    <div className={`w-12 h-12 rounded-xl ${bgClasses[color]} flex items-center justify-center`}>
                        <span className={colorClasses[color].split(' ')[2]}>{icon}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
