import type { Config } from '@netlify/functions';
import { createLiveRuntime } from '../../server/live-runtime.ts';
import { repairNotifications } from '../../server/notification-worker.ts';
import { jsonResponse, unavailable } from '../../server/http.ts';

export default async () => {
  let runtime: ReturnType<typeof createLiveRuntime> | undefined;
  try {
    runtime = createLiveRuntime();
    const summary = await repairNotifications({ ...runtime, onDiagnostic: runtime.diagnostic });
    return jsonResponse(200, summary);
  } catch { return unavailable(); }
  finally {
    try { await runtime?.close(); }
    catch { console.error(JSON.stringify({ code: 'enquiry_pool_close_failed' })); }
  }
};
// Netlify scheduled functions reject direct HTTP invocation. Verify on integration deploy.
export const config: Config = { schedule: '0 */4 * * *' };
