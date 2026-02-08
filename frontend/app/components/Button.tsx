import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = `
        inline-flex items-center justify-center gap-2
        font-semibold rounded-xl 
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.98]
    `;

    const variants = {
        primary: `
            bg-gradient-to-r from-emerald-600 to-emerald-500
            text-white 
            hover:from-emerald-700 hover:to-emerald-600
            shadow-sm hover:shadow-md
            focus:ring-emerald-500
        `,
        secondary: `
            bg-slate-100 dark:bg-slate-700
            text-slate-700 dark:text-slate-200
            hover:bg-slate-200 dark:hover:bg-slate-600
            focus:ring-slate-400
        `,
        outline: `
            border-2 border-emerald-500/80
            text-emerald-600 dark:text-emerald-400
            hover:bg-emerald-50 dark:hover:bg-emerald-900/20
            focus:ring-emerald-500
        `,
        danger: `
            bg-gradient-to-r from-red-600 to-red-500
            text-white 
            hover:from-red-700 hover:to-red-600
            shadow-sm hover:shadow-md
            focus:ring-red-500
        `,
        ghost: `
            text-slate-600 dark:text-slate-300
            hover:bg-slate-100 dark:hover:bg-slate-800
            focus:ring-slate-400
        `,
    };

    const sizes = {
        xs: 'px-2.5 py-1.5 text-xs',
        sm: 'px-3.5 py-2 text-sm',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            ) : icon ? (
                <span className="w-4 h-4">{icon}</span>
            ) : null}
            {children}
        </button>
    );
};
