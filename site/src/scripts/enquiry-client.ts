type FormValues = Record<'name' | 'email' | 'when' | 'where' | 'message' | 'story', string>;

/** Activated only by the isolated lab, then by a future approved public form. */
export function connectEnquiryForm(form: HTMLFormElement, options: { timeoutMs?: number } = {}) {
  const submit = form.querySelector<HTMLButtonElement>('[data-enquiry-submit]')!;
  const status = form.querySelector<HTMLElement>('[data-enquiry-status]')!;
  const summary = form.querySelector<HTMLElement>('[data-enquiry-errors]')!;
  const restart = form.querySelector<HTMLButtonElement>('[data-enquiry-restart]')!;
  const names = ['name', 'email', 'when', 'where', 'message', 'story'] as const;
  const fields = names.map((name) => form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement);
  let token: string | null = null;
  let snapshot: FormValues | null = null;
  let busy = false;
  let received = false;
  let storageReady = true;
  const storageKey = 'sevensteps-enquiry-v1';
  const storageFailure = () => {
    storageReady = false;
    status.textContent = 'This browser cannot keep the reference needed for a safe retry. Sending is unavailable here. Try another browser.';
    submit.disabled = true;
  };
  const remember = (value: { phase: 'pending'; token: string } | { phase: 'received'; receipt: string }) => {
    try { sessionStorage.setItem(storageKey, JSON.stringify(value)); return true; }
    catch { storageFailure(); return false; }
  };
  const lock = (locked: boolean) => { for (const field of fields) field.disabled = locked; };
  const clearErrors = () => {
    summary.hidden = true;
    summary.replaceChildren();
    for (const field of fields) {
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    }
  };
  const showErrors = (errors: Record<string, string>) => {
    clearErrors();
    const heading = document.createElement('h2');
    heading.textContent = 'Check these details';
    summary.append(heading);
    for (const name of names) {
      if (typeof errors[name] !== 'string') continue;
      const field = form.elements.namedItem(name) as HTMLElement;
      const paragraph = document.createElement('p');
      paragraph.id = `${field.id}-error`;
      const link = document.createElement('a');
      link.href = `#${field.id}`;
      link.textContent = errors[name];
      paragraph.append(link);
      summary.append(paragraph);
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', paragraph.id);
    }
    summary.hidden = false;
    summary.focus();
  };
  const fetchJson = async (url: string, init?: RequestInit) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 12_000);
    try {
      const response = await fetch(url, { ...init, cache: 'no-store', credentials: 'same-origin', signal: controller.signal });
      const body = await response.json();
      return { response, body };
    } finally { clearTimeout(timeout); }
  };
  try {
    sessionStorage.setItem(`${storageKey}-check`, '1');
    sessionStorage.removeItem(`${storageKey}-check`);
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      const previous = JSON.parse(saved);
      if (previous.phase === 'pending' && typeof previous.token === 'string' && previous.token.length <= 1024) {
        token = previous.token;
        status.textContent = 'An earlier attempt may have reached us. Enter the same details and retry to check receipt. Start a new enquiry only if you intend to send another.';
        submit.textContent = 'Retry earlier enquiry';
        restart.hidden = false;
      } else if (previous.phase === 'received' && typeof previous.receipt === 'string' && /^[A-Za-z0-9_-]{20,100}$/.test(previous.receipt)) {
        received = true;
        lock(true);
        status.textContent = `We have received your enquiry. Your reference is ${previous.receipt}.`;
        submit.textContent = 'Enquiry received';
        restart.hidden = false;
      } else { storageFailure(); }
    }
  } catch { storageFailure(); }
  submit.disabled = received || !storageReady;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy || received || !storageReady) return;
    if (!snapshot && !form.reportValidity()) return;
    busy = true;
    submit.disabled = true;
    clearErrors();
    status.textContent = 'Sending your enquiry…';
    try {
      if (!token) {
        const issued = await fetchJson('/api/enquiry-token');
        if (!issued.response.ok || typeof issued.body?.token !== 'string') {
          status.textContent = issued.response.status === 429
            ? 'Too many attempts. Wait a few minutes and try again.'
            : 'The form could not connect. Your details are still here. Try again.';
          return;
        }
        token = issued.body.token;
      }
      if (!snapshot) snapshot = Object.fromEntries(fields.map((field) => [field.name, field.value])) as FormValues;
      if (!token) throw new Error('Submission reference is unavailable');
      if (!remember({ phase: 'pending', token })) return;
      lock(true);
      const result = await fetchJson('/api/enquiries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, enquiry: snapshot }),
      });
      if (result.response.ok && result.body?.code === 'received' &&
        typeof result.body.receipt === 'string' && /^[A-Za-z0-9_-]{20,100}$/.test(result.body.receipt)) {
        received = true;
        remember({ phase: 'received', receipt: result.body.receipt });
        form.reset();
        status.textContent = `We have received your enquiry. Your reference is ${result.body.receipt}.`;
        submit.textContent = 'Enquiry received';
        restart.hidden = false;
        snapshot = null;
      } else if (result.response.status === 422 && result.body?.code === 'validation') {
        snapshot = null;
        lock(false);
        showErrors(result.body.errors ?? {});
        status.textContent = 'Please check the marked fields.';
        submit.textContent = 'Send enquiry';
      } else if (result.response.status === 409) {
        status.textContent = result.body?.code === 'token_expired'
          ? 'This form has expired. Check whether you already sent an enquiry before starting another.'
          : 'An earlier enquiry uses this form. Check your earlier submission before starting another.';
        restart.hidden = false;
        submit.textContent = 'Try again';
      } else {
        status.textContent = result.response.status === 429
          ? 'Too many attempts. Wait a few minutes, then retry these same details.'
          : 'We could not confirm receipt. Try again with these same details.';
        submit.textContent = 'Try again';
      }
    } catch {
      status.textContent = 'We could not confirm receipt. Your details are still here. Try again.';
      submit.textContent = 'Try again';
    } finally {
      busy = false;
      submit.disabled = received || !storageReady;
    }
  });
  restart.addEventListener('click', () => {
    if (busy) return;
    try { sessionStorage.removeItem(storageKey); }
    catch { storageFailure(); return; }
    token = null;
    snapshot = null;
    received = false;
    lock(false);
    clearErrors();
    status.textContent = '';
    submit.textContent = 'Send enquiry';
    submit.disabled = false;
    restart.hidden = true;
    fields[0].focus();
  });
}
