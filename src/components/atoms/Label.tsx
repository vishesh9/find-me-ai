import React from "react";

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export function Label({ children, htmlFor, className = "" }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-[10px] uppercase font-bold mb-1 ${className}`}
    >
      {children}
    </label>
  );
}
