import React from "react";
import { Label } from "../atoms/Label";
import { Input, Textarea } from "../atoms/Input";

interface FormFieldProps {
  label: string;
  id?: string;
  children?: React.ReactNode;
}

export function FormField({ label, id, children }: FormFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

interface FormFieldInputProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
}

export function FormFieldInput({
  label,
  id,
  value,
  onChange,
  type = "text",
  className = "",
}: FormFieldInputProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={onChange} className={className} />
    </div>
  );
}

interface FormFieldTextareaProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  rows?: number;
}

export function FormFieldTextarea({
  label,
  id,
  value,
  onChange,
  className = "",
  rows = 3,
}: FormFieldTextareaProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} value={value} onChange={onChange} className={className} rows={rows} />
    </div>
  );
}
