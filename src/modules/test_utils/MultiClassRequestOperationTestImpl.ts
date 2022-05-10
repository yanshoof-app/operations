import { ILessonArrMemberIscool } from '@yanshoof/iscool';
import { TeacherList } from '../../utils/TeacherList';
import { MultiClassRequestOperation } from '../MultiClassReuqestOperation';

/**
 * A test implementation of the multi class request operation test impl
 */
export class MultiClassRequestOperationTestImpl extends MultiClassRequestOperation<number, object> {
  private successfulRequests: number;

  /**
   * Construct a new MultiClassRequestOperationTestImpl object
   * @param school the school to fetch
   */
  constructor(school: string) {
    super(school);
    this.successfulRequests = 0;
  }

  protected onScheduleRequestDone(_school: string | number, classId: number, schedule: ILessonArrMemberIscool[]): void {
    this.successfulRequests++;
    console.log('Schedule arrived for class ', classId);
    const list = new TeacherList();
    list.fromIscool(schedule);
    console.log('Teachers in schedule: ', list.teachers);
  }

  protected getResult(): number {
    return this.successfulRequests;
  }
}
