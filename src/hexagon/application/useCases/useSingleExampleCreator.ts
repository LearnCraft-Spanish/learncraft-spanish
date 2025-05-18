import type { ExampleRecord } from '@LearnCraft-Spanish/shared';
import { CreateExampleRecordSchema } from '@LearnCraft-Spanish/shared';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useOfficialQuizzes } from 'src/hooks/CourseData/useOfficialQuizzes';
import { useVocabulary } from 'src/hooks/CourseData/useVocabulary';
import { useModal } from 'src/hooks/useModal';
import { useUserData } from 'src/hooks/UserData/useUserData';
import { useRecentlyEditedExamples } from '../units/examples/data/useRecentlyEditedExamples';

import { useUnverifiedExamples } from '../units/examples/data/useUnverifiedExamples';

interface ExampleDetails {
  spanishExample: string;
  englishTranslation: string;
  spanishAudioLa: string;
  englishAudio: string;
}
export default function useSingleExampleCreator() {
  // This hook should be moved to hexagon
  const userDataQuery = useUserData();
  // This hook should be moved to hexagon
  const { openModal, closeModal } = useModal();

  const hasEditAccess = userDataQuery.data?.roles.adminRole === 'admin';
  const [selectedExampleId, setSelectedExampleId] = useState<number | null>(
    null,
  );
  const [quizId, setQuizId] = useState<number | undefined>(undefined);
  // This hook should be moved to hexagon
  const { quizExamplesQuery, officialQuizzesQuery, updateQuizExample } =
    useOfficialQuizzes(quizId);
  const recentlyEditedExamplesQuery = useRecentlyEditedExamples();
  // This hook should be moved to hexagon
  const { vocabularyQuery } = useVocabulary();

  const { createUnverifiedExample } = useUnverifiedExamples();

  const tempIdCounter = useRef(0);
  const [tableOption, setTableOption] = useState('none');
  const [vocabIncluded, setVocabIncluded] = useState<string[]>([]);
  const [vocabSearchTerm, setVocabSearchTerm] = useState('');
  const [vocabComplete, setVocabComplete] = useState(false);
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);
  const [exampleDetails, setExampleDetails] = useState<ExampleDetails>({
    spanishExample: '',
    englishTranslation: '',
    spanishAudioLa: '',
    englishAudio: '',
  });

  const editOrCreate = useMemo(() => {
    return selectedExampleId && selectedExampleId > 0 ? 'edit' : 'create';
  }, [selectedExampleId]);

  const addToSelectedVocab = useCallback(
    (vocabTerm: string) => {
      if (vocabTerm && !vocabIncluded.includes(vocabTerm)) {
        setVocabIncluded([...vocabIncluded, vocabTerm]);
        setVocabSearchTerm('');
      }
    },
    [vocabIncluded],
  );

  const removeFromVocabIncluded = useCallback(
    (vocabName: string) => {
      setVocabIncluded(vocabIncluded.filter((vocab) => vocab !== vocabName));
    },
    [vocabIncluded],
  );

  const includedVocabObjects = useMemo(() => {
    const mappedVocab = vocabIncluded
      .map((vocab) => {
        return vocabularyQuery.data?.find(
          (word) => word.descriptionOfVocabularySkill === vocab,
        );
      })
      .filter((vocab) => vocab !== undefined) as any[];
    return mappedVocab;
  }, [vocabIncluded, vocabularyQuery.data]);

  // This needs to be refactored, consider using zod to validate the example, based on create/update/unverifed/verified
  const exampleToSave = useMemo<ExampleRecord>(() => {
    return {
      recordId: selectedExampleId ?? tempIdCounter.current--,
      spanishExample: exampleDetails.spanishExample,
      englishTranslation: exampleDetails.englishTranslation,
      spanishAudioLa:
        exampleDetails.spanishAudioLa.length > 0
          ? exampleDetails.spanishAudioLa
          : undefined,
      englishAudio:
        exampleDetails.englishAudio.length > 0
          ? exampleDetails.englishAudio
          : undefined,
      spanglish: exampleDetails.spanishExample.includes('*')
        ? 'spanglish'
        : 'esp',
      vocabIncluded,
      vocabComplete: selectedExampleId ? vocabComplete : false,
    };
  }, [selectedExampleId, exampleDetails, vocabComplete, vocabIncluded]);

  const tableData = useMemo(() => {
    let data;
    if (tableOption === 'none') {
      data = recentlyEditedExamplesQuery.data;
    } else {
      data = quizExamplesQuery.data;
    }

    if (showIncompleteOnly && data) {
      return data.filter((example) => !example.vocabComplete);
    }

    return data;
  }, [
    tableOption,
    quizExamplesQuery.data,
    recentlyEditedExamplesQuery.data,
    showIncompleteOnly,
  ]);

  async function handleAddExample() {
    const createExampleRecord = CreateExampleRecordSchema.parse(exampleToSave);
    // this should be done by zod, but I dont want to push a 1 line change to the example schema
    // The schema is updated, but not live
    // REMOVE WHEN: shared package is above version 0.2.25
    // manually remove vocabIncluded
    const { vocabIncluded, ...rest } = createExampleRecord;
    const manualParsedCreateExampleRecord = {
      ...rest,
    };
    await createUnverifiedExample(manualParsedCreateExampleRecord);
    recentlyEditedExamplesQuery.refetch();
  }

  function submitExample(e: React.FormEvent) {
    e.preventDefault();
    // use editOrCreate to determine if we are editing or creating
    if (editOrCreate === 'edit') {
      handleEditExample(e);
    } else {
      handleAddExample();
    }
  }

  const finalizeVerifyExampleChange = (confirmSubmissionValue: boolean) => {
    setVocabComplete(confirmSubmissionValue);
    closeModal();
  };

  const handleVerifyExampleChange = (newValue: boolean) => {
    if (newValue) {
      openModal({
        title: 'Are you sure?',
        body: 'Warning! You are about to mark this example as "Vocab Complete", making it visible to students. This action can ONLY be undone through the QuickBase app',
        type: 'confirm',
        confirmFunction: () => finalizeVerifyExampleChange(true),
        cancelFunction: () => finalizeVerifyExampleChange(false),
      });
    } else {
      setVocabComplete(false);
    }
  };

  const safeTableData = tableData ?? [];

  return {
    selectedExampleId,
    setSelectedExampleId,
    hasEditAccess,

    // form data
    createUpdateFormParams: {
      editOrCreate,
      onSubmit: submitExample,
      selectedExampleId,
      spanishExample: exampleDetails.spanishExample,
      setSpanishExample: (value: string) =>
        setExampleDetails((prev) => ({ ...prev, spanishExample: value })),
      englishTranslation: exampleDetails.englishTranslation,
      setEnglishTranslation: (value: string) =>
        setExampleDetails((prev) => ({ ...prev, englishTranslation: value })),
      spanishAudioLa: exampleDetails.spanishAudioLa,
      setSpanishAudioLa: (value: string) =>
        setExampleDetails((prev) => ({ ...prev, spanishAudioLa: value })),
      englishAudio: exampleDetails.englishAudio,
      setEnglishAudio: (value: string) =>
        setExampleDetails((prev) => ({ ...prev, englishAudio: value })),
      // Include vocab data and operations
    },
    // vocab data / filtering? data
    showIncompleteOnly,
    setShowIncompleteOnly,
    vocabIncluded,
    setVocabIncluded,

    vocabSearchTerm,
    setVocabSearchTerm,
    vocabComplete,
    setVocabComplete,
    includedVocabObjects,
    addToSelectedVocab,
    removeFromVocabIncluded,
    handleVerifyExampleChange,
    // table data
    safeTableData,

    tableData,
    tableOption,
    setTableOption,
    // quiz data
    quizId,
    setQuizId,
  };
}
