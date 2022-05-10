import { ListenerSignature, TypedEmitter } from 'tiny-typed-emitter';

/**
 * Represents events that should be emitted by any multiple stage operation
 */
export interface MultiStageOperationEvents<Success, Error> {
  ready: (result: Success) => void;
  error: (err: Error) => void;
  delay: (time: number) => void;
}

type TypeSafeMSOE<Success, Error, T> = Omit<T, keyof MultiStageOperationEvents<Success, Error>> &
  MultiStageOperationEvents<Success, Error>;

/**
 * Represents an operation that takes a long time to process
 * @abstract
 * @extends TypedEmitter for the ability to emit and subscribe to events
 * @author Itay Schechner
 * @version 1.0.0
 */
abstract class MultiStageOperation<
  Success,
  Error,
  T extends ListenerSignature<T> = ListenerSignature<unknown>,
> extends TypedEmitter<TypeSafeMSOE<Success, Error, T>> {
  protected emitError(err: Error) {
    const params = [err] as Parameters<TypeSafeMSOE<Success, Error, T>['error']>; // this must be [Error] type
    this.emit('error', ...params);
  }

  protected emitDelay(time: number) {
    const params = [time] as Parameters<TypeSafeMSOE<Success, Error, T>['delay']>; // this must be [] type
    this.emit('delay', ...params);
  }

  protected emitReady() {
    const params = [this.getResult()] as Parameters<TypeSafeMSOE<Success, Error, T>['ready']>; // this must be [Success] type
    this.emit('ready', ...params);
  }

  public abstract begin(): Promise<void>;

  /**
   * Return the result of the operation
   */
  protected abstract getResult(): Success;

  /**
   * Abort the operation
   */
  public abstract abort(): void;
}

export default MultiStageOperation;
