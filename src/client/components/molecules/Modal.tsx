import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Default max-w-md. Use e.g. max-w-2xl for wider content. */
  maxWidth?: "md" | "lg" | "xl" | "2xl" | "3xl";
  /** Optional for accessibility; defaults to title id. */
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

const maxWidthClass = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
} as const;

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "md",
  ariaLabelledBy,
  ariaDescribedBy,
}: ModalProps) {
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

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`relative w-full ${maxWidthClass[maxWidth]} border-2 border-[#141414] bg-[#E4E3E0] shadow-lg flex flex-col max-h-[90vh] selection:bg-[#141414] selection:text-[#E4E3E0]`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-4 p-6 pb-0 shrink-0">
              <h2
                id={ariaLabelledBy}
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
            <div id={ariaDescribedBy} className="p-6 overflow-auto min-h-0 flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
