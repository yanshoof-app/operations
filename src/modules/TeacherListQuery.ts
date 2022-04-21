import { IScheduleResponse } from '@yanshoof/iscool';
import { ITeacherListEvents, TeacherList } from '../utils/TeacherList';
import { MultiClassQuery } from './MultiClassQuery';

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
   * @param school the school whose teachers are queried
   * @param givenClassIds the classId matrix as given by the client
   */
  constructor(school: string, givenClassIds: number[][]) {
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
