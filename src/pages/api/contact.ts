import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { z } from 'zod';

export const prerender = false;

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Zadajte meno.').max(100),
  email: z.email('Zadajte platný e-mail.').trim().max(150),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  message: z.string().trim().min(5, 'Napíšte nám pár slov.').max(3000),
  // Honeypot — accept anything, evaluated below (bots tend to fill it in).
  website: z.string().optional(),
  turnstileToken: z.string().optional(),
});

const CONTACT_TO = 'farma@kerestur.sk';
const CONTACT_FROM = 'Farma Kerestúr <web@farmakerestur.sk>';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

async function verifyTurnstile(
  secret: string,
  token: string | undefined,
  ip: string | undefined
): Promise<boolean> {
  if (!token) return false;
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  // User-facing `message` strings stay in Slovak; identifiers/logs are English.
  const json = (message: string, status: number) =>
    new Response(JSON.stringify({ ok: status < 400, message }), {
      status,
      headers: { 'content-type': 'application/json' },
    });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json('Neplatná požiadavka.', 400);
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Skontrolujte zadané údaje.';
    return json(firstError, 400);
  }

  const { name, email, phone, message, website, turnstileToken } = parsed.data;

  // Honeypot filled → pretend everything is fine, but send nothing.
  if (website) return json('Ďakujeme, správu sme prijali.', 200);

  // @ts-expect-error runtime.env is provided by the Cloudflare adapter (platformProxy in dev)
  const env = locals.runtime?.env ?? import.meta.env;

  const turnstileSecret = env.TURNSTILE_SECRET_KEY as string | undefined;
  if (turnstileSecret) {
    const ok = await verifyTurnstile(turnstileSecret, turnstileToken, clientAddress);
    if (!ok) return json('Overenie sa nepodarilo, skúste to znova.', 400);
  }

  const resendKey = env.RESEND_API_KEY as string | undefined;
  if (!resendKey) {
    // No e-mail provider configured. Surface a generic failure to the user
    // (never leak the missing key); add RESEND_API_KEY to the environment.
    console.error('[contact] RESEND_API_KEY missing — e-mail not sent.');
    return json('Správu sa nepodarilo odoslať. Skúste to prosím neskôr alebo nám zavolajte.', 500);
  }

  const to = (env.CONTACT_TO as string | undefined) ?? CONTACT_TO;
  const from = (env.CONTACT_FROM as string | undefined) ?? CONTACT_FROM;
  const resend = new Resend(resendKey);

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = phone ? escapeHtml(phone) : '—';
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Nová správa z webu — ${name}`,
      html: `<div style="font-family:sans-serif;line-height:1.6">
        <h2 style="margin:0 0 12px">Nová správa z webu</h2>
        <p><strong>Meno:</strong> ${safeName}</p>
        <p><strong>E-mail:</strong> ${safeEmail}</p>
        <p><strong>Telefón:</strong> ${safePhone}</p>
        <p><strong>Správa:</strong></p>
        <p>${safeMessage}</p>
      </div>`,
    });

    if (error) {
      console.error('[contact] Resend error:', error);
      return json(
        'Správu sa nepodarilo odoslať. Skúste to prosím neskôr alebo nám zavolajte.',
        502
      );
    }
  } catch (err) {
    console.error('[contact] Resend exception:', err);
    return json('Správu sa nepodarilo odoslať. Skúste to prosím neskôr alebo nám zavolajte.', 502);
  }

  // Autoreply to the sender — best-effort; a failure here doesn't block the response.
  try {
    await resend.emails.send({
      from,
      to: email,
      subject: 'Ďakujeme za správu — Farma Kerestúr',
      html: `<div style="font-family:sans-serif;line-height:1.6">
        <p>Dobrý deň ${safeName},</p>
        <p>ďakujeme, že ste nám napísali. Vašu správu sme dostali a ozveme sa
        vám čo najskôr — zvyčajne do pár dní.</p>
        <p>Ak sa potrebujete spojiť rýchlejšie, zavolajte nám na
        <strong>+421 905 323 828</strong>.</p>
        <p>Šťastný pštros, dobrý pštros.<br />Silvia a Jozef, Farma Kerestúr</p>
      </div>`,
    });
  } catch (err) {
    console.error('[contact] Autoreply failed:', err);
  }

  return json('Ďakujeme, správu sme prijali. Čoskoro sa ozveme.', 200);
};
