import { IncomingMessage } from 'http';
import { Duplex } from 'stream';
import { URL } from 'url';
import { WebSocketServer } from 'ws';
import { WebEmitter } from './WebEmitter';

/**
 * A Wrapper class for a websocket server
 * @author Itay Schechner
 * @version 1.0.0
 */
export abstract class YanshoofWebSocketServer<TParams> {
  private wss: WebSocketServer;

  /**
   * Create a new server
   */
  constructor() {
    this.wss = new WebSocketServer({ noServer: true });
    this.wss.on('connection', async (ws, { searchParams }: URL) => {
      try {
        const params = this.getParamsFromURL(searchParams);
        const webEmitter = new WebEmitter(ws);
        await this.onConnectionOpen(webEmitter, params);
      } catch (err) {
        console.log(err);
        ws.send(JSON.stringify({ err: 'UNSUPPORTED_DATA', statusCode: 1003 }));
        ws.close(1003); // unsupported data
      }
    });
  }

  /**
   * Upgrade a connection to ws and connect to server
   * @param request the request to be uupgraded
   * @param url the parsed URL that came with the request
   * @param socket the socket to be upgraded
   * @param head the upgrade head
   */
  async handleUpgrade(request: IncomingMessage, url: URL, socket: Duplex, head: Buffer) {
    this.wss.handleUpgrade(request, socket, head, (ws) => {
      this.wss.emit('connection', ws, url);
    });
  }

  /**
   * Convert URL Search Params to own parameter type
   * @param searchParams the URLSearchParams to convert
   * @returns the converted parameters to the desired types
   * @throws if parameters are insufficient
   */
  protected abstract getParamsFromURL(searchParams: URLSearchParams): TParams;

  /**
   * Handles the opening of a connection
   * @param ws the connection opened
   * @param params the parameters sent with it
   */
  protected abstract onConnectionOpen(ws: WebEmitter, params: TParams): Promise<void>;
}
