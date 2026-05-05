'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

export function Alert({ children, variant = 'info', className }: AlertProps) {
  const Icon = icons[variant];
  
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg',
        {
          'bg-blue-50 text-blue-800': variant === 'info',
          'bg-green-50 text-green-800': variant === 'success',
          'bg-amber-50 text-amber-800': variant === 'warning',
          'bg-red-50 text-red-800': variant === 'error',
        },
        className
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="text-sm">{children}</div>
    </div>
  );
}