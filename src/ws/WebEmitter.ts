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

  // public handlers for general events

  public static handleNextClass(ws: WebEmitter) {
    return () => {
      ws.send('nextClass');
    };
  }

  public static handleDelay(ws: WebEmitter) {
    return () => {
      ws.send('delay');
    };
  }

  public static handleError(ws: WebEmitter) {
    return () => {
      ws.send('error');
      ws.close(1011);
    };
  }

  public static handleReady(ws: WebEmitter) {
    return () => {
      ws.send('ready');
      ws.close(1000);
    };
  }
}
