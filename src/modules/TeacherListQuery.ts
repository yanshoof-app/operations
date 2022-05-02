import { IScheduleResponse } from '@yanshoof/iscool';
import { ITeacherListEvents, TeacherList } from '../utils/TeacherList';
import { MultiClassQuery } from './MultiClassQuery';

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
 * @extends MultiClassQuery
 */
export class TeacherListQuery extends MultiClassQuery<string[], ITeacherListEvents> {
  private teacherList: TeacherList;

  /**
   * Constructs a new TeacherListQuery object
   * @param params the params required for the query
   */
  constructor({ school, givenClassIds }: ITeacherListQueryParams) {
    super(school, givenClassIds);
    this.teacherList = new TeacherList();
    this.teacherList.on('teacherAdded', (name) => {
      this.emit('teacherAdded', name);
    });
  }

  protected async forEachClass(classId: number): Promise<void> {
    const { Schedule } = await this.fetchUntilResult<IScheduleResponse>('schedule', this.school, classId);
    this.teacherList.fromIscool(Schedule);
  }
  protected result(): string[] {
    return this.teacherList.teachers;
  }
}
