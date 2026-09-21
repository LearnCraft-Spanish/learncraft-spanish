import type { VocabInfo } from '@application/units/useVocabInfo';
import type { SkillTag, Vocabulary } from '@learncraft-spanish/shared';
import type { JSX } from 'react';
import { Card, CardSection } from '@interface/components/general/Card/Card';
import { Popover } from '@interface/components/general/Popover/Popover';
import { TextInput } from '@interface/components/general/TextInput/TextInput';
import {
  setTagQuery,
  TagSuggestionList,
} from '@interface/components/tagFilter/TagSuggestionList';
import { WordChips } from '@interface/components/textQuiz/WordChips';
import { WordPanel } from '@interface/components/textQuiz/WordPanel';
import { WordPanelModal } from '@interface/components/textQuiz/WordPanelModal';
import { useMediaQuery } from '@interface/hooks/useMediaQuery';
import styles from './VocabSearchCard.module.scss';

const TAG_PLACEHOLDER = 'Search tags — vocabulary, idiom…';
const SUGGESTION_CAP = 6;

export interface VocabSearchCardProps {
  searchTerm: string;
  suggestions: SkillTag[];
  onSearchTermChange: (target?: EventTarget & HTMLInputElement) => void;
  onSelectTag: (tag: SkillTag) => void;
  selectedVocabulary: Vocabulary | null;
  selectionLoading: boolean;
  /** Whether the detail panel/modal for `selectedVocabulary` is open. */
  panelOpen: boolean;
  /** Refocusing the search bar closes the panel without losing the chip. */
  onClosePanel: () => void;
  /** Clicking the result chip reopens (or closes) the panel. */
  onToggleWordPanel: () => void;
  vocabInfoHook: (vocab: Vocabulary) => VocabInfo;
  /** The panel/modal's own close (X) button — forgets the chip entirely. */
  onClearSelection: () => void;
}

/**
 * Vocab-lookup search card: Finder-style tag search plus the quiz word-detail
 * panel. Props only — the page use case owns search state and vocabulary
 * resolution. Desktop anchors `WordPanel` under the chip; mobile opens
 * `WordPanelModal` (same split as TextQuizV2 / AudioQuizV2).
 */
export function VocabSearchCard({
  searchTerm,
  suggestions,
  onSearchTermChange,
  onSelectTag,
  selectedVocabulary,
  selectionLoading,
  panelOpen,
  onClosePanel,
  onToggleWordPanel,
  vocabInfoHook,
  onClearSelection,
}: VocabSearchCardProps): JSX.Element {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const searchOpen = searchTerm.trim().length > 0;
  const cappedSuggestions = suggestions.slice(0, SUGGESTION_CAP);

  return (
    <div className={styles.root}>
      <Card clip={false}>
        <CardSection>
          <div
            className={
              searchOpen
                ? `${styles.tagSearch} ${styles.tagSearchOpen}`
                : styles.tagSearch
            }
          >
            <Popover
              open={searchOpen}
              onDismiss={() => setTagQuery(onSearchTermChange, '')}
              trigger={
                <TextInput
                  id="vocab-lookup-tag-search"
                  value={searchTerm}
                  onChange={(value) => setTagQuery(onSearchTermChange, value)}
                  onFocus={onClosePanel}
                  placeholder={TAG_PLACEHOLDER}
                  leadingIcon="search"
                />
              }
            >
              <TagSuggestionList
                suggestions={cappedSuggestions}
                onSelect={onSelectTag}
              />
            </Popover>
          </div>
        </CardSection>

        {(selectedVocabulary !== null || selectionLoading) && (
          <CardSection divided>
            {selectionLoading && selectedVocabulary === null ? (
              <p className={styles.loading}>Loading word details…</p>
            ) : selectedVocabulary !== null ? (
              <div className={styles.detail}>
                <WordChips
                  vocabulary={[selectedVocabulary]}
                  selectedId={panelOpen ? selectedVocabulary.id : null}
                  onSelect={() => {
                    onToggleWordPanel();
                  }}
                  panel={
                    !isMobile && panelOpen ? (
                      <WordPanel
                        key={selectedVocabulary.id}
                        vocabulary={selectedVocabulary}
                        vocabInfoHook={vocabInfoHook}
                        onClose={onClearSelection}
                      />
                    ) : undefined
                  }
                />
              </div>
            ) : null}
          </CardSection>
        )}
      </Card>

      {isMobile && selectedVocabulary !== null && panelOpen && (
        <WordPanelModal
          key={selectedVocabulary.id}
          vocabulary={selectedVocabulary}
          vocabInfoHook={vocabInfoHook}
          onClose={onClearSelection}
        />
      )}
    </div>
  );
}
