// import mockDataHardCoded from './mockDataHardCoded.json' assert { type: 'json' };

// export default mockDataHardCoded;

import generateStudentRecordsMockData from './scripts/index';

const studentRecordsMockData = generateStudentRecordsMockData();

export default studentRecordsMockData;
