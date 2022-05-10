import {
  IscoolClassLookup,
  ILessonArrMemberIscool,
  IChangeIscool,
  IscoolFetchTask,
  IClassesResponse,
  IScheduleResponse,
  IChangesResponse,
  ISCOOL,
} from '@yanshoof/iscool';
import { TeacherList } from '../../utils/TeacherList';
import { RequestQueueOperation } from '../RequestQueueOperation';

export class RequestQueueOperationTestImpl extends RequestQueueOperation<number, object> {
  private finishedRequests: number;
  constructor(school: string) {
    super();
    this.finishedRequests = 0;
    this.enqueueRequest('classes', school, 0);
  }

  protected onClassesRequestDone(school: string | number, lookup: IscoolClassLookup): void {
    this.finishedRequests++;
    console.log('Finished querying classes of school', school);
    console.log('Lookup: ', lookup.grades, lookup.classIds);
    this.enqueueRequest('schedule', school, lookup.classIds[0][0]);
  }
  protected onScheduleRequestDone(school: string | number, classId: number, schedule: ILessonArrMemberIscool[]): void {
    this.finishedRequests++;
    console.log('Finished querying schedule for', classId);
    const list = new TeacherList();
    list.fromIscool(schedule);
    console.log('Teachers in schedule: ', list.teachers);
    this.enqueueRequest('changes', school, classId);
  }
  protected onChangesRequestDone(_school: string | number, classId: number, changes: IChangeIscool[]): void {
    this.finishedRequests++;
    console.log('Finished querying changes for', classId);
    const mappedChanges = changes.map((c) => ISCOOL.toChange(c));
    console.log('Changes:', mappedChanges);
  }
  protected onUnexpectedRequestError(
    _request: IscoolFetchTask<IClassesResponse | IScheduleResponse | IChangesResponse>,
    err: Error,
  ): void {
    throw err;
  }
  protected getResult(): number {
    return this.finishedRequests;
  }
}
