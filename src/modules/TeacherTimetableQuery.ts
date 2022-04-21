import { IScheduleResponse, IChangesResponse } from '@yanshoof/iscool';
import { ITeacherLesson } from '@yanshoof/types';
import { ITeacherTimetableEvents, TeacherTimetable } from '../utils/TeacherTimetable';
import { MultiClassQuery } from './MultiClassQuery';

/**
 * Handles building the teacher timetable and notifying about errors
 * @author Itay Schechner
 * @version 1.0.0
 * @example
 * const query = new TeacherTimetableQuery(school, teacherName);
 * query.on('ready', () => {
 *  console.log('ready');
 * })
 * query.begin();
 */
export class TeacherTimetableQuery extends MultiClassQuery<ITeacherLesson[][], ITeacherTimetableEvents> {
  private teacherTimetable: TeacherTimetable;
  private shouldFetchChanges: boolean;

  /**
   * Constructs a new TeacherTimetableQuery object
   * @param school the name of the school
   * @param teacherName the name of the teacher
   * @param givenClassIds the classIds as sent by the client
   */
  constructor(school: string, teacherName: string, givenClassIds: number[][]) {
    super(school, givenClassIds);
    this.teacherTimetable = new TeacherTimetable(teacherName);
    this.teacherTimetable.on('newChange', (...args) => this.emit('newChange', ...args));
    this.teacherTimetable.on('newLesson', (...args) => {
      this.shouldFetchChanges = true;
      this.emit('newLesson', ...args);
    });
    this.shouldFetchChanges = false;
  }

  protected async forEachClass(classId: number): Promise<void> {
    const { Schedule } = await this.fetchUntilResult<IScheduleResponse>('schedule', this.school, classId);
    this.teacherTimetable.fromSchedule(Schedule);
    if (this.shouldFetchChanges) {
      // class had lessons
      const { Changes } = await this.fetchUntilResult<IChangesResponse>('changes', this.school, classId);
      this.teacherTimetable.applyChanges(Changes);
      this.shouldFetchChanges = false;
    }
  }
  protected result(): ITeacherLesson[][] {
    return this.teacherTimetable.lessons;
  }
}
