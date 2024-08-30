import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react'

import { useBackend } from './hooks/useBackend'

import { formatEnglishText, formatSpanishText } from './functions/formatFlashcardText'
import { useActiveStudent } from './hooks/useActiveStudent'

import './App.css'

import LessonSelector from './LessonSelector'
import type { Flashcard, Lesson, Program, VocabTag, Vocabulary } from './interfaceDefinitions'

interface FlashcardFinderProps {
  selectedProgram: Program | null
  selectedLesson: Lesson | null
  updateSelectedProgram: (programId: number | string) => void
  updateSelectedLesson: (lessonId: number | string) => void
  contextual: string
  openContextual: (currentContextual: string) => void
}

// This script displays the Database Tool (Example Retriever), where coaches can lookup example sentences on the database by vocab word
const FlashcardFinder = forwardRef<HTMLDivElement, FlashcardFinderProps>(
  (
    {
      selectedProgram,
      selectedLesson,
      updateSelectedProgram,
      updateSelectedLesson,
      contextual,
      openContextual,
    }: FlashcardFinderProps,
    currentContextual,
  ) => {
    const { activeStudent, studentFlashcardData, programTable, addToActiveStudentFlashcards } = useActiveStudent()
    const {
      getVerifiedExamplesFromBackend,
      getVocabFromBackend,
    } = useBackend()
    const isMounted = useRef(false)
    const [loadStep, setLoadStep] = useState(0)
    const [tagSearchTerm, setTagSearchTerm] = useState('')
    const vocabularyTable = useRef<Vocabulary[]>([])
    const tagTable = useRef<VocabTag[]>([])
    const exampleTable = useRef<Flashcard[]>([])
    const [suggestedTags, setSuggestedTags] = useState<VocabTag[]>([])
    const [requiredTags, setRequiredTags] = useState<VocabTag[]>([])
    const [noSpanglish, setNoSpanglish] = useState(false)
    const [displayExamples, setDisplayExamples] = useState<Flashcard[]>([])
    const displayExamplesWithAudio = useRef<Flashcard[]>(displayExamples.filter(filterByHasAudio))

    function filterByHasAudio(example: Flashcard) {
      if (example.spanishAudioLa) {
        if (example.spanishAudioLa.length > 0) {
          return true
        }
        return false
      }
      return false
    }

    function toggleSpanglish() {
      if (noSpanglish) {
        setNoSpanglish(false)
      }
      else {
        setNoSpanglish(true)
      }
    }

    function updateTagSearchTerm(target: EventTarget & HTMLInputElement) {
      openContextual('tagSuggestionBox')
      setTagSearchTerm(target.value)
    }

    function addTagToRequiredTags(id: number) {
      const tagObject = tagTable.current.find(object => object.id === id)
      if (tagObject && !requiredTags.find(tag => tag.id === id)) {
        const newRequiredTags = [...requiredTags]
        newRequiredTags.push(tagObject)
        setRequiredTags(newRequiredTags)
      }
    }

    function removeTagFromRequiredTags(id: number) {
      const newRequiredTags = [...requiredTags].filter(item => item.id !== id)
      setRequiredTags(newRequiredTags)
    }

    const filterExamplesByAllowedVocab = useCallback((examples: Flashcard[]) => {
      if (selectedLesson?.vocabKnown) {
        const allowedVocab = selectedLesson.vocabKnown
        // console.log(allowedVocab)
        const filteredByAllowed = examples.filter((item) => {
          let isAllowed = true
          if (item.vocabIncluded.length === 0 || item.vocabComplete === false) {
            isAllowed = false
          }
          item.vocabIncluded.forEach((word) => {
            if (!allowedVocab.includes(word)) {
              isAllowed = false
            }
          })
          // console.log(`Item: ${item.vocabIncluded} Status: ${isAllowed}`)
          return isAllowed
        })
        return filteredByAllowed
      }
      else {
        return examples
      }
    }, [selectedLesson])

    const labelAssignedExamples = useCallback((examples: Flashcard[]) => {
      const newArray = [...examples]
      newArray.forEach((example) => {
        const assignedExample = studentFlashcardData?.studentExamples.find(
          item => item.relatedExample === example.recordId,
        )
        if (assignedExample) {
          example.isCollected = true
        }
        else {
          example.isCollected = false
        }
      })
      return newArray
    }, [studentFlashcardData])

    const filterExamplesBySelectedTags = useCallback((examples: Flashcard[]) => {
      if (requiredTags.length > 0) {
        const filteredExamples = examples.filter((example) => {
          if (
            example.vocabIncluded.length === 0
            || example.vocabComplete === false
          ) {
            return false
          }
          // console.log(example.vocabIncluded)
          let isGood = false
          requiredTags.forEach((tag) => {
            // console.log(word.vocabName)
            if (!isGood) {
              switch (tag.type) {
                case 'subcategory':
                  example.vocabIncluded.forEach((item) => {
                    const word = vocabularyTable.current.find(
                      element => element.vocabName === item,
                    )
                    if (word?.vocabularySubcategorySubcategoryName === tag.tag) {
                      isGood = true
                    }
                  })
                  break
                case 'verb':
                  example.vocabIncluded.forEach((item) => {
                    const word = vocabularyTable.current.find(
                      element => element.vocabName === item,
                    )
                    if (word?.verbInfinitive === tag.tag) {
                      isGood = true
                    }
                  })
                  break
                case 'conjugation':
                  example.vocabIncluded.forEach((item) => {
                    const word = vocabularyTable.current.find(
                      element => element.vocabName === item,
                    )
                    word?.conjugationTags.forEach((conjugationTag) => {
                      if (conjugationTag === tag.tag) {
                        isGood = true
                      }
                    })
                  })
                  break
                case 'vocabulary':
                  example.vocabIncluded.forEach((item) => {
                    const word = vocabularyTable.current.find(
                      element => element.vocabName === item,
                    )
                    if (word?.wordIdiom === tag.tag) {
                      isGood = true
                    }
                  })
                  break
                case 'idiom':
                  example.vocabIncluded.forEach((item: string) => {
                    const word = vocabularyTable.current.find(
                      element => element.vocabName === item,
                    )
                    if (word?.wordIdiom === tag.tag) {
                      isGood = true
                    }
                  })
                  break
              }
            }
          })
          return isGood
        })
        return filteredExamples
      }
      else {
        return examples
      }
    }, [requiredTags])

    const filterBySpanglish = useCallback((examples: Flashcard[]) => {
      if (noSpanglish) {
        const filteredBySpanglish = examples.filter((item) => {
          if (item.spanglish === 'esp') {
            return true
          }
          return false
        })
        return filteredBySpanglish
      }
      else {
        return examples
      }
    }, [noSpanglish])

    const shuffleExamples = useCallback((examples: Flashcard[]) => {
      const array = [...examples]
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
      }
      return array
    }, [])

    const getFilteredExamples = useCallback((table: Flashcard[]) => {
      const allExamples = [...table]
      const filteredBySpanglish = filterBySpanglish(allExamples)
      const filteredByAllowed
        = filterExamplesByAllowedVocab(filteredBySpanglish)
      const filteredByTags = filterExamplesBySelectedTags(filteredByAllowed)
      // console.log(shuffledSentences)
      return filteredByTags
    }, [filterBySpanglish, filterExamplesByAllowedVocab, filterExamplesBySelectedTags])

    // called when user clicks 'Copy as Table' button
    // copies sentences in a table format to be pasted into a google doc or excel sheet
    function copyTable() {
      const headers = 'ID\tSpanish\tEnglish\tAudio_Link\n'
      const table = displayExamples
        .map(
          example =>
            `${example.recordId}\t${example.spanishExample}\t${
              example.englishTranslation
            }\t${example.spanishAudioLa}`,
        )
        .join('\n')

      const copiedText = headers + table
      navigator.clipboard.writeText(copiedText)
    }

    const filterTagsByInput = useCallback((tagInput: string) => {
      function filterBySearch(tag: VocabTag) {
        const lowerTerm = tag.tag.toLowerCase()
        const lowerTagInput = tagInput.toLowerCase()
        if (lowerTerm.includes(lowerTagInput)) {
          return true
        }
        return false
      }

      function filterByActiveTags(tag: VocabTag) {
        const matchFound = requiredTags.find(item => item.id === tag.id)
        if (matchFound) {
          return false
        }
        return true
      }
      const filteredBySearch = tagTable.current.filter(filterBySearch)
      const filteredByActiveTags = filteredBySearch.filter(filterByActiveTags)
      const suggestTen = []
      for (let i = 0; i < 10; i++) {
        if (filteredByActiveTags[i]) {
          suggestTen.push(filteredByActiveTags[i])
        }
      }
      setSuggestedTags(suggestTen)
    }, [requiredTags])

    // function filterTagsByInput

    function sortVocab(a: Vocabulary, b: Vocabulary) {
      if (a.frequencyRank === b.frequencyRank) {
        if (!a.wordIdiom.includes(' ') && b.wordIdiom.includes(' ')) {
          return 1
        }
        else if (a.wordIdiom.includes(' ') && !b.wordIdiom.includes(' ')) {
          return -1
        }
      }
      else {
        return a.frequencyRank - b.frequencyRank
      }
      return 0
    }

    const setupVocabTable = useCallback(async () => {
      try {
        const vocab = await getVocabFromBackend()
        const tags: VocabTag[] = []
        vocab?.forEach((term) => {
          if (term.vocabularySubcategorySubcategoryName) {
            const subcatTag = {
              type: 'subcategory',
              tag: term.vocabularySubcategorySubcategoryName,
              id: tags.length,
            }
            if (
              !tags.find(
                item =>
                  item.type === 'subcategory'
                  && item.tag === term.vocabularySubcategorySubcategoryName,
              )
            ) {
              tags.push(subcatTag)
            }
          }
          if (term.verbInfinitive) {
            const infinitiveTag = {
              type: 'verb',
              tag: term.verbInfinitive,
              id: tags.length,
            }
            if (
              !tags.find(
                item =>
                  item.type === 'verb' && item.tag === term.verbInfinitive,
              )
            ) {
              tags.push(infinitiveTag)
            }
          }
          if (term.conjugationTags.length > 0) {
            term.conjugationTags.forEach((conjugation) => {
              const conjugationTag = {
                type: 'conjugation',
                tag: conjugation,
                id: tags.length,
              }
              if (
                !tags.find(
                  item =>
                    item.type === 'conjugation' && item.tag === conjugation,
                )
              ) {
                tags.push(conjugationTag)
              }
            })
          }
          if (term.wordIdiom) {
            if (
              term.vocabularySubcategorySubcategoryName
                .toLowerCase()
                .includes('idiom')
            ) {
              const idiomTag = {
                type: 'idiom',
                tag: term.wordIdiom,
                id: tags.length,
              }
              if (
                !tags.find(
                  item =>
                    item.type === 'idiom' && item.tag === term.wordIdiom,
                )
              ) {
                tags.push(idiomTag)
              }
            }
            else {
              const vocabTag = {
                type: 'vocabulary',
                tag: term.wordIdiom,
                id: tags.length,
              }
              if (
                !tags.find(
                  item =>
                    item.type === 'vocabulary' && item.tag === term.wordIdiom,
                )
              ) {
                tags.push(vocabTag)
              }
            }
          }
        })
        tagTable.current = tags
        return vocab?.sort(sortVocab)
      }
      catch (e: unknown) {
        if (e instanceof Error) {
          console.error(e.message)
        }
        else {
          console.error('An unexpected error occurred:', e)
        }
      }
    }, [getVocabFromBackend])

    async function addFlashcard(exampleId: string) {
      const exampleIdNumber = Number.parseInt(exampleId)
      const exampleToUpdate = displayExamples.find(
        example => example.recordId === exampleIdNumber,
      )
      if (!exampleToUpdate) {
        return
      }
      const tableExample = exampleTable.current.find(example => example.recordId === exampleIdNumber)
      if (tableExample) {
        tableExample.isCollected = true
      }
      const newDisplayExampleTable = [...displayExamples]
      const exampleIndex = newDisplayExampleTable.findIndex(example => example.recordId === exampleIdNumber)
      const newFlashcardObject = { ...exampleToUpdate }
      newFlashcardObject.isCollected = true
      newDisplayExampleTable[exampleIndex] = newFlashcardObject
      setDisplayExamples(newDisplayExampleTable)
      addToActiveStudentFlashcards(exampleIdNumber).then((addResponse) => {
        if (addResponse !== 1) {
          if (tableExample) {
            tableExample.isCollected = false
          }
          const revertedExampleTable = [...displayExamples]
          const exampleIndex = revertedExampleTable.findIndex(example => example.recordId === exampleIdNumber)
          const newFlashcardObject = { ...exampleToUpdate }
          newFlashcardObject.isCollected = false
          revertedExampleTable[exampleIndex] = newFlashcardObject
          setDisplayExamples(revertedExampleTable)
        }
      })
    }

    function displayExamplesTable() {
      const tableToDisplay = displayExamples.map(item => (
        <div className="exampleCard" key={item.recordId}>
          <div className="exampleCardSpanishText">
            {formatSpanishText(item.spanglish, item.spanishExample)}
          </div>
          <div className="exampleCardEnglishText">
            {formatEnglishText(item.englishTranslation)}
          </div>
          {activeStudent?.role === 'student' && !item.isCollected && (
            <button
              type="button"
              className="addButton"
              value={item.recordId}
              onClick={e => addFlashcard(e.currentTarget.value)}
            >
              Add
            </button>
          )}
          {activeStudent?.role === 'student' && item.isCollected && (
            <button type="button" className="ownedButton" value={item.recordId}>
              Owned
            </button>
          )}
        </div>
      ))
      return tableToDisplay
    }

    // called onced at the beginning
    useEffect(() => {
      async function startUp() {
        if (loadStep === 0) {
          isMounted.current = true
          const getData = async () => {
            Promise.all([setupVocabTable(), getVerifiedExamplesFromBackend()])
              .then((result) => {
                const vocabResult = result[0]
                const exampleResult = result[1]
                if (vocabResult && exampleResult) {
                  vocabularyTable.current = vocabResult
                  exampleTable.current = exampleResult
                  setLoadStep(1)
                }
              })
          }
          getData()
        }
      }
      if (!isMounted.current) {
        startUp()
      }
    }, [loadStep, getVerifiedExamplesFromBackend, setupVocabTable])

    useEffect(() => {
      if (loadStep === 1) {
        const labeledExamples = labelAssignedExamples(exampleTable.current)
        const filteredExamples = getFilteredExamples(labeledExamples)
        const shuffledExamples = shuffleExamples(filteredExamples)
        setDisplayExamples(shuffledExamples)
        setLoadStep(2)
      }
    }, [loadStep, getFilteredExamples, shuffleExamples, labelAssignedExamples])

    useEffect(() => {
      filterTagsByInput(tagSearchTerm)
    }, [tagSearchTerm, requiredTags, contextual, filterTagsByInput])

    useEffect(() => {
      if (loadStep === 2 && selectedLesson?.recordId) {
        const newExampleTable = getFilteredExamples(exampleTable.current)
        const randomizedExamples = shuffleExamples(newExampleTable)
        setDisplayExamples(randomizedExamples)
      }
    }, [
      selectedLesson?.recordId,
      requiredTags,
      noSpanglish,
      loadStep,
      shuffleExamples,
      getFilteredExamples,
    ])

    return (
      <div className="flashcardFinder">
        {loadStep < 2 && (
          <div>
            <h2>Loading Flashcard Data...</h2>
          </div>
        )}

        {loadStep === 2 && (
          <div>
            <div className="flashcardFinderHeader">
              <h2>Flashcard Finder</h2>
              <div className="filterSection">
                <div className="filterBox">
                  <div className="removeSpanglishBox">
                    <h3>Spanglish</h3>
                    {!noSpanglish && (
                      <button
                        type="button"
                        style={{ backgroundColor: 'darkgreen' }}
                        onClick={toggleSpanglish}
                      >
                        Included
                      </button>
                    )}
                    {noSpanglish && (
                      <button
                        type="button"
                        style={{ backgroundColor: 'darkred' }}
                        onClick={toggleSpanglish}
                      >
                        Excluded
                      </button>
                    )}
                  </div>
                  <LessonSelector
                    programTable={programTable}
                    selectedLesson={selectedLesson}
                    updateSelectedLesson={updateSelectedLesson}
                    selectedProgram={selectedProgram}
                    updateSelectedProgram={updateSelectedProgram}
                  />
                </div>
                <div className="filterBox">
                  <div className="searchFilter">
                    <h3>Search</h3>
                    <div className="tagSearchBox">
                      <div className="searchTermBox">
                        <input
                          type="text"
                          onChange={e => updateTagSearchTerm(e.currentTarget)}
                          onClick={() => openContextual('tagSuggestionBox')}
                        />
                        <br></br>
                      </div>
                    </div>
                    {tagSearchTerm.length > 0
                    && contextual === 'tagSuggestionBox'
                    && suggestedTags.length > 0 && (
                      <div
                        className="tagSuggestionBox"
                        ref={currentContextual}
                      >

                        {suggestedTags.map(item => (
                          <div
                            key={item.id}
                            className="vocabCard"
                            onClick={() => addTagToRequiredTags(item.id)}
                          >
                            <h4 className="vocabName">{item.tag}</h4>
                            <p className="vocabUse">{item.type}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {requiredTags.length > 0 && (
                      <div className="selectedVocab">
                        <h5>Search Terms:</h5>
                        {requiredTags.map(item => (
                          <div
                            key={item.id}
                            className="vocabSmallCard"
                            onClick={() => removeTagFromRequiredTags(item.id)}
                          >
                            <h4 className="vocabName">{item.tag}</h4>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="examplesTable">
              <div className="buttonBox">
                <button type="button" onClick={copyTable}>Copy Table</button>
                <div className="displayExamplesDescription">
                  <h4>
                    {`${displayExamples.length} flashcards showing (
                    ${displayExamplesWithAudio.current?.length} with audio)`}
                  </h4>
                </div>
              </div>
              {displayExamplesTable()}
            </div>
          </div>
        )}
      </div>
    )
  },
)

export default FlashcardFinder
