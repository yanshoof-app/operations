import { ILessonArrMemberIscool } from '@yanshoof/iscool';
import { TypedEmitter } from 'tiny-typed-emitter';

/**
 * Represents events of the TeacherList object
 */
export interface ITeacherListEvents {
  teacherAdded: (teacherName: string) => void;
}

/**
 * A class that its objects contains a teacher list
 * @extends TypedEmitter<ITeacherList> to subscribe to teacher addition events
 * @authors Itay Oshri, Itay Schechner
 * @version 1.0.0
 */
export class TeacherList extends TypedEmitter<ITeacherListEvents> {
  private teacherSet: Set<string>;

  constructor() {
    super();
    this.teacherSet = new Set();
  }

  public fromIscool(schedule: ILessonArrMemberIscool[]) {
    for (let lesson of schedule) {
      lesson.Lessons.forEach(({ Teacher }) => {
        if (Teacher !== '') {
          if (!this.teacherSet.has(Teacher)) {
            this.emit('teacherAdded', Teacher);
            this.teacherSet.add(Teacher);
          }
        }
      });
    }
    return this;
  }

  get teachers(): string[] {
    return [...this.teacherSet];
  }
}
