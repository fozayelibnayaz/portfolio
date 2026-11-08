/* =============================================================================
   CONTACT — a form that does not pretend to have a server.

   Nothing here posts anywhere. It validates the fields, composes a real
   message, and hands it to the visitor's mail app. If that is not set up, the
   copy button puts the same text on the clipboard. Both paths are honest about
   what happened, which a fake "message sent" never is.
   ========================================================================== */

const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
const statusEl = document.querySelector<HTMLElement>('[data-form-status]');
const copyBtn = document.querySelector<HTMLButtonElement>('[data-copy]');
const counter = document.querySelector<HTMLElement>('[data-count-for="msg"]');

if (form) {
  const nameField = form.querySelector<HTMLInputElement>('[data-field="name"]');
  const emailField = form.querySelector<HTMLInputElement>('[data-field="email"]');
  const messageField = form.querySelector<HTMLTextAreaElement>('[data-field="message"]');

  const TO = 'ibnayaz789@gmail.com';
  const LIMIT = 800;

  const say = (text: string) => {
    if (statusEl) statusEl.textContent = text;
  };

  const fail = (field: HTMLInputElement | HTMLTextAreaElement | null, key: string, message: string) => {
    const box = form.querySelector<HTMLElement>(`[data-err="${key}"]`);
    if (box) {
      box.textContent = message;
      box.hidden = !message;
    }
    field?.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (field && message) {
      if (!field.hasAttribute('aria-describedby')) field.setAttribute('aria-describedby', `err-${key}`);
      const err = form.querySelector<HTMLElement>(`[data-err="${key}"]`);
      if (err) err.id = `err-${key}`;
    }
  };

  const needs = () =>
    Array.from(form.querySelectorAll<HTMLInputElement>('[data-need]:checked')).map((i) => i.value);

  const compose = () => {
    const picked = needs();
    const body = [
      nameField?.value.trim() ?? '',
      emailField?.value.trim() ?? '',
      '',
      picked.length ? `Project: ${picked.join(', ')}` : 'Project: not specified',
      '',
      messageField?.value.trim() ?? '',
    ].join('\n');

    const subject = picked.length
      ? `${picked[0]} — enquiry from ${nameField?.value.trim() || 'the site'}`
      : `Project enquiry from ${nameField?.value.trim() || 'the site'}`;

    return { subject, body, text: `To: ${TO}\nSubject: ${subject}\n\n${body}` };
  };

  const validate = () => {
    let ok = true;

    const name = nameField?.value.trim() ?? '';
    if (name.length < 2) {
      fail(nameField ?? null, 'name', 'A name is enough to start.');
      ok = false;
    } else fail(nameField ?? null, 'name', '');

    const mail = emailField?.value.trim() ?? '';
    const looksLikeMail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail);
    if (!looksLikeMail) {
      fail(emailField ?? null, 'email', 'That address needs an @ and a domain.');
      ok = false;
    } else fail(emailField ?? null, 'email', '');

    const message = messageField?.value.trim() ?? '';
    if (message.length < 10) {
      fail(messageField ?? null, 'message', 'Ten characters, at least — one line is fine.');
      ok = false;
    } else fail(messageField ?? null, 'message', '');

    return ok;
  };

  /* Keep the counter and the validity state in step with typing. */
  messageField?.addEventListener('input', () => {
    const n = messageField.value.length;
    if (counter) counter.textContent = `${n} / ${LIMIT}`;
    if (messageField.getAttribute('aria-invalid') === 'true' && messageField.value.trim().length >= 10) {
      fail(messageField, 'message', '');
    }
  });

  [nameField, emailField].forEach((field) =>
    field?.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') fail(field, field.dataset.field ?? '', '');
    }),
  );

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) {
      say('Two fields need a look before this can leave.');
      form.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    const { subject, body } = compose();
    const href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    say('Opening your mail app — the message is already written.');
    window.location.href = href;
  });

  copyBtn?.addEventListener('click', async () => {
    if (!validate()) {
      say('Two fields need a look before this can be copied.');
      return;
    }
    const { text } = compose();
    try {
      await navigator.clipboard.writeText(text);
      say('Copied. Paste it into any mail client.');
    } catch {
      say(`Clipboard blocked here — write to ${TO} directly.`);
    }
  });
}
