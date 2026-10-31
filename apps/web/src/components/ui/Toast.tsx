import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  id?: string;
  type?: ToastType;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({
  type = 'success',
  message,
  isOpen,
  onClose,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const icons = {
    success: <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />,
    error: <AlertCircle size={16} className="text-red-500 shrink-0" />,
    info: <Info size={16} className="text-primary shrink-0" />,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed top-5 left-1/2 z-50 w-[calc(100%-2.5rem)] max-w-[390px] -translate-x-1/2 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="
              pointer-events-auto
              flex
              items-center
              justify-between
              gap-2.5
              rounded-full
              bg-charcoal/95
              text-white
              px-4
              py-3
              shadow-floating
              backdrop-blur-md
            "
          >
            <div className="flex items-center gap-2.5">
              {icons[type]}
              <span className="text-xs font-semibold">{message}</span>
            </div>

            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Toast;

