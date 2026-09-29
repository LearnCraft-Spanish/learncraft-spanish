import type { ComponentType, JSX } from 'react';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { installNetworkGuard } from './networkGuard';

import { PreviewProviders } from './PreviewProviders';
import '@interface/styles/tokens.css';
import 'src/index.css';
import 'src/App.css';
import 'src/contextual.scss';

import * as authAdapterModule from '@application/adapters/authAdapter';

const gauntletAuth = authAdapterModule as { GAUNTLET_STUB?: boolean };
if (gauntletAuth.GAUNTLET_STUB !== true) {
  throw new Error('[gauntlet] auth stub did not load');
}

declare global {
  interface Window {
    __SPECIMEN__?: { ready: boolean; name: string; blocked?: number };
  }
}

type SpecimenModule = {
  default: ComponentType;
  deferReady?: boolean;
};

installNetworkGuard();

const params = new URLSearchParams(window.location.search);
const requested = params.get('specimen') ?? 'smoke';

const modules = import.meta.glob<SpecimenModule>('./specimens/*.tsx', {
  eager: true,
});

function specimenNameFromPath(path: string): string {
  const file = path.split('/').pop() ?? '';
  return file.replace(/\.tsx$/, '');
}

const byName = new Map<string, SpecimenModule>();
for (const [path, mod] of Object.entries(modules)) {
  byName.set(specimenNameFromPath(path), mod);
}

const resolvedName = byName.has(requested) ? requested : 'smoke';
if (resolvedName !== requested) {
  console.warn(
    `[gauntlet] specimen "${requested}" not found; falling back to smoke`,
  );
}

const resolved = byName.get(resolvedName);
if (!resolved?.default) {
  throw new Error(
    `[gauntlet] specimen "${resolvedName}" has no default export`,
  );
}

const Specimen = resolved.default;
const deferReady = resolved.deferReady === true;

function SpecimenRoot(): JSX.Element {
  return <Specimen />;
}

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('[gauntlet] #root missing');
}

window.__SPECIMEN__ = { ready: false, name: resolvedName, blocked: 0 };
createRoot(rootEl).render(
  <StrictMode>
    <PreviewProviders>
      <SpecimenRoot />
    </PreviewProviders>
  </StrictMode>,
);
window.__SPECIMEN__.ready = !deferReady;
