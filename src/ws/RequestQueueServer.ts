import { IscoolRequestQueue } from '@yanshoof/iscool';
import { ListenerSignature } from 'tiny-typed-emitter';
import MultiStageOperation, { MultiStageOperationEvents } from '../modules/MultiStageOperation';
import { ErrorCode } from '../types';
import { WebEmitter } from './WebEmitter';
import { YanshoofWebSocketServer } from './WebSocketServer';

/**
 * Represents a WebSocket server that uses an IsccolRequestQueue
 * @author Itay Schechner
 * @version 1.0.0
 */
export abstract class RequestQueueServer<
  TParams,
  TSuccess,
  TEvents extends ListenerSignature<TEvents> & { [K in keyof MultiStageOperationEvents<never, never>]?: never },
> extends YanshoofWebSocketServer<TParams> {
  private queue: IscoolRequestQueue;

  /**
   * Construct a new server.
   * @param queue the queue to use
   */
  constructor(queue: IscoolRequestQueue) {
    super();
    this.queue = queue;
  }

  protected abstract createOperation(
    queue: IscoolRequestQueue,
    ws: WebEmitter,
    params: TParams,
  ): MultiStageOperation<TSuccess, ErrorCode, TEvents>;

  protected async onConnectionOpen(ws: WebEmitter, params: TParams): Promise<void> {
    const operation = this.createOperation(this.queue, ws, params);
    operation.subscribe('delay', (time) => {
      ws.send('delay', { time });
    });
    operation.subscribe('error', () => {
      ws.send('error');
      ws.close(1011);
    });
    operation.subscribe('ready', () => {
      ws.send('success');
    });
    ws.onClose(() => {
      operation.abort();
    });
    await operation.begin();
  }
}
