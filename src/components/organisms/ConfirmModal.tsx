import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Button } from "../atoms";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Use for destructive actions (e.g. clear data) */
  variant?: "default" | "destructive";
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
}: ConfirmModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
          aria-labelledby="confirm-modal-title"
          aria-describedby="confirm-modal-desc"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-[#141414]/20"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-md border-2 border-[#141414] bg-[#E4E3E0] p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-4 mb-4">
              <h2
                id="confirm-modal-title"
                className="text-lg font-bold tracking-tighter uppercase"
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 -m-1 border border-transparent hover:border-[#141414] rounded transition-colors focus:outline-none focus:ring-1 focus:ring-[#141414]"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p
              id="confirm-modal-desc"
              className="text-sm font-serif italic opacity-80 mb-6"
            >
              {message}
            </p>
            <div className="flex gap-3 justify-end">
              <Button type="button" onClick={onClose}>
                {cancelLabel}
              </Button>
              <Button
                type="button"
                variant="primary"
                className="flex-1 max-w-[140px] py-2"
                onClick={handleConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
