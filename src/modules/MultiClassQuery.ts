/* eslint-disable @typescript-eslint/ban-types */
import { fetchDataSource, HTTPError, IscoolClassLookup } from '@yanshoof/iscool';
import { ListenerSignature } from 'tiny-typed-emitter';
import { ErrorCode } from '../types';
import MultiStageOperation from './MultiStageOperation';

export interface IMultiClassQueryEvents {
  nextClass: () => void;
}

type TypeSafeMCQE<T> = Omit<T, keyof IMultiClassQueryEvents> & IMultiClassQueryEvents;

export abstract class MultiClassQuery<Success, T extends ListenerSignature<T>> extends MultiStageOperation<
  Success,
  ErrorCode,
  TypeSafeMCQE<T>
> {
  protected school: string;
  private classIds: number[][];
  private sleepInterval = 100; // 100 ms

  private static MAX_SLEEP_INTERVAL = 7000; // 5 seconds

  /**
   * Constrcuts a new MultiClassQuery object
   * @param school the school where the classes are located
   * @param givenClassIds the classIds as sent by the client
   */
  constructor(school: string, givenClassIds: number[][]) {
    super();
    this.school = school;
    this.classIds = givenClassIds;
  }

  protected emitNextClass() {
    const params = [] as Parameters<TypeSafeMCQE<T>['nextClass']>; // this must be [] type
    this.emit('nextClass', ...params);
  }

  // running utilities

  protected abstract forEachClass(classId: number): Promise<void>;
  protected abstract result(): Success;

  public async begin(): Promise<void> {
    try {
      const queriedLookup = await IscoolClassLookup.fromSchool(this.school);
      if (queriedLookup.gradeSize > this.classIds.length) this.classIds = queriedLookup.classIds;
    } catch (err) {
      console.log(err);
      this.emitError(ErrorCode.ERROR_FETCHING_CLASSES);
    } finally {
      // continue with given classes
      for (const grade of this.classIds) {
        for (const classId of grade) {
          if (classId == IscoolClassLookup.CLASS_NOT_FOUND) continue;
          await this.forEachClass(classId);
          this.emitNextClass();
        }
      }
      this.emitReady(this.result());
    }
  }

  // Fetching utilities

  private async sleep() {
    return new Promise((resolve) => {
      setTimeout(resolve, this.sleepInterval);
    });
  }

  protected async fetchUntilResult<T extends {}>(...args: Parameters<typeof fetchDataSource>): Promise<T> {
    let hasSleptFlag = false;
    while (this.sleepInterval <= MultiClassQuery.MAX_SLEEP_INTERVAL) {
      try {
        const result = await fetchDataSource<T>(...args);
        return result;
      } catch (err) {
        if (HTTPError.isHTTPError(err) && err.code == 429) {
          // too many requests
          this.emitDelay();
          await this.sleep();
          if (!hasSleptFlag) hasSleptFlag = true;
          else {
            this.sleepInterval *= 2;
            hasSleptFlag = false;
          }
        } // another error
        else this.emitError(ErrorCode.UNEXPECTED_ERROR_DURING_CLASS_FETCH);
      }
    }
    throw new Error('Timeout exceeded');
  }
}
