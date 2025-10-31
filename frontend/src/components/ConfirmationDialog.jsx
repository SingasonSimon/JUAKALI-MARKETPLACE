import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingButton from './LoadingButton';

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-800 p-6 max-w-md w-full rounded-lg border border-gray-700 shadow-xl"
        >
          <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
          <p className="text-gray-300 mb-6">{message}</p>
          <div className="flex gap-4">
            <LoadingButton
              onClick={onConfirm}
              loading={loading}
              variant={variant}
              className="flex-1 py-3 px-6"
            >
              {confirmText}
            </LoadingButton>
            <LoadingButton
              onClick={onClose}
              variant="secondary"
              disabled={loading}
              className="flex-1 py-3 px-6"
            >
              {cancelText}
            </LoadingButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

