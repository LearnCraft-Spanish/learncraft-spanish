import type { JSX } from 'react';
import { Button } from '@interface/components/general/Buttons';
import { EmptyState } from '@interface/components/general/EmptyState';
import { Menu } from '@interface/components/general/Menu';
import { NoticeBar } from '@interface/components/general/NoticeBar';
import { Popover } from '@interface/components/general/Popover';
import { Skeleton } from '@interface/components/general/Skeleton';
import {
  GallerySection,
  GallerySpecimen,
  GallerySpecimens,
} from '@interface/pages/UiGallery/GallerySection';
import { useState } from 'react';
import styles from './UiGallery.module.scss';

export function OverlaysSection(): JSX.Element {
  const [lightOpen, setLightOpen] = useState(false);
  const [darkOpen, setDarkOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [noticeShown, setNoticeShown] = useState(true);

  return (
    <>
      <GallerySection title="Popover">
        <GallerySpecimens>
          <GallerySpecimen label="light skin">
            <Popover
              open={lightOpen}
              onDismiss={() => setLightOpen(false)}
              trigger={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setLightOpen((open) => !open)}
                >
                  Open light popover
                </Button>
              }
            >
              <div className={styles.popoverBody}>
                Click outside or press Escape to dismiss.
              </div>
            </Popover>
          </GallerySpecimen>
          <GallerySpecimen label="navy skin">
            <Popover
              open={darkOpen}
              onDismiss={() => setDarkOpen(false)}
              skin="dark"
              trigger={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDarkOpen((open) => !open)}
                >
                  Open navy popover
                </Button>
              }
            >
              <div className={styles.popoverBody}>
                Used for vocabulary detail.
              </div>
            </Popover>
          </GallerySpecimen>
        </GallerySpecimens>
      </GallerySection>

      <GallerySection title="Menu">
        <Menu
          open={menuOpen}
          onDismiss={() => setMenuOpen(false)}
          label="Do more with these"
          align="start"
          trigger={
            <Button
              variant="secondary"
              leadingIcon="bolt"
              trailingIcon="chevronDown"
              onClick={() => setMenuOpen((open) => !open)}
            >
              Do more with these
            </Button>
          }
          items={[
            {
              id: 'apply',
              icon: 'filter',
              label: 'Use these filters on my flashcards',
              hint: 'Switches to your own set',
              onSelect: () => setMenuOpen(false),
            },
            {
              id: 'quiz',
              icon: 'brain',
              label: 'Quiz me on these',
              hint: 'Starts a custom quiz',
              onSelect: () => setMenuOpen(false),
            },
            {
              id: 'copy',
              icon: 'clipboardCopy',
              label: 'Copy all examples',
              badge: 'Admin only',
              onSelect: () => setMenuOpen(false),
            },
          ]}
        />
      </GallerySection>

      <GallerySection title="Empty state">
        <EmptyState
          icon="searchOff"
          title="No examples match these filters"
          guidance="Try widening the lesson range, or remove a tag to see more."
          action={
            <Button variant="secondary" size="sm">
              Reset all filters
            </Button>
          }
        />
      </GallerySection>

      <GallerySection title="Notice bar">
        {noticeShown ? (
          <NoticeBar
            message="12 flashcards added to your working set"
            actionLabel="Undo"
            onAction={() => setNoticeShown(false)}
            onDismiss={() => setNoticeShown(false)}
            autoDismissMs={0}
          />
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setNoticeShown(true)}
          >
            Show the notice again
          </Button>
        )}
      </GallerySection>

      <GallerySection title="Skeleton">
        <Skeleton label="Loading examples" count={5} />
      </GallerySection>
    </>
  );
}
