/**
 * Form submission layer.
 *
 * There is no backend in this project, so these functions deliberately simulate a
 * network round trip. Everything the UI needs is modelled here — pending state,
 * a resolved value, and a typed failure — so wiring a real endpoint later means
 * replacing the body of `request` and nothing else.
 *
 * To connect a backend, replace the two `request` functions with calls to your
 * API route, e.g. `fetch("/api/contact", { method: "POST", body: JSON.stringify(payload) })`,
 * and keep the same returned shape.
 */

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type NewsletterPayload = {
  email: string;
};

export type SubmitResult =
  | { status: "ok" }
  | { status: "error"; message: string };

const NETWORK_DELAY_MS = 1100;

function request<T>(payload: T): Promise<SubmitResult> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve({ status: "ok" }), NETWORK_DELAY_MS);
    // `payload` is deliberately unused until a real endpoint exists. Referencing
    // it here keeps the signature honest and avoids an unused-parameter lint.
    void payload;
  });
}

export function submitContactForm(payload: ContactPayload) {
  return request(payload);
}

export function subscribeToNewsletter(payload: NewsletterPayload) {
  return request(payload);
}

const fieldErrors = {
  required: "This field is required.",
  email: "Enter a valid email address.",
  message: "Please write at least 20 characters.",
} as const;

export function validateContactForm(values: ContactPayload) {
  const errors: Partial<Record<keyof ContactPayload, string>> = {};

  if (!values.name.trim()) errors.name = fieldErrors.required;
  if (!values.email.trim()) errors.email = fieldErrors.required;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
    errors.email = fieldErrors.email;
  if (!values.message.trim()) errors.message = fieldErrors.required;
  else if (values.message.trim().length < 20) errors.message = fieldErrors.message;

  return errors;
}