import MultiStageOperation from './MultiStageOperation';
import { ListenerSignature } from 'tiny-typed-emitter';
import {
  fetchDataSource,
  IChangeIscool,
  ILessonArrMemberIscool,
  IscoolClassLookup,
  IscoolFetchTask,
  IscoolRequestQueue,
  IClassesResponse,
  IScheduleResponse,
  IChangesResponse,
} from '@yanshoof/iscool';
import { ErrorCode } from '../types';

/**
 * Represents an operation with an iscool request queue
 * @abstract
 * @author Itay Schechner
 * @version 1.0.0
 */
export abstract class RequestQueueOperation<
  TSuccess,
  TEvents extends ListenerSignature<TEvents> = ListenerSignature<unknown>,
> extends MultiStageOperation<TSuccess, ErrorCode, TEvents> {
  private queue: IscoolRequestQueue;
  private pendingRequests: Set<IscoolFetchTask<IClassesResponse | IScheduleResponse | IChangesResponse>>;

  /**
   * Construct a new RequestQueueOperation
   */
  constructor() {
    super();
    this.queue = new IscoolRequestQueue();
    this.pendingRequests = new Set();
    this.queue.on('sleep', (time) => {
      this.emitDelay(time * this.queue.size);
    });
  }

  public async begin(): Promise<void> {
    await this.queue.execute();
  }

  /**
   * Fires when a class request is successfully finished
   * @param school the school of the request
   * @param lookup the class lookup provided
   */
  protected abstract onClassesRequestDone(school: string | number, lookup: IscoolClassLookup): void;

  /**
   * Fires when a schedule request is finished successfully
   * @param school the school of the request
   * @param classId the class id provided
   * @param schedule the schedule given from the server
   */
  protected abstract onScheduleRequestDone(
    school: string | number,
    classId: number,
    schedule: ILessonArrMemberIscool[],
  ): void;

  /**
   * Fires when a changes request is finished successfully
   * @param school the school of the request
   * @param classId the class id provided
   * @param changes the changes given from the server
   */
  protected abstract onChangesRequestDone(school: string | number, classId: number, changes: IChangeIscool[]): void;

  /**
   * Fires when a request has failed
   * @param request the request faiiled
   */
  protected abstract onUnexpectedRequestError(
    request: IscoolFetchTask<IClassesResponse | IScheduleResponse | IChangesResponse>,
    err: Error,
  ): void;

  /**
   * Get the result of the operation
   */
  protected abstract getResult(): TSuccess;

  /** Enqueue a request.
   * Accept as params the paramters of the fetchDataSource function
   * @throws error if enqueueing failed
   */
  protected enqueueRequest(...params: Parameters<typeof fetchDataSource>) {
    const task = new IscoolFetchTask(...params);

    task.on('success', (res) => {
      this.pendingRequests.delete(task);
      if (task.fetchFor === 'classes')
        this.onClassesRequestDone(task.school, new IscoolClassLookup((res as IClassesResponse).Classes));
      else if (task.fetchFor === 'schedule')
        this.onScheduleRequestDone(task.school, task.classId as number, (res as IScheduleResponse).Schedule);
      else if (task.fetchFor === 'changes')
        this.onChangesRequestDone(task.school, task.classId as number, (res as IChangesResponse).Changes);
      if (!this.pendingRequests.size) this.emitReady(this.getResult());
    });

    task.on('error', (err) => {
      this.onUnexpectedRequestError(task, err);
    });

    this.queue.enqueue(task);
    this.pendingRequests.add(task);
  }

  /**
   * Abort all requests
   */
  protected abortAll() {
    for (const req of this.pendingRequests) req.abort();
  }
}
