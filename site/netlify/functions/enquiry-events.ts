import type { Config } from '@netlify/functions';
import { createLiveRuntime } from '../../server/live-runtime.ts';
import { verifyNotificationWebhook } from '../../server/webhook.ts';
import { jsonResponse, unavailable } from '../../server/http.ts';

let runtime: ReturnType<typeof createLiveRuntime> | undefined;
export default async (request: Request) => {
  if (request.method !== 'POST') return jsonResponse(405, { code: 'method_not_allowed' }, { Allow: 'POST' });
  try {
    runtime ??= createLiveRuntime();
    if (Number(request.headers.get('content-length')) > 65_536) return jsonResponse(413, { code: 'too_large' });
    const reader = request.body?.getReader();
    if (!reader) return jsonResponse(400, { code: 'invalid_event' });
    const chunks: Uint8Array[] = [];
    let size = 0;
    const timer = setTimeout(() => { void reader.cancel().catch(() => {}); }, 5_000);
    try {
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.byteLength;
        if (size > 65_536) {
          void reader.cancel().catch(() => {});
          return jsonResponse(413, { code: 'too_large' });
        }
        chunks.push(part.value);
      }
    } finally { clearTimeout(timer); }
    const event = verifyNotificationWebhook(Buffer.concat(chunks).toString('utf8'), request.headers, runtime.config.webhookSecret);
    if (!event) return jsonResponse(400, { code: 'invalid_event' });
    if (!('kind' in event)) await runtime.store.recordWebhook(event);
    return jsonResponse(200, { code: 'recorded' });
  } catch { return unavailable(); }
};
export const config: Config = { path: '/api/enquiry-events' };
