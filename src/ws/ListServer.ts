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
    query.on('nextClass', () => {
      ws.send('newClass');
    });
    query.on('teacherAdded', (teacherName) => {
      ws.send('teacherAdded', { teacherName });
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
