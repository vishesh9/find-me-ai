import React from "react";

const baseClass =
  "px-4 py-2 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors flex items-center justify-center gap-2 text-sm uppercase font-bold disabled:opacity-30";

type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: "outline" | "primary";
};

export function Button({
  variant = "outline",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? "bg-[#141414] text-[#E4E3E0] hover:opacity-90 disabled:opacity-50 w-full py-3 tracking-widest"
      : "";
  return (
    <button
      className={`${baseClass} ${variantClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
