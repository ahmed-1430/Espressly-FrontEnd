"use client";

import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const controlBase =
  "w-full border-0 border-b bg-transparent px-0 pb-3 pt-2 text-[0.9375rem] text-foreground outline-none transition-colors duration-300 placeholder:text-muted-foreground/60 focus:border-accent";

/**
 * A labelled field with an inline error slot.
 *
 * The label sits above the control rather than inside it, which keeps the
 * baseline stable as the placeholder disappears and gives error messages room
 * without shifting the rest of the form.
 */
export function TextField({
  label,
  error,
  className,
  id: providedId,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const errorId = `${id}-error`;

  return (
    <div className={cn("flex flex-col", className)}>
      <label htmlFor={id} className="micro text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(controlBase, error ? "border-destructive" : "border-border-strong")}
        {...props}
      />
      <FieldMessage id={errorId} message={error} />
    </div>
  );
}

export function TextAreaField({
  label,
  error,
  className,
  id: providedId,
  rows = 5,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const errorId = `${id}-error`;

  return (
    <div className={cn("flex flex-col", className)}>
      <label htmlFor={id} className="micro text-muted-foreground">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(controlBase, "resize-y", error ? "border-destructive" : "border-border-strong")}
        {...props}
      />
      <FieldMessage id={errorId} message={error} />
    </div>
  );
}

export function SelectField({
  label,
  error,
  className,
  id: providedId,
  options,
  ...props
}: InputHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  options: readonly string[];
}) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const errorId = `${id}-error`;

  return (
    <div className={cn("flex flex-col", className)}>
      <label htmlFor={id} className="micro text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            controlBase,
            "cursor-pointer appearance-none pr-8",
            error ? "border-destructive" : "border-border-strong",
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option} value={option} className="bg-background text-foreground">
              {option}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 12 8"
          className="pointer-events-none absolute right-1 top-1/2 h-2 w-3 -translate-y-1/2 text-muted-foreground"
          fill="none"
        >
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <FieldMessage id={errorId} message={error} />
    </div>
  );
}

function FieldMessage({ id, message }: { id: string; message?: string }) {
  return (
    <p
      id={id}
      role={message ? "alert" : undefined}
      className={cn(
        "mt-2 overflow-hidden text-xs text-accent-bright transition-[max-height,opacity] duration-300",
        message ? "max-h-8 opacity-100" : "max-h-0 opacity-0",
      )}
    >
      {message ?? "\u00A0"}
    </p>
  );
}