'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Construction,
  Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'development';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  showDevelopmentToast: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    const duration = toast.duration ?? (toast.type === 'development' ? 5000 : 4000);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const showDevelopmentToast = useCallback((title: string, description?: string) => {
    addToast({
      type: 'development',
      title,
      description: description || 'This feature is currently in development. Preview data is shown for demonstration purposes.',
      duration: 5000,
      action: {
        label: 'Learn More',
        onClick: () => {
          window.open('https://yellow.org', '_blank');
        }
      }
    });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, showDevelopmentToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
      case 'development':
        return <Construction className="w-5 h-5 text-purple-400" />;
      default:
        return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-900/90 border-green-500/50';
      case 'error':
        return 'bg-red-900/90 border-red-500/50';
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-500/50';
      case 'info':
        return 'bg-blue-900/90 border-blue-500/50';
      case 'development':
        return 'bg-purple-900/90 border-purple-500/50';
      default:
        return 'bg-gray-900/90 border-gray-500/50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm",
        getBackgroundColor()
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-white">{toast.title}</p>
            {toast.description && (
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                {toast.description}
              </p>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-xs text-purple-300 hover:text-purple-200 underline mt-2 transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {toast.type === 'development' && (
        <div className="absolute -top-1 -right-1">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
        </div>
      )}
    </motion.div>
  );
}