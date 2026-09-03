import type { JSX } from 'react';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { installNetworkGuard } from './networkGuard';

import { PreviewProviders } from './PreviewProviders';
import { HomeSpecimen } from './specimens/home';
import { SmokeSpecimen } from './specimens/smoke';
import { TextQuizSpecimen } from './specimens/text-quiz';
import '@interface/styles/tokens.css';

declare global {
  interface Window {
    __SPECIMEN__?: { ready: boolean; name: string };
  }
}

installNetworkGuard();

const params = new URLSearchParams(window.location.search);
const specimen = params.get('specimen') ?? 'smoke';

/** Specimens that set `ready` themselves after async setup (e.g. chip click). */
const DEFERS_READY = new Set(['text-quiz']);

function SpecimenRoot(): JSX.Element {
  switch (specimen) {
    case 'home':
      return <HomeSpecimen />;
    case 'text-quiz':
      return <TextQuizSpecimen />;
    case 'smoke':
    default:
      return <SmokeSpecimen />;
  }
}

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('[gauntlet] #root missing');
}

createRoot(rootEl).render(
  <StrictMode>
    <PreviewProviders>
      <SpecimenRoot />
    </PreviewProviders>
  </StrictMode>,
);

window.__SPECIMEN__ = {
  ready: !DEFERS_READY.has(specimen),
  name: specimen,
};
