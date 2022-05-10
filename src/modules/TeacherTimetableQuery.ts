import { IscoolRequestQueue, ILessonArrMemberIscool, IChangeIscool } from '@yanshoof/iscool';
import { ITeacherLesson } from '@yanshoof/types';
import { ITeacherTimetableEvents, TeacherTimetable } from '../utils/TeacherTimetable';
import { MultiClassRequestOperation } from './MultiClassReuqestOperation';

export interface ITimetableQueryParams {
  /**
   * The school to query
   */
  school: string;
  /**
   * The teacher name to search for
   */
  teacherName: string;
  /**
   * The class id matrix for fallback
   */
  givenClassIds: number[][];
}

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
export class TeacherTimetableQuery extends MultiClassRequestOperation<ITeacherLesson[][], ITeacherTimetableEvents> {
  private teacherTimetable: TeacherTimetable;

  /**
   * Constructs a new TeacherTimetableQuery object
   * @param queue the request queue to use
   * @param params the parameters required
   */
  constructor(queue: IscoolRequestQueue, { school, teacherName, givenClassIds }: ITimetableQueryParams) {
    super(queue, school, givenClassIds);
    this.teacherTimetable = new TeacherTimetable(teacherName);
    this.teacherTimetable.on('newChange', (...args) => this.emit('newChange', ...args));
    this.teacherTimetable.on('newLesson', (...args) => {
      this.emit('newLesson', ...args);
    });
  }

  protected onScheduleRequestDone(school: string | number, classId: number, schedule: ILessonArrMemberIscool[]): void {
    const hasAddedNewLessons = this.teacherTimetable.fromSchedule(schedule);
    if (hasAddedNewLessons) this.enqueueRequest('changes', school, classId);
  }

  protected onChangesRequestDone(_school: string | number, _classId: number, changes: IChangeIscool[]): void {
    this.teacherTimetable.applyChanges(changes);
  }

  protected getResult(): ITeacherLesson[][] {
    return this.teacherTimetable.lessons;
  }
}
