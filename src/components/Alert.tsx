import React from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
  dismissible = true,
}) => {
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      titleText: 'text-green-900',
      icon: CheckCircleIcon,
      iconColor: 'text-green-600',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      titleText: 'text-red-900',
      icon: XCircleIcon,
      iconColor: 'text-red-600',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      titleText: 'text-yellow-900',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-yellow-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      titleText: 'text-blue-900',
      icon: InformationCircleIcon,
      iconColor: 'text-blue-600',
    },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-md border ${style.bg} ${style.border}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.iconColor}`} />
      <div className="flex-1">
        {title && <h3 className={`font-semibold ${style.titleText}`}>{title}</h3>}
        <p className={`text-sm ${title ? 'mt-1' : ''} ${style.text}`}>{message}</p>
      </div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className={`text-gray-400 hover:text-gray-600 transition flex-shrink-0`}
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
