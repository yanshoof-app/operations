import { RequestQueueOperationTestImpl } from '../modules/test_utils/RequestQueueOperationTestImpl';

const AMI_ASSAF = '460030';

const testOperation = new RequestQueueOperationTestImpl(AMI_ASSAF);

describe('Activates the queue', () => {
  it('Activates the queue', async () => {
    let isDone = false;
    testOperation.on('ready', (finishedRequests) => {
      expect(finishedRequests).toBe(3);
      isDone = true;
    });
    await testOperation.begin();
    expect(isDone).toBeTruthy();
  });
});
