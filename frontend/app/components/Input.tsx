import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    hint,
    icon,
    className = '',
    type = 'text',
    ...props
}) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {label}
                    {props.required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        {icon}
                    </div>
                )}
                <input
                    type={inputType}
                    className={`
                        w-full px-4 py-3 
                        border border-slate-300 dark:border-slate-600
                        rounded-xl
                        bg-white dark:bg-slate-800
                        text-slate-800 dark:text-white
                        placeholder:text-slate-400 dark:placeholder:text-slate-500
                        focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 
                        transition-all duration-200
                        ${icon ? 'pl-11' : ''}
                        ${isPassword ? 'pr-12' : ''}
                        ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}
                        ${className}
                    `}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition-colors"
                    >
                        {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
            {hint && !error && (
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
            )}
            {error && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
};

// Textarea Component
export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    error?: string;
}> = ({ label, error, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {label}
                    {props.required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <textarea
                className={`
                    w-full px-4 py-3 
                    border border-slate-300 dark:border-slate-600
                    rounded-xl
                    bg-white dark:bg-slate-800
                    text-slate-800 dark:text-white
                    placeholder:text-slate-400
                    focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 
                    transition-all duration-200
                    resize-none
                    ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}
                    ${className}
                `}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    );
};

// Select Component
export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}> = ({ label, error, options, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {label}
                    {props.required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <select
                className={`
                    w-full px-4 py-3 
                    border border-slate-300 dark:border-slate-600
                    rounded-xl
                    bg-white dark:bg-slate-800
                    text-slate-800 dark:text-white
                    focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 
                    transition-all duration-200
                    appearance-none
                    cursor-pointer
                    ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}
                    ${className}
                `}
                {...props}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {error && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    );
};
