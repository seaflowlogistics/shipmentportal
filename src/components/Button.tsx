import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-400 shadow-sm',
      secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 disabled:bg-slate-100 shadow-sm',
      danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 shadow-sm',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 disabled:text-slate-400',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm font-medium rounded-md',
      lg: 'px-6 py-3 text-base rounded-md',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 font-medium transition-colors ${variantClasses[variant]} ${sizeClasses[size]} disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      >
        {leftIcon && !isLoading && <span className="flex-shrink-0">{leftIcon}</span>}
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
        {rightIcon && !isLoading && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
