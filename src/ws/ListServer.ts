import { IscoolRequestQueue } from '@yanshoof/iscool';
import MultiStageOperation from '../modules/MultiStageOperation';
import { ITeacherListQueryParams, TeacherListQuery } from '../modules/TeacherListQuery';
import { ErrorCode } from '../types';
import { ITeacherListEvents } from '../utils/TeacherList';
import { RequestQueueServer } from './RequestQueueServer';
import { WebEmitter } from './WebEmitter';

/**
 * Represents the server that handles list requests
 */
export class ListServer extends RequestQueueServer<ITeacherListQueryParams, string[], ITeacherListEvents> {
  protected getParamsFromURL(searchParams: URLSearchParams): ITeacherListQueryParams {
    const school = searchParams.get('school');
    const classesStr = searchParams.get('classes');

    if (!school) throw new Error('Unsupported Data');
    return {
      school,
      givenClassIds: JSON.parse(classesStr) || [],
    };
  }

  protected createOperation(
    queue: IscoolRequestQueue,
    ws: WebEmitter,
    params: ITeacherListQueryParams,
  ): MultiStageOperation<string[], ErrorCode, ITeacherListEvents> {
    const query = new TeacherListQuery(queue, params);
    query.on('teacherAdded', (teacherName) => {
      ws.send('teacherAdded', { teacherName });
    });
    query.on('nextClass', () => {
      ws.send('nextClass');
    });
    return query;
  }
}
