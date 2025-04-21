import hardCodedMockData from './mockDataHardCoded.json';

import generateStudentRecordsMockData from './scripts/index';

const generatedMockData = generateStudentRecordsMockData();

export { generatedMockData, hardCodedMockData };
