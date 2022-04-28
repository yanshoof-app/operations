import { WebSocketServer } from 'ws';

export const wsTeacherTimetableServer = new WebSocketServer({ noServer: true });
export const wsTeacherListServer = new WebSocketServer({ noServer: true });
