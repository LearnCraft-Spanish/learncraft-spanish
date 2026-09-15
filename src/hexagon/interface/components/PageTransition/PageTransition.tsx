import type { SlideDirection } from '@interface/components/PageTransition/usePageTransition';
import type { JSX, ReactNode, RefObject } from 'react';
import { usePageTransition } from '@interface/components/PageTransition/usePageTransition';
import { Component, createRef } from 'react';
import { flushSync } from 'react-dom';
import styles from './PageTransition.module.scss';

interface PageTransitionProps {
  children: ReactNode;
}

interface IncomingPanelProps {
  pathname: string;
  enabled: boolean;
  direction: SlideDirection | null;
  children: ReactNode;
  onCaptured: (html: string, fromPath: string, toPath: string) => void;
}

/**
 * Captures the outgoing page's DOM in `getSnapshotBeforeUpdate` so the
 * clone is the previous screen, not the one React has just committed.
 */
class IncomingPanel extends Component<IncomingPanelProps> {
  private readonly panelRef: RefObject<HTMLDivElement | null> =
    createRef<HTMLDivElement>();

  public getSnapshotBeforeUpdate(
    prevProps: IncomingPanelProps,
  ): { html: string; fromPath: string; toPath: string } | null {
    if (
      this.props.enabled &&
      prevProps.pathname !== this.props.pathname &&
      this.panelRef.current !== null
    ) {
      return {
        html: this.panelRef.current.innerHTML,
        fromPath: prevProps.pathname,
        toPath: this.props.pathname,
      };
    }
    return null;
  }

  public componentDidUpdate(
    _prevProps: IncomingPanelProps,
    _prevState: unknown,
    snapshot: { html: string; fromPath: string; toPath: string } | null,
  ): void {
    if (snapshot !== null) {
      flushSync(() => {
        this.props.onCaptured(
          snapshot.html,
          snapshot.fromPath,
          snapshot.toPath,
        );
      });
    }
  }

  public render(): JSX.Element {
    const { direction, children } = this.props;
    const className =
      direction === null
        ? styles.incoming
        : `${styles.incoming} ${styles.incomingAnimating} ${
            direction === 'forward'
              ? styles.slideInFromRight
              : styles.slideInFromLeft
          } ${
            direction === 'forward'
              ? styles.incomingForward
              : styles.incomingBack
          }`;

    return (
      <div ref={this.panelRef} className={className}>
        {children}
      </div>
    );
  }
}

/**
 * Mobile student-v2 route slide. Header stays pinned (this wraps only the
 * routed body). Direction comes from the stack parent tree, not history.
 */
export function PageTransition({ children }: PageTransitionProps): JSX.Element {
  const { pathname, enabled, ghost, handleCaptured, handleAnimationEnd } =
    usePageTransition();

  return (
    <div
      className={
        ghost !== null
          ? `${styles.stage} ${styles.stageAnimating}`
          : styles.stage
      }
    >
      {ghost !== null && (
        <div
          className={`${styles.ghost} ${
            ghost.direction === 'forward'
              ? `${styles.slideOutToLeft} ${styles.ghostForward}`
              : `${styles.slideOutToRight} ${styles.ghostBack}`
          }`}
          aria-hidden
          onAnimationEnd={handleAnimationEnd}
          dangerouslySetInnerHTML={{ __html: ghost.html }}
        />
      )}
      <IncomingPanel
        pathname={pathname}
        enabled={enabled}
        direction={ghost?.direction ?? null}
        onCaptured={handleCaptured}
      >
        {children}
      </IncomingPanel>
    </div>
  );
}
