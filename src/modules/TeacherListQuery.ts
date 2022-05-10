import { ILessonArrMemberIscool, IscoolRequestQueue } from '@yanshoof/iscool';
import { ITeacherListEvents, TeacherList } from '../utils/TeacherList';
import { MultiClassRequestOperation } from './MultiClassReuqestOperation';

/**
 * Represents the query params required for the operation
 */
export interface ITeacherListQueryParams {
  /**
   * The school to query
   */
  school: string;
  /**
   * The fallback classId matrix
   */
  givenClassIds: number[][];
}

/**
 * Represents a teacher list query
 * @author Itay Schechner
 * @version 1.0.0
 */
export class TeacherListQuery extends MultiClassRequestOperation<string[], ITeacherListEvents> {
  private teacherList: TeacherList;

  constructor(queue: IscoolRequestQueue, { school, givenClassIds }: ITeacherListQueryParams) {
    super(queue, school, givenClassIds);
    this.teacherList = new TeacherList();
    this.teacherList.on('teacherAdded', (name) => {
      this.emit('teacherAdded', name);
    });
  }

  protected onScheduleRequestDone(
    _school: string | number,
    _classId: number,
    schedule: ILessonArrMemberIscool[],
  ): void {
    this.teacherList.fromIscool(schedule);
  }

  protected getResult(): string[] {
    return this.teacherList.teachers;
  }
}
