import { ITeacherListQueryParams, TeacherListQuery } from '../modules/TeacherListQuery';
import { WebEmitter } from './WebEmitter';
import { YanshoofWebSocketServer } from './WebSocketServer';

/**
 * Represents the server that handles list requests
 */
export class ListServer extends YanshoofWebSocketServer<ITeacherListQueryParams> {
  protected getParamsFromURL(searchParams: URLSearchParams): ITeacherListQueryParams {
    const school = searchParams.get('school');
    const classesStr = searchParams.get('classes');

    if (!school) throw new Error('Unsupported Data');
    return {
      school,
      givenClassIds: JSON.parse(classesStr) || [],
    };
  }
  protected async onConnectionOpen(ws: WebEmitter, params: ITeacherListQueryParams): Promise<void> {
    const query = new TeacherListQuery(params);
    query.on('teacherAdded', (teacherName) => {
      ws.send('teacherAdded', { teacherName });
    });
    query.on('nextClass', WebEmitter.handleNextClass(ws));
    query.on('error', WebEmitter.handleError(ws));
    query.on('delay', WebEmitter.handleDelay(ws));
    query.on('ready', WebEmitter.handleReady(ws));
    await query.begin();
  }
}
