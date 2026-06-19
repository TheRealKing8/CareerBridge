"use client";

import { useState, forwardRef, type InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

/**
 * Password field with a show/hide toggle.
 *
 * The toggle flips the underlying <input type> between "password" and
 * "text" so the browser's native password autofill / manager still
 * recognises the field. `autoComplete` is preserved on the caller side
 * ("current-password" or "new-password").
 */
export const PasswordInput = forwardRef<HTMLInputElement, Props>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <input
          {...props}
          ref={ref}
          type={visible ? "text" : "password"}
          className={
            "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 " +
            (props.className ?? "")
          }
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {visible ? (
            // Eye-off icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.5 19.5 0 0 1 4.22-5.39" />
              <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.5 19.5 0 0 1-3.17 4.19" />
              <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            // Eye icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    );
  },
);
