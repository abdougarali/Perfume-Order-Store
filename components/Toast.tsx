'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export default function ToastComponent({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration || 4000);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onClose]);

  const typeStyles = {
    success: {
      bg: 'bg-green-500/20 border-green-500/50 backdrop-blur-sm',
      text: 'text-green-300',
      icon: '✓',
      iconBg: 'bg-green-500/30',
    },
    error: {
      bg: 'bg-red-500/20 border-red-500/50 backdrop-blur-sm',
      text: 'text-red-300',
      icon: '✕',
      iconBg: 'bg-red-500/30',
    },
    info: {
      bg: 'bg-blue-500/20 border-blue-500/50 backdrop-blur-sm',
      text: 'text-blue-300',
      icon: 'ℹ',
      iconBg: 'bg-blue-500/30',
    },
    warning: {
      bg: 'bg-yellow-500/20 border-yellow-500/50 backdrop-blur-sm',
      text: 'text-yellow-300',
      icon: '⚠',
      iconBg: 'bg-yellow-500/30',
    },
  };

  const styles = typeStyles[toast.type];

  return (
    <div
      className={`
        ${styles.bg} ${styles.text} 
        border rounded-lg shadow-lg p-4 mb-3 
        flex items-start gap-3 
        min-w-[300px] max-w-md
        animate-slide-in
        font-elegant
      `}
      role="alert"
    >
      <div className={`${styles.iconBg} rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold`}>
        {styles.icon}
      </div>
      <div className="flex-1 text-sm font-medium">{toast.message}</div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-white/50 hover:text-white transition-colors flex-shrink-0"
        aria-label="Close"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
