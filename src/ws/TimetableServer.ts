import { ITimetableQueryParams, TeacherTimetableQuery } from '../modules/TeacherTimetableQuery';
import { WebEmitter } from './WebEmitter';
import { YanshoofWebSocketServer } from './WebSocketServer';

/**
 * Represents the server that handles timetable requests
 */
export class TimetableServer extends YanshoofWebSocketServer<ITimetableQueryParams> {
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
  protected async onConnectionOpen(ws: WebEmitter, params: ITimetableQueryParams): Promise<void> {
    const query = new TeacherTimetableQuery(params);
    query.on('nextClass', () => {
      ws.send('newClass');
    });
    query.on('newLesson', (day, hour, lesson) => {
      ws.send('newLesson', { day, hour, lesson });
    });
    query.on('newChange', (day, hour, modification) => {
      ws.send('newChange', { day, hour, modification });
    });
    query.on('error', () => {
      ws.send('error');
      ws.close(1011);
    });
    query.on('delay', () => {
      ws.send('delay');
    });
    query.on('ready', () => {
      ws.send('done');
      ws.close(1000);
    });
    await query.begin();
  }
}
