"use client";

import { useId, useState } from "react";
import { subscribeToNewsletter } from "@/lib/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Footer newsletter capture.
 *
 * The submit path is a documented stub with no backend behind it, so the button
 * resolves to a success state that says the signup is not yet connected rather
 * than pretending an email was sent. Swapping in a real endpoint is a one-line
 * change in `subscribeToNewsletter`.
 */
export function NewsletterForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      setError("Enter a valid email address.");
      setStatus("idle");
      return;
    }

    setError(null);
    setStatus("submitting");
    const result = await subscribeToNewsletter({ email: trimmed });

    if (result.status === "ok") {
      setStatus("success");
      setEmail("");
    } else {
      setStatus("error");
      setError(result.message);
    }
  }

  const invalid = Boolean(error);

  return (
    <form onSubmit={onSubmit} noValidate className="w-full max-w-md">
      <div className="flex items-baseline gap-6">
        <label htmlFor={id} className="micro shrink-0 text-muted-foreground">
          Dispatches
        </label>
        <div className="flex-1">
          <div className="flex items-end gap-4 border-b border-border-strong focus-within:border-accent">
            <input
              id={id}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@yourdomain.com"
              value={email}
              disabled={status === "submitting"}
              aria-invalid={invalid || undefined}
              aria-describedby={`${id}-status`}
              onChange={(event) => {
                setEmail(event.target.value);
                if (invalid) {
                  setError(null);
                  setStatus("idle");
                }
              }}
              className={cn(
                "w-full bg-transparent py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 disabled:opacity-60",
              )}
            />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={status === "submitting"}
              className="mb-1 shrink-0 border-0"
            >
              {status === "submitting" ? "Sending" : "Join"}
            </Button>
          </div>

          <p
            id={`${id}-status`}
            aria-live="polite"
            className={cn(
              "mt-3 text-xs transition-colors",
              status === "error" && "text-accent-bright",
              status === "success" && "text-cream-latte",
              status === "idle" && invalid && "text-accent-bright",
              !invalid && status !== "success" && status !== "error" && "text-muted-foreground",
            )}
          >
            {status === "error" && error}
            {status === "success" &&
              "Mailings are not connected yet — this demo records nothing."}
            {(status === "idle" || status === "submitting") &&
              (invalid && error
                ? error
                : "One letter a month: what we are pouring, what is coming in.")}
          </p>
        </div>
      </div>
    </form>
  );
}