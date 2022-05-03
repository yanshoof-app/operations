import { createServer } from 'http';
import { TimetableServer } from './ws/TimetableServer';
import { ListServer } from './ws/ListServer';
import './setup';

const API_PREFIX = '/api';
const TIMETABLE_URL = '/timetable';
const LIST_URL = '/list';

const timetableServer = new TimetableServer();
const listServer = new ListServer();
const server = createServer();

server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname == API_PREFIX + TIMETABLE_URL) timetableServer.handleUpgrade(req, url, socket, head);
  else if (url.pathname == API_PREFIX + LIST_URL) listServer.handleUpgrade(req, url, socket, head);
  // connection to url not supported
  else socket.destroy();
});

server.on('listening', () => {
  console.log('READY');
});

server.listen(8080);
