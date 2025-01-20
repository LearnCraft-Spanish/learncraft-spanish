import hardCodedMockData from './mockDataHardCoded.json' assert { type: 'json' };

import generateStudentRecordsMockData from './scripts/index';

const generatedMockData = generateStudentRecordsMockData();

export { generatedMockData, hardCodedMockData };
