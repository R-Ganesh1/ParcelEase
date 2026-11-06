import * as React from 'react';
import { cn } from '@/lib/utils';
import { ParcelStatus } from '@/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'parcel';
  status?: ParcelStatus;
}

export function Badge({ className, variant = 'default', status, children, ...props }: BadgeProps) {
  if (status) {
    const statusConfig: Record<ParcelStatus, { bg: string; text: string; label: string }> = {
      RECEIVED: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', label: 'Received' },
      STORED: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', label: 'In Storage' },
      BOOKED: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800', label: 'Pickup Booked' },
      READY_FOR_HANDOVER: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-800', label: 'Ready at Desk' },
      COLLECTED: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', label: 'Collected' },
      DELIVERY_SCHEDULED: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-800', label: 'Delivery Scheduled' },
      OUT_FOR_DELIVERY: { bg: 'bg-cyan-50 border-cyan-200', text: 'text-cyan-800', label: 'Out for Doorstep' },
      DELIVERED: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', label: 'Delivered' },
      DISPUTED: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-800', label: 'Disputed' },
      RETURNED_TO_COURIER: { bg: 'bg-slate-100 border-slate-300', text: 'text-slate-700', label: 'Returned' },
      UNCLAIMED: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-800', label: 'Unclaimed' },
    };

    const cfg = statusConfig[status] || statusConfig.STORED;

    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
          cfg.bg,
          cfg.text,
          className
        )}
        {...props}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
        {children || cfg.label}
      </span>
    );
  }

  const variants = {
    default: 'bg-blue-600 text-white border-transparent',
    secondary: 'bg-slate-100 text-slate-800 border-slate-200',
    outline: 'border border-slate-300 text-slate-700 bg-transparent',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    destructive: 'bg-red-50 text-red-800 border-red-200',
    parcel: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
