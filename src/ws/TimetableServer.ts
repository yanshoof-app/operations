import { IscoolRequestQueue } from '@yanshoof/iscool';
import { ITeacherLesson } from '@yanshoof/types';
import MultiStageOperation from '../modules/MultiStageOperation';
import { ITimetableQueryParams, TeacherTimetableQuery } from '../modules/TeacherTimetableQuery';
import { ErrorCode } from '../types';
import { ITeacherTimetableEvents } from '../utils/TeacherTimetable';
import { RequestQueueServer } from './RequestQueueServer';
import { WebEmitter } from './WebEmitter';

/**
 * Represents the server that handles timetable requests
 */
export class TimetableServer extends RequestQueueServer<
  ITimetableQueryParams,
  ITeacherLesson[][],
  ITeacherTimetableEvents
> {
  protected getParamsFromURL(searchParams: URLSearchParams): ITimetableQueryParams {
    const school = searchParams.get('school');
    const teacherName = searchParams.get('teacherName');
    const classesStr = searchParams.get('classes');

    if (!school || !teacherName) throw new Error('Unsupported Data');
    return {
      school,
      teacherName,
      givenClassIds: JSON.parse(classesStr) || [],
    };
  }

  protected createOperation(
    queue: IscoolRequestQueue,
    ws: WebEmitter,
    params: ITimetableQueryParams,
  ): MultiStageOperation<ITeacherLesson[][], ErrorCode, ITeacherTimetableEvents> {
    const query = new TeacherTimetableQuery(queue, params);
    query.on('newLesson', (day, hour, lesson) => {
      ws.send('newLesson', { day, hour, lesson });
    });
    query.on('newChange', (day, hour, modification) => {
      ws.send('newChange', { day, hour, modification });
    });
    query.on('nextClass', () => {
      ws.send('nextClass');
    });
    return query;
  }
}
