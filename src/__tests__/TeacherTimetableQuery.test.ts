import { IscoolClassLookup } from '@yanshoof/iscool';
import axios from 'axios';
import { TeacherTimetableQuery } from '../modules/TeacherTimetableQuery';

axios.defaults.adapter = require('axios/lib/adapters/http');

describe('Tests multi stage operations', () => {
  jest.setTimeout(40000);

  let classIds: number[][] = []; // mock given from client
  const school = '460030',
    teacherName = 'ורגוליס ארתור';

  it('Fetches classes', async () => {
    const classLookup = await IscoolClassLookup.fromSchool(school);
    classIds = classLookup.classIds;
  });

  it('Fetches teacher timetable', async () => {
    const query = new TeacherTimetableQuery(school, teacherName, classIds);
    query.on('delay', () => {
      console.log('The query will take a little longer...');
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
