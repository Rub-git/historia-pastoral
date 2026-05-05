'use client';

import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps): JSX.Element | null {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-sage-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto',
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-sage-100">
            <h2 className="text-lg font-semibold text-sage-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-sage-100 transition-colors"
            >
              <X className="w-5 h-5 text-sage-500" />
            </button>
          </div>
        )}
        <div className={cn(!title && 'pt-6', 'p-6')}>{children}</div>
      </div>
    </div>
  );
}