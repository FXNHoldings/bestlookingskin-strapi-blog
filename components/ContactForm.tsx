'use client';

import { useState } from 'react';

const CONTACT_EMAIL = 'hello@bestlooking.skin';

/**
 * Client-side contact form. On submit it composes a mailto: URL with the
 * fields encoded into subject + body and opens the user's mail client.
 * Pure client-side — no backend or third-party service needed.
 */
export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [opened, setOpened] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      message,
    ].join('\n');
    const subj = subject || `Contact from ${name || 'BestLooking.Skin visitor'}`;
    const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
    setOpened(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      data-testid="contact-form"
      aria-label="Contact form"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" id="contact-name" required>
          <input
            id="contact-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className={inputClass}
          />
        </Field>
        <Field label="Email" id="contact-email" required>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Subject" id="contact-subject">
        <input
          id="contact-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What’s this about?"
          className={inputClass}
        />
      </Field>
      <Field label="Message" id="contact-message" required>
        <textarea
          id="contact-message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us a bit more…"
          className={`${inputClass} resize-y`}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="inline-flex items-center rounded-full bg-primary px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:bg-primary-emphasis disabled:opacity-50"
          disabled={!name || !email || !message}
        >
          Send message
        </button>
        {opened && (
          <p className="text-sm text-ink/65" role="status">
            Opening your email client… If nothing happens, write to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-primary hover:underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        )}
      </div>
      <p className="text-xs leading-5 text-ink/45">
        Submitting this form opens your default email app with the message pre-filled — your address
        is only used to reply to you.
      </p>
    </form>
  );
}

const inputClass =
  'block w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-base text-ink placeholder:text-ink/40 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

function Field({
  label,
  id,
  required,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-medium text-ink/80">
        {label}
        {required && <span aria-hidden className="ml-1 text-primary">*</span>}
      </span>
      {children}
    </label>
  );
}
