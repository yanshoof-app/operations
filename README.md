# operations

Long tasks provided with real-time progress via WebSocket

## The Teacher Timetable API

`wss://operations.yanshoof.app/api/timetable`

Provides a connection via WebSocket. In order for it to work, those params must be included:

- `?school=<school symbol>`
- `&teacherName=<teacher in school>`

Optionally, you can provide a `classes` param with `JSON.stringify` called pn your classId matrix, as the iscool class lookup route is not reliable.

The websocket connection will send the following objects:

- `{ event: 'nextClass' }` when finished looking in a class' schedule
- `{ event: 'error' }` before closing the connection, if encountered an error
- `{ event: 'delay' }` if encountered a delay in the request to the iscool API
- `{ event: 'done' }` when finished querying and before closing the connection
- `{ event: 'newLesson', day: DayOfWeek, hour: HourOfDay, lesson: ITeacherLesson }` if found a new lesson in schedule
- `{ event: 'newChange', day: DayOfWeek, hour: HourOfDay, modification: IModification }` if found a new change in schedule.

Example:

```ts
const ws = new WebSocket(...);

ws.on('message', (ev) => {
    const { event, ...payload } = JSON.parse(ev.data);
    switch(event) {
        case 'newLesson':
            lessons.push(payload.lesson);
    }
})
```

## The Teacher List API

`wss://operations.yanshoof.app/api/list`

Provides a connection via WebSocket. In order for it to work, those params must be included:

- `?school=<school symbol>`

Optionally, you can provide a `classes` param with `JSON.stringify` called pn your classId matrix, as the iscool class lookup route is not reliable.

The websocket connection will send the following objects:

- `{ event: 'nextClass' }` when finished looking in a class' schedule
- `{ event: 'error' }` before closing the connection, if encountered an error
- `{ event: 'delay' }` if encountered a delay in the request to the iscool API
- `{ event: 'done' }` when finished querying and before closing the connection
- `{ event: 'teacherAdded', teacherName: string }` if found a new teacher in school

Example:

```ts
const ws = new WebSocket(...);

ws.on('message', (ev) => {
    const { event, ...payload } = JSON.parse(ev.data);
    switch(event) {
        case 'teacherAdded':
            teachers.push(payload.teacherName);
    }
})
```
