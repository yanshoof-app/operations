import { ILessonArrMemberIscool, ISCOOL, IChangeIscool } from '@yanshoof/iscool';
import { DayOfWeek, HourOfDay, ITeacherLesson, IModification, HOURS_OF_DAY, DAYS_IN_WEEK } from '@yanshoof/types';
import { TypedEmitter } from 'tiny-typed-emitter';
import { initMatrix } from './arrays';

export interface ITeacherTimetableEvents {
  newLesson: (day: DayOfWeek, hour: HourOfDay, lesson: ITeacherLesson) => void;
  newChange: (day: DayOfWeek, hour: HourOfDay, modification: IModification) => void;
}

/**
 * A Teacher Timetable class capable of reading changes
 * @authors Itay Oshri, Itay Schechner
 * @version 1.0.0
 * @example
 * const teacherTimetable = new TeacherTimetable(teacher);
 * teacherTimetable.on('newLesson', () => {});
 */
export class TeacherTimetable extends TypedEmitter<ITeacherTimetableEvents> {
  readonly lessons: ITeacherLesson[][];
  private commonTeacher: string;

  constructor(commonTeacher: string) {
    super();
    // initialize array
    this.lessons = initMatrix<ITeacherLesson>(DAYS_IN_WEEK, HOURS_OF_DAY);
    this.commonTeacher = commonTeacher;
  }

  /**
   * Applies lessons
   * @param schedule the schedule to apply
   * @returns true if applied new lessons, false otherwise
   */
  public fromSchedule(schedule: ILessonArrMemberIscool[]) {
    let hadAddedNewLessons = false;
    for (const lesson of schedule) {
      const day = lesson.Day;
      const hourIndex = lesson.Hour; // 0 hours are possible as well.

      if (this.lessons[day][hourIndex].subject)
        // lesson already defined
        continue;

      // find lesson whose teacher is the specified teacher
      const lessonIndex = lesson.Lessons.findIndex((element) => element.Teacher === this.commonTeacher);

      if (lessonIndex == -1)
        // no lesson found for this class
        continue;

      hadAddedNewLessons = true;
      this.lessons[day][hourIndex] = ISCOOL.toTeacherLesson(lesson.Lessons[lessonIndex]);
      this.emit('newLesson', day, hourIndex, this.lessons[day][hourIndex]);
    } // end of for

    return hadAddedNewLessons;
  }

  /**
   * Apply changes to the array of lessons
   * @param changes the list of changes as retrieved from the Iscool API
   * @example
   * const timetable = new Timetable(settings).fromIscool(schedule);
   * timetable.applyChanges(changes);
   */
  public applyChanges(changes: IChangeIscool[]) {
    for (const changeObj of changes) {
      const modification = ISCOOL.toModification(changeObj);
      const day = ISCOOL.toDate(changeObj.Date).getDay() as DayOfWeek;
      const hour = changeObj.Hour;

      // compare study groups - is it a relevent change?
      if (!changeObj.StudyGroup)
        // yeah, blame the iScool API
        continue;

      const { Teacher: changeTeacher, Subject: changeSubject } = changeObj.StudyGroup;
      const lesson = this.lessons[day][hour];
      if (this.commonTeacher == changeTeacher && lesson.subject == changeSubject)
        this.lessons[day][hour] = { ...lesson, ...modification };
      this.emit('newChange', day, hour, modification);
    }
  }
}
