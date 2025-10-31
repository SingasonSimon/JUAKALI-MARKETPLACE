import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onClose={() => removeToast(toast.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({ toast, onClose }) {
  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600',
  };

  const iconComponents = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
  };

  const bgColor = bgColors[toast.type] || bgColors.info;
  const IconComponent = iconComponents[toast.type] || iconComponents.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-4 min-w-[300px] max-w-md border-l-4 ${
        toast.type === 'success' ? 'border-green-300' :
        toast.type === 'error' ? 'border-red-300' :
        toast.type === 'warning' ? 'border-yellow-300' :
        'border-blue-300'
      }`}
      role="alert"
    >
      <IconComponent className="flex-shrink-0 w-6 h-6" />
      <div className="flex-1">
        <p className="font-semibold">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
        aria-label="Close notification"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

