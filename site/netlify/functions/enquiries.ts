import type { Context, Config } from '@netlify/functions';
import { createLiveRuntime } from '../../server/live-runtime.ts';
import { unavailable } from '../../server/http.ts';

let runtime: ReturnType<typeof createLiveRuntime> | undefined;
export default async (request: Request, context: Context) => {
  try {
    runtime ??= createLiveRuntime();
    return await runtime.api(request, { ip: context.ip });
  } catch { return unavailable(); }
};
export const config: Config = { path: ['/api/enquiry-token', '/api/enquiries'] };
