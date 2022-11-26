import { createServer } from 'http';
import { TimetableServer } from './ws/TimetableServer';
import { ListServer } from './ws/ListServer';
import './setup';
import { IscoolRequestQueue } from '@yanshoof/iscool';

const API_PREFIX = '/api';
const TIMETABLE_URL = '/timetable';
const LIST_URL = '/list';

const requestQueue = new IscoolRequestQueue();
const timetableServer = new TimetableServer(requestQueue);
const listServer = new ListServer(requestQueue);
const server = createServer();

requestQueue.on('sleep', (time) => {
  console.log('Delay until next iscool fetch: %dms', time);
});

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

server.listen(process.env.PORT || 8080);
