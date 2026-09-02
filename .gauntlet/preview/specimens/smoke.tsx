import type { JSX } from 'react';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { UiScope } from '@interface/components/general/UiScope/UiScope';

/**
 * Self-contained specimen that proves the capture loop without Downloads handoffs.
 */
export function SmokeSpecimen(): JSX.Element {
  return (
    <div
      data-gauntlet-specimen="smoke"
      style={{
        height: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 16,
        padding: 24,
        background: '#f0ede6',
        color: '#3c3c3c',
        fontFamily: 'Poppins, Avenir, Helvetica, sans-serif',
      }}
    >
      <UiScope flag="ui.student.help.v2">
        <p style={{ margin: 0, fontWeight: 700, fontSize: 20 }}>
          Gauntlet smoke
        </p>
        <p style={{ margin: '8px 0 16px', fontSize: 14, maxWidth: 42 * 8 }}>
          Auth0-free specimen using real Button + UiScope. No API calls.
        </p>
        <Button type="button">Continue</Button>
      </UiScope>
    </div>
  );
}
