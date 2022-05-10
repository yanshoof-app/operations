import { IscoolRequestQueue } from '@yanshoof/iscool';
import { TeacherListQuery } from '../modules/TeacherListQuery';
import axios from 'axios';

axios.defaults.adapter = require('axios/lib/adapters/http');

const queue = new IscoolRequestQueue();

describe('tests the teacher lookup method', () => {
  jest.setTimeout(40000);

  const school = '460030';

  it('Builds teacher list of school', async () => {
    const query = new TeacherListQuery(queue, { school, givenClassIds: [] });
    query.on('delay', (time) => {
      console.log('Expected delay', time);
    });
    query.on('error', (code) => {
      console.log('Ran into error with error code', code);
    });
    query.on('teacherAdded', (teacher) => {
      console.log('Teacher found', teacher);
    });
    /* TODO
    query.on('nextClass', () => {
      console.log('Next class');
    });
    */
    query.on('ready', (teachers) => {
      console.log('Done!', teachers);
    });
    await query.begin();
  });
});
