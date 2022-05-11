import { IscoolRequestQueue } from '@yanshoof/iscool';
import axios from 'axios';
import { TeacherTimetableQuery } from '../modules/TeacherTimetableQuery';

axios.defaults.adapter = require('axios/lib/adapters/http');

const queue = new IscoolRequestQueue();

describe('Tests multi stage operations', () => {
  jest.setTimeout(40000);

  const school = '441188',
    teacherName = 'ליבוביץ אילן';

  it('Fetches teacher timetable', async () => {
    const query = new TeacherTimetableQuery(queue, { school, teacherName, givenClassIds: [] });
    query.on('delay', (time) => {
      console.log('Expected delay', time);
    });
    query.on('error', (code) => {
      console.log('Ran into error with error code', code);
    });
    query.on('newChange', (day, hour, mod) => {
      console.log('modification found!', day, hour, mod);
    });
    query.on('newLesson', (day, hour, lesson) => {
      console.log('lesson found!', day, hour, lesson);
    });
    query.on('nextClass', () => {
      console.log('Next class');
    });
    query.on('ready', (timetable) => {
      console.log('Done!', timetable);
    });
    await query.begin();
  });
});
