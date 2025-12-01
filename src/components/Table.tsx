import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
      <table className={`w-full border-collapse ${className}`}>{children}</table>
    </div>
  );
};

interface TableHeadProps {
  children: React.ReactNode;
}

export const TableHead: React.FC<TableHeadProps> = ({ children }) => {
  return (
    <thead className="bg-slate-50 border-b border-slate-200">
      {children}
    </thead>
  );
};

interface TableBodyProps {
  children: React.ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({ children }) => {
  return <tbody className="bg-white divide-y divide-slate-100">{children}</tbody>;
};

interface TableRowProps {
  children: React.ReactNode;
  hoverable?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({ children, hoverable = true }) => {
  return (
    <tr
      className={`transition-colors ${
        hoverable ? 'hover:bg-slate-50' : ''
      }`}
    >
      {children}
    </tr>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className = '',
  align = 'left',
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <td
      className={`px-6 py-4 text-sm text-slate-600 ${alignClasses[align]} ${className}`}
    >
      {children}
    </td>
  );
};

interface TableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  children,
  className = '',
  align = 'left',
  sortable = false,
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <th
      className={`px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${alignClasses[align]} ${
        sortable ? 'cursor-pointer hover:bg-slate-100' : ''
      } ${className}`}
    >
      {children}
    </th>
  );
};
