import type { JSX } from 'react';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { installNetworkGuard } from './networkGuard';

import { PreviewProviders } from './PreviewProviders';
import { HomeSpecimen } from './specimens/home';
import { SmokeSpecimen } from './specimens/smoke';
import '@interface/styles/tokens.css';

declare global {
  interface Window {
    __SPECIMEN__?: { ready: boolean; name: string };
  }
}

installNetworkGuard();

const params = new URLSearchParams(window.location.search);
const specimen = params.get('specimen') ?? 'smoke';

function SpecimenRoot(): JSX.Element {
  switch (specimen) {
    case 'home':
      return <HomeSpecimen />;
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

window.__SPECIMEN__ = { ready: true, name: specimen };
