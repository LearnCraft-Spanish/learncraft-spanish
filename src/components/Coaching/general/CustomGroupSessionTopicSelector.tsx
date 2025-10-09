import { InlineLoading } from '@interface/components/Loading';
import { useMemo, useState } from 'react';
import { useModal } from 'src/hexagon/interface/hooks/useModal';
import './CustomGroupSessionTopicSelector.scss';

export default function CustomGroupSessionTopicSelector({
  selectedTopic,
  selectTopicFunction,
  topicOptions,
  addNewTopicFunction,
  isLoading,
  removeSelectedTopicFunction,
}: {
  selectedTopic: string;
  selectTopicFunction: (topic: string) => void;
  topicOptions: string[];
  addNewTopicFunction: (searchString: string) => void;
  isLoading: boolean;
  removeSelectedTopicFunction: () => void;
}) {
  const [searchString, setSearchString] = useState('');
  const { openModal, closeModal } = useModal();

  const [optionsVisible, setOptionsVisible] = useState(false);

  const searchTopicOptions = useMemo(() => {
    if (searchString === '') return [];
    return topicOptions.filter((topic) =>
      topic.toLowerCase().includes(searchString.toLowerCase()),
    );
  }, [topicOptions, searchString]);

  function handleAddNewTopic(searchString: string) {
    openModal({
      title: 'Add New Topic',
      body: `Are you sure you want to add the topic "${searchString}"? Please double check the spelling, and that it does not already exist.`,
      type: 'confirm',
      confirmFunction: async () => {
        closeModal();
        await addNewTopicFunction(searchString);
        selectTopicFunction(searchString);
        setSearchString('');
      },
    });
  }

  return (
    <div
      id="searchStudentWrapper"
      className="customSearchStudentWrapper lineWrapper"
    >
      {isLoading ? (
        <InlineLoading message="Loading student data..." />
      ) : !selectedTopic ? (
        <>
          <label htmlFor="topic" className="label">
            Topic:
          </label>
          <input
            type="text"
            placeholder="Type to search for a topic"
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            onFocus={() => setOptionsVisible(true)}
            onBlur={() => {
              setTimeout(() => {
                setOptionsVisible(false);
              }, 200);
            }}
          />
          {optionsVisible && (
            <div id="optionsWrapper" className="topicOptions">
              {searchTopicOptions.length > 0
                ? searchTopicOptions.map((topic) => (
                    <div
                      key={topic}
                      className="searchResultItem"
                      onClick={() => selectTopicFunction(topic)}
                    >
                      {topic}
                    </div>
                  ))
                : searchString !== '' && (
                    <div
                      className="searchResultItem"
                      onClick={() => handleAddNewTopic(searchString)}
                    >
                      Add New Topic
                    </div>
                  )}
            </div>
          )}
        </>
      ) : (
        <>
          <label htmlFor="topic" className="label">
            Topic:
          </label>
          <div className="content" onClick={removeSelectedTopicFunction}>
            {selectedTopic} - Remove Topic
          </div>
        </>
      )}
    </div>
  );
}
