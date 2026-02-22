import React from "react";
import { Modal } from "../molecules";
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
  const isDestructive = variant === "destructive";
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      ariaLabelledBy="confirm-modal-title"
      ariaDescribedBy="confirm-modal-desc"
    >
      <p id="confirm-modal-desc" className="text-sm font-serif italic opacity-80 mb-6">
        {message}
      </p>
      <div className="flex gap-3 justify-end">
        <Button type="button" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant="primary"
          className={`flex-1 max-w-[140px] py-2 ${isDestructive ? "bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700" : ""}`}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
