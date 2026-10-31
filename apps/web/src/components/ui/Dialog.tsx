import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
}: DialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
          />

          {/* Dialog Container — Limitado a max-w-[390px] para caber folgado nos 430px */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="
              relative
              z-10
              w-full
              max-w-[390px]
              rounded-3xl
              bg-white
              p-6
              shadow-floating
              border
              border-gray-100
            "
          >
            <div className="flex items-start justify-between">
              <div>
                {title && <h3 className="text-lg font-bold text-charcoal">{title}</h3>}
                {description && <p className="mt-1 text-xs text-charcoal-muted">{description}</p>}
              </div>

              <button
                onClick={onClose}
                aria-label="Fechar"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-charcoal-muted hover:bg-gray-200 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mt-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Dialog;

