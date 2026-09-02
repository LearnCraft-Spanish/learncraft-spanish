import type { JSX } from 'react';
import { Button } from '@interface/components/general/Buttons/Button/Button';

/**
 * Student home scaffold for visual redesign loops.
 *
 * On branches where HomeV2 (and related chrome) exist, replace the placeholder
 * body below with those presentational components and fixture props — still no
 * Auth0 and no real API adapters.
 *
 * Design bar (outside repo): ~/Downloads/handoff/
 */
export function HomeSpecimen(): JSX.Element {
  return (
    <div
      data-gauntlet-specimen="home"
      style={{
        height: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        background: '#f0ede6',
        color: '#3c3c3c',
        fontFamily: 'Poppins, Avenir, Helvetica, sans-serif',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '0.5px solid rgba(60,60,60,0.13)',
          background: '#e7e3d9',
        }}
      >
        <strong style={{ fontSize: 16 }}>LearnCraft</strong>
        <span style={{ fontSize: 13, opacity: 0.7 }}>home specimen</span>
      </header>

      <main
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <section>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#b0a96f',
            }}
          >
            Scaffold
          </p>
          <h1 style={{ margin: '6px 0 8px', fontSize: 28, fontWeight: 900 }}>
            Student home
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.5,
              maxWidth: '42ch',
            }}
          >
            Wire real HomeV2 / AppHeader / QuizCTA / EntryCards here when they
            exist on your redesign branch. Keep fixtures local — never Auth0 or
            backend calls.
          </p>
        </section>

        <section
          style={{
            padding: 20,
            borderRadius: 12,
            background: '#449ac2',
            color: '#fff',
            maxWidth: 420,
          }}
        >
          <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>Start a quiz</h2>
          <p style={{ margin: '0 0 16px', fontSize: 14, opacity: 0.95 }}>
            Placeholder CTA matching the handoff hierarchy.
          </p>
          <Button type="button">Choose quiz</Button>
        </section>

        <section style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
          {['Flashcards', 'Audio quiz', 'Weekly progress'].map((label) => (
            <div
              key={label}
              style={{
                padding: '14px 16px',
                borderRadius: 10,
                background: '#fff',
                border: '0.5px solid rgba(60,60,60,0.13)',
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </section>
      </main>

      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: '10px 8px',
          borderTop: '0.5px solid rgba(60,60,60,0.13)',
          background: '#e7e3d9',
          fontSize: 12,
        }}
        aria-label="Tab bar scaffold"
      >
        <span>Home</span>
        <span>Review</span>
        <span>Find</span>
        <span>Help</span>
      </nav>
    </div>
  );
}
