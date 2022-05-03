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
    query.on('newLesson', (day, hour, lesson) => {
      ws.send('newLesson', { day, hour, lesson });
    });
    query.on('newChange', (day, hour, modification) => {
      ws.send('newChange', { day, hour, modification });
    });
    query.on('nextClass', WebEmitter.handleNextClass(ws));
    query.on('error', WebEmitter.handleError(ws));
    query.on('delay', WebEmitter.handleDelay(ws));
    query.on('ready', WebEmitter.handleReady(ws));
    await query.begin();
  }
}
