import React from 'react';
import { cn } from '../utils/classnames'; // Will build this helper next

export type StatusType = 'active' | 'partial' | 'settled' | 'pending' | 'paid' | 'overdue';

export const StatusBadge: React.FC<{ status: StatusType; className?: string }> = ({ status, className }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
      case 'pending':
        return { bg: 'bg-warning/20', text: 'text-warning', label: status.toUpperCase() };
      case 'paid':
      case 'settled':
        return { bg: 'bg-success/20', text: 'text-success', label: status.toUpperCase() };
      case 'partial':
        return { bg: 'bg-accent/20', text: 'text-accent', label: 'PARTIALLY SETTLED' };
      case 'overdue':
        return { bg: 'bg-error/20', text: 'text-error', label: 'OVERDUE' };
      default:
        return { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'UNKNOWN' };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={cn('px-2.5 py-1 text-xs font-bold rounded-full border border-current', config.bg, config.text, className)}>
      {config.label}
    </span>
  );
};
