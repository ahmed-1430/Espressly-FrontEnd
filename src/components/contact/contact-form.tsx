"use client";

import { useState } from "react";
import { submitContactForm, validateContactForm, type ContactPayload } from "@/lib/form";
import { Button } from "@/components/ui/button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/form-fields";
import { cn } from "@/lib/cn";

type Status = "idle" | "submitting" | "success" | "error";
type Errors = Partial<Record<keyof ContactPayload, string>>;

const SUBJECTS = [
  "General enquiry",
  "Wholesale or standing order",
  "Private hire or event",
  "Press and collaboration",
  "Feedback about a visit",
  "Something else",
] as const;

const EMPTY: ContactPayload = {
  name: "",
  email: "",
  subject: SUBJECTS[0],
  message: "",
};

/**
 * Contact form.
 *
 * Client-side validation runs on blur and again on submit. Submission goes
 * through `submitContactForm`, which is a documented stub with no backend behind
 * it: the success copy says so plainly rather than implying an email was sent.
 * Wiring a real endpoint means replacing that one function.
 */
export function ContactForm() {
  const [values, setValues] = useState<ContactPayload>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  function update<K extends keyof ContactPayload>(key: K, value: ContactPayload[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    // Clear a field's error as soon as it is edited, but re-validate it on blur.
    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
    if (status !== "idle") {
      setStatus("idle");
      setSubmitError(null);
    }
  }

  function validate() {
    const next = validateContactForm(values);
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onBlur() {
    setErrors(validateContactForm(values));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    if (!validate()) {
      // Move focus to the first invalid control so keyboard users land on it.
      const firstKey = Object.keys(errors)[0];
      const el = document.getElementById(`contact-${firstKey}`);
      el?.focus();
      return;
    }

    setStatus("submitting");
    setSubmitError(null);
    const result = await submitContactForm(values);

    if (result.status === "ok") {
      setStatus("success");
      setValues(EMPTY);
      return;
    }

    setStatus("error");
    setSubmitError(result.message);
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-6 border border-border bg-background-raised p-8 sm:p-10"
      >
        <span
          aria-hidden
          className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/50"
        >
          <svg viewBox="0 0 24 12" fill="none" className="h-2.5 w-6 text-accent-bright">
            <path
              d="M0 6h21m0 0-5-5m5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.4"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </span>

        <div>
          <h3 className="text-2xl tracking-display">Form received</h3>
          <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
            The form state machine ran end to end. There is no backend behind it
            yet, so nothing was actually sent — connect{" "}
            <code className="text-foreground-soft">submitContactForm</code> in{" "}
            <code className="text-foreground-soft">src/lib/form.ts</code> and this
            becomes a real submission.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setStatus("idle");
            setSubmitError(null);
          }}
        >
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-7">
      <div className="grid gap-7 sm:grid-cols-2">
        <TextField
          id="contact-name"
          label="Your name"
          name="name"
          autoComplete="name"
          placeholder="Jane Whitfield"
          value={values.name}
          error={errors.name}
          onChange={(event) => update("name", event.target.value)}
          onBlur={onBlur}
          disabled={status === "submitting"}
        />

        <TextField
          id="contact-email"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@yourdomain.com"
          value={values.email}
          error={errors.email}
          onChange={(event) => update("email", event.target.value)}
          onBlur={onBlur}
          disabled={status === "submitting"}
        />
      </div>

      <SelectField
        id="contact-subject"
        label="Subject"
        name="subject"
        options={SUBJECTS}
        value={values.subject}
        error={errors.subject}
        onChange={(event) => update("subject", event.target.value)}
        onBlur={onBlur}
        disabled={status === "submitting"}
      />

      <TextAreaField
        id="contact-message"
        label="Message"
        name="message"
        rows={6}
        placeholder="Tell us what you need, or what we got wrong."
        value={values.message}
        error={errors.message}
        onChange={(event) => update("message", event.target.value)}
        onBlur={onBlur}
        disabled={status === "submitting"}
        className="mt-1"
      />

      <div className="flex flex-col gap-5 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between">
        <p
          aria-live="polite"
          role={status === "error" ? "alert" : undefined}
          className={cn(
            "max-w-sm text-xs leading-relaxed transition-colors",
            status === "error" ? "text-accent-bright" : "text-muted-foreground",
          )}
        >
          {status === "error" && submitError
            ? submitError
            : "We read everything and answer within two working days. No mailing list is attached to this form."}
        </p>

        <Button
          type="submit"
          variant="primary"
          disabled={status === "submitting"}
          arrow={status !== "submitting"}
          className="shrink-0"
        >
          {status === "submitting" ? "Sending" : "Send message"}
        </Button>
      </div>
    </form>
  );
}