import React from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
}) => {
  const variantClasses = {
    primary: 'bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-700/10',
    success: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
    warning: 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20',
    danger: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10',
    info: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10',
    neutral: 'bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/10',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
