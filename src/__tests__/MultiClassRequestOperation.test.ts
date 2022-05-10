import { IscoolClassLookup } from '@yanshoof/iscool';
import { MultiClassRequestOperationTestImpl } from '../modules/test_utils/MultiClassRequestOperationTestImpl';
import axios from 'axios';

axios.defaults.adapter = require('axios/lib/adapters/http');

const AMI_ASSAF = '460030';
const testOperation = new MultiClassRequestOperationTestImpl(AMI_ASSAF);

describe('Activates the operation', () => {
  jest.setTimeout(100_000);
  let numberOfClasses = 0;

  it('Requests classes from the server', async () => {
    const classLookup = await IscoolClassLookup.fromSchool(AMI_ASSAF);
    classLookup.forEachClass(() => numberOfClasses++);
  });

  it('Activates the queue', async () => {
    let isDone = false;
    testOperation.on('error', (err) => {
      console.log(err);
    });
    testOperation.on('delay', (time) => {
      console.log('Expected delay %dms', time);
    });
    testOperation.on('ready', (finishedRequests) => {
      expect(finishedRequests).toBe(numberOfClasses);
      isDone = true;
    });
    await testOperation.begin();
    expect(isDone).toBeTruthy();
  });
});
