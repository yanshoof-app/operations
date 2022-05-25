import {
  IscoolClassLookup,
  IscoolFetchTask,
  IClassesResponse,
  IScheduleResponse,
  IChangesResponse,
  IscoolRequestQueue,
  HTTPError,
} from '@yanshoof/iscool';
import { ListenerSignature } from 'tiny-typed-emitter';
import { ErrorCode } from '../types';
import { RequestQueueOperation } from './RequestQueueOperation';

export interface NextClassEvent {
  nextClass: () => void;
}

/**
 * A layer of implementation that queries the schedule of multiple classes
 * @abstract
 * @author Itay Schechner
 * @version 1.0.0
 */
export abstract class MultiClassRequestOperation<
  TSuccess,
  TEvents extends ListenerSignature<TEvents>,
> extends RequestQueueOperation<TSuccess, TEvents & NextClassEvent> {
  private classIds: number[][];

  /**
   * Constructs a new MultiClassRequestOperation
   * @param queue to request queue to use
   * @param school the school to fetch
   * @param fallbackClassIds the fallback class ids, if existing
   */
  constructor(queue: IscoolRequestQueue, school: string, fallbackClassIds: number[][] = []) {
    super(queue);
    this.classIds = fallbackClassIds;
    this.enqueueRequest('classes', school, 0); // enqueue classes fetch
  }

  protected onClassesRequestDone(school: string | number, { classIds }: IscoolClassLookup): void {
    if (classIds > this.classIds)
      // more classes to fetch in recent request
      this.classIds = classIds;

    try {
      for (const grade of this.classIds) {
        for (const classId of grade) {
          if (classId === IscoolClassLookup.CLASS_NOT_FOUND) continue;
          this.enqueueRequest('schedule', school, classId);
        }
      }
    } catch (err) {
      // could not enqueue tasks
      return;
    }
  }

  protected onUnexpectedRequestError(
    request: IscoolFetchTask<IClassesResponse | IScheduleResponse | IChangesResponse>,
    err: Error,
  ): void {
    if (HTTPError.isHTTPError(err) && err.code === HTTPError.TOO_MANY_REQUESTS) return;
    if (request.fetchFor === 'classes' && !this.classIds.length) {
      // check if class lookup failed and no fallback provided
      this.emitError(ErrorCode.ERROR_FETCHING_CLASSES);
    } else this.emitError(ErrorCode.UNEXPECTED_ERROR_DURING_FETCH);
  }
}
