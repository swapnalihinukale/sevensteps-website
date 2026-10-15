import { defineConfig } from 'astro/config';
import { renderMode, loadSiteContent } from './src/lib/site-content.ts';

const mode = renderMode();
const integration = process.env.ENQUIRY_LOCAL_LAB === '1';
if (integration && (mode !== 'review' || process.env.NETLIFY || process.env.CONTEXT)) {
  throw new Error('Local enquiry integration requires a local review build without production or Netlify context.');
}
if (process.env.ENQUIRY_LOCAL_LAB && !integration) throw new Error('Unsupported local enquiry mode.');
if (mode === 'fixture' && (process.env.NETLIFY || process.env.CONTEXT)) throw new Error('Synthetic public rendering is local test output only.');
const content = loadSiteContent(mode);
export default defineConfig({
  output: 'static',
  site: content?.site.origin,
  outDir: integration ? './dist-integration' : mode === 'fixture' ? './dist-fixture' : './dist',
  publicDir: mode === 'fixture' ? './.generated/fixture-public' : mode === 'public' ? './.generated/public-assets' : './public',
  trailingSlash: 'always',
  server: { host: '127.0.0.1', port: 4321 },
  devToolbar: { enabled: false },
  vite: {
    define: {
      'import.meta.env.PUBLIC_SITE_MODE': JSON.stringify(mode),
      'import.meta.env.ENQUIRY_LOCAL_LAB': JSON.stringify(integration ? '1' : ''),
    },
    build: { sourcemap: false },
  },
});
