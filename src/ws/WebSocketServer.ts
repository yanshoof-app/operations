import { IncomingMessage } from 'http';
import { Duplex } from 'stream';
import { WebSocketServer, WebSocket } from 'ws';

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
    this.wss.on('connection', (ws) => {
      try {
        const { searchParams } = new URL(ws.url);
        const params = this.getParamsFromURL(searchParams);
        this.onConnectionOpen(ws, params);
      } catch (err) {
        ws.close();
      }
    });
  }

  /**
   * Upgrade a connection to ws and connect to server
   * @param request the request to be uupgraded
   * @param socket the socket to be upgraded
   * @param head the upgrade head
   */
  async handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer) {
    this.wss.handleUpgrade(request, socket, head, (ws) => {
      this.wss.emit('connection', ws);
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
  protected abstract onConnectionOpen(ws: WebSocket, params: TParams): void;
}
