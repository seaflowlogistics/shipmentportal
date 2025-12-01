import React from 'react';
import { Modal } from './Modal';

interface ProgressModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  progress?: number;
  showProgress?: boolean;
  onClose?: () => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  title,
  message,
  progress = 0,
  showProgress = true,
  onClose,
}) => {
  const progressPercentage = Math.min(Math.max(progress, 0), 100);

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      size="sm"
    >
      <div className="space-y-4">
        {message && <p className="text-gray-600 text-sm">{message}</p>}

        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-700">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <svg
            className="animate-spin h-6 w-6 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
    </Modal>
  );
};
