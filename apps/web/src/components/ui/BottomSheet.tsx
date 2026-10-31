import React, { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxHeight?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = 'max-h-[85vh]',
}: BottomSheetProps) {
  // Previne scroll do body quando o sheet está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-center overflow-hidden">
          {/* Backdrop escurecido restrito ou global */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
          />

          {/* Container do Bottom Sheet — limitado estritamente a 430px */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className={`
              absolute
              bottom-0
              w-full
              max-w-mobile
              rounded-t-[32px]
              bg-white
              shadow-sheet
              flex
              flex-col
              overflow-hidden
              ${maxHeight}
            `}
          >
            {/* Grabber Pill Centralizado */}
            <div className="flex w-full items-center justify-center pt-3 pb-1">
              <div className="h-1 w-9 rounded-full bg-gray-300" />
            </div>

            {/* Cabeçalho do Bottom Sheet */}
            {title && (
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                <h3 className="text-base font-bold text-charcoal">{title}</h3>
                <button
                  onClick={onClose}
                  aria-label="Fechar"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-charcoal-muted hover:bg-gray-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Conteúdo com Scroll Interno */}
            <div className="flex-1 overflow-y-auto px-5 py-4 overscroll-contain">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default BottomSheet;

