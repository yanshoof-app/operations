import { IscoolClassLookup } from '@yanshoof/iscool';
import { TeacherListQuery } from '../modules/TeacherListQuery';
import axios from 'axios';

axios.defaults.adapter = require('axios/lib/adapters/http');

describe('tests the teacher lookup method', () => {
  jest.setTimeout(40000);

  let classIds: number[][] = []; // mock given from client
  const school = '460030';

  it('Fetches classes', async () => {
    const classLookup = await IscoolClassLookup.fromSchool(school);
    classIds = classLookup.classIds;
  });

  it('Builds teacher list of school', async () => {
    const query = new TeacherListQuery(school, classIds);
    query.on('delay', () => {
      console.log('The query will take a little longer...');
    });
    query.on('error', (code) => {
      console.log('Ran into error with error code', code);
    });
    query.on('teacherAdded', (teacher) => {
      console.log('Teacher found', teacher);
    });
    query.on('nextClass', () => {
      console.log('Next class');
    });
    query.on('ready', (teachers) => {
      console.log('Done!', teachers);
    });
    await query.begin();
  });
});
