import React from "react";

const baseClass =
  "w-full bg-transparent border border-[#141414] p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#141414]";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  className?: string;
}

export function Input({ className = "", ...props }: InputProps) {
  return <input className={`${baseClass} ${className}`} {...props} />;
}

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  className?: string;
}

export function Textarea({ className = "", ...props }: TextareaProps) {
  return <textarea className={`${baseClass} ${className}`} {...props} />;
}
