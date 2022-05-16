import { WebSocket } from 'ws';

/**
 * Represents a class with emittable params
 */
export class WebEmitter {
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.ws = ws;
  }

  public send<T extends object>(eventName: string, args: T = {} as T) {
    return new Promise<void>((res, rej) => {
      if (this.ws.readyState !== this.ws.OPEN) res();
      this.ws.send(JSON.stringify({ event: eventName, ...args }), (err) => {
        if (err) rej(err);
        else res();
      });
    });
  }

  public close(statusCode?: number) {
    this.ws.close(statusCode);
  }

  public onClose(cb: () => void) {
    this.ws.on('close', () => {
      cb();
    });
  }
}
