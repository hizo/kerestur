import { useEffect, useRef, useState } from 'react';

interface Props {
  turnstileSiteKey?: string;
}

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
      theme?: 'light' | 'dark' | 'auto';
      language?: string;
    }
  ) => string;
  reset: (id?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

const inputClass =
  'w-full rounded-md border border-border bg-surface px-4 py-3 font-body text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-accent';
const labelClass = 'font-body text-sm font-medium text-ink';

export default function ContactForm({ turnstileSiteKey }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!turnstileSiteKey || !widgetRef.current) return;

    const render = () => {
      if (!window.turnstile || !widgetRef.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(widgetRef.current, {
        sitekey: turnstileSiteKey,
        language: 'sk',
        callback: (t) => setToken(t),
        'expired-callback': () => setToken(''),
        'error-callback': () => setToken(''),
      });
    };

    if (window.turnstile) {
      render();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.head.appendChild(script);
  }, [turnstileSiteKey]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'submitting') return;

    const form = e.currentTarget;
    const data = new FormData(form);

    if (turnstileSiteKey && !token) {
      setStatus('error');
      setMessage('Potvrďte prosím, že nie ste robot.');
      return;
    }

    setStatus('submitting');
    setMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          phone: data.get('phone'),
          message: data.get('message'),
          website: data.get('website'),
          turnstileToken: token,
        }),
      });
      const body = (await res.json()) as { ok: boolean; message: string };

      if (res.ok && body.ok) {
        setStatus('success');
        setMessage(body.message);
        form.reset();
        setToken('');
        if (window.turnstile && widgetId.current) {
          window.turnstile.reset(widgetId.current);
        }
      } else {
        setStatus('error');
        setMessage(body.message ?? 'Niečo sa pokazilo, skúste to znova.');
      }
    } catch {
      setStatus('error');
      setMessage('Spojenie zlyhalo, skúste to o chvíľu znova.');
    }
  }

  if (status === 'success') {
    return (
      <output
        className="block rounded-lg border border-border bg-surface-muted p-8 text-center"
        aria-live="polite"
      >
        <p className="font-display text-2xl text-ink mb-2">Ďakujeme!</p>
        <p className="font-body text-base text-ink-muted leading-relaxed">{message}</p>
      </output>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={labelClass}>
          Meno*
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={labelClass}>
          E-mail*
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={150}
          autoComplete="email"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className={labelClass}>
          Telefón <span className="text-ink-muted font-normal">(voliteľné)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          maxLength={40}
          autoComplete="tel"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className={labelClass}>
          Správa*
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={5}
          maxLength={3000}
          rows={5}
          placeholder="Chcem prísť na návštevu, objednať vajcia či mäso, alebo sa spýtať na oslavu v kuchyni…"
          className={`${inputClass} resize-y`}
        />
      </div>

      {/* Honeypot — hidden field; humans never see it, bots tend to fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {turnstileSiteKey && <div ref={widgetRef} className="min-h-[65px]" />}

      {status === 'error' && (
        <p
          className="flex items-center gap-2 rounded-md border border-danger/40 bg-danger-surface px-4 py-3 font-body text-base font-medium text-danger"
          role="alert"
          aria-live="assertive"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5 shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 font-body font-semibold text-surface transition hover:opacity-90 disabled:opacity-60"
      >
        {status === 'submitting' ? 'Odosielam…' : 'Odoslať správu'}
        {status !== 'submitting' && <span aria-hidden="true">→</span>}
      </button>
    </form>
  );
}
