import { createServer } from 'http';
import { TimetableServer } from './ws/TimetableServer';
import './setup';

const API_PREFIX = '/api';
const TIMETABLE_URL = '/timetable';

const timetableServer = new TimetableServer();
const server = createServer();

server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname == API_PREFIX + TIMETABLE_URL) timetableServer.handleUpgrade(req, url, socket, head);
  // connection to url not supported
  else socket.destroy();
});

server.on('listening', () => {
  console.log('READY');
});

server.listen(8080);
