import { loadSiteContent, renderMode } from '../src/lib/site-content.ts';
try {
  const mode = renderMode(process.argv[2]);
  if (mode === 'review') throw new Error('Use public or fixture mode for this check.');
  const view = loadSiteContent(mode);
  console.log(`${mode} content passed: ${view.stories.length} stories and ${Object.keys(view.photos).length} referenced photographs. Only public fields leave the validator.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Public content check failed.');
  process.exitCode = 1;
}
