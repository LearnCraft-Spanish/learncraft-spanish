import type { ExampleRecord } from '@LearnCraft-Spanish/shared';
import ExamplesTable from 'src/components/ExamplesTable/ExamplesTable';
import useSingleExampleCreator from 'src/hexagon/application/useCases/useSingleExampleCreator';
import ExampleCreateUpdateForm from '../components/ExampleManager/ExampleCreateUpdateForm';
import './SingleExampleCreatorPage.scss';

export default function SingleExampleCreatorPage() {
  const {
    hasEditAccess,
    selectedExampleId,
    setSelectedExampleId,

    createUpdateFormParams,

    showIncompleteOnly,
    setShowIncompleteOnly,
    vocabIncluded,
    setVocabIncluded,
    vocabSearchTerm,
    setVocabSearchTerm,
    vocabComplete,
    setVocabComplete,
    tableOption,
    setTableOption,
    quizId,
    setQuizId,
    quizExamplesQuery,
    officialQuizzesQuery,
    safeTableData,
    addToSelectedVocab,
    removeFromVocabIncluded,
    includedVocabObjects,
    handleVerifyExampleChange,
  } = useSingleExampleCreator();
  return (
    <div id="singleExampleCreatorPage">
      <div id="exampleCreator">
        <ExampleCreateUpdateForm
          {...createUpdateFormParams}
          vocabSearchTerm={vocabSearchTerm}
          setVocabSearchTerm={setVocabSearchTerm}
          vocabComplete={vocabComplete}
          setVocabComplete={setVocabComplete}
          tagsFilteredByInput={includedVocabObjects}
          addToSelectedVocab={addToSelectedVocab}
          includedVocabObjects={includedVocabObjects}
          removeFromVocabIncluded={removeFromVocabIncluded}
          handleVerifyExampleChange={handleVerifyExampleChange}
        />
      </div>
      <div id="vocabTagging"></div>
      <div id="exampleFilterControls">
        <select
          value={tableOption}
          onChange={(e) => setTableOption(e.target.value)}
        >
          <option value="none">Recently Edited</option>
          {/* {quizCourses.map((course) => (
            <option key={course.code} value={course.code}>
              {course.name}
            </option>
          ))} */}
        </select>
        <div className="filterToggleContainer">
          <p>Show Incomplete Only:</p>
          <label htmlFor="showIncompleteOnly" className="switch">
            <input
              type="checkbox"
              id="showIncompleteOnly"
              checked={showIncompleteOnly}
              onChange={() => setShowIncompleteOnly(!showIncompleteOnly)}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      <div id="exampleSelectorTable">
        {tableOption === 'none' && <h3>Recently Edited Examples</h3>}
        <ExamplesTable
          dataSource={safeTableData}
          displayOrder={safeTableData.map((example: ExampleRecord) => ({
            recordId: example.recordId,
          }))}
          selectFunction={hasEditAccess ? setSelectedExampleId : undefined}
          forceShowVocab
          studentContext={false}
        />
      </div>
    </div>
  );
}
