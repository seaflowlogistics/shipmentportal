import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  circle = false,
  count = 1,
}) => {
  const baseClasses = 'bg-gray-200 animate-pulse';
  const circleClasses = circle ? 'rounded-full' : 'rounded-md';

  const widthStyle = typeof width === 'number' ? `${width}px` : width;
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  const skeleton = (
    <div
      className={`${baseClasses} ${circleClasses} ${className}`}
      style={{
        width: widthStyle,
        height: heightStyle,
      }}
    />
  );

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ width: widthStyle }}>
            {skeleton}
          </div>
        ))}
      </div>
    );
  }

  return skeleton;
};

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 6,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} width="100%" height="2rem" />
          ))}
        </div>
      ))}
    </div>
  );
};

interface SkeletonCardProps {
  count?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  count = 1,
  className = '',
}) => {
  const card = (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <Skeleton width="60%" height="1.5rem" className="mb-4" />
      <div className="space-y-3">
        <Skeleton width="100%" height="1rem" />
        <Skeleton width="100%" height="1rem" />
        <Skeleton width="80%" height="1rem" />
      </div>
    </div>
  );

  if (count > 1) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i}>{card}</div>
        ))}
      </div>
    );
  }

  return card;
};
