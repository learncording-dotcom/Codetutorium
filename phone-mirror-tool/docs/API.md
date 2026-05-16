# Phone Mirror Tool - API Documentation

## REST API

### Base URL

```
http://localhost:3000
```

### Endpoints

#### 1. Create Mirror Session

**POST** `/api/sessions/create`

Creates a new mirroring session.

**Request:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "sessionToken": "550e8400-e29b-41d4-a716-446655440001",
  "mirrorLink": "http://localhost:3000/mirror/550e8400-e29b-41d4-a716-446655440000",
  "expiresAt": "2026-05-17T00:00:00.000Z"
}
```

#### 2. Get Session Details

**GET** `/api/sessions/:sessionId`

Retrieve session information.

**Response:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "active",
  "deviceConnected": true,
  "mirroring": true,
  "viewers": 2,
  "createdAt": "2026-05-16T10:00:00.000Z",
  "expiresAt": "2026-05-17T10:00:00.000Z"
}
```

#### 3. List All Sessions

**GET** `/api/sessions`

Retrieve all active sessions.

**Response:**
```json
{
  "sessions": [
    {
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "active",
      "deviceConnected": true,
      "mirroring": true,
      "viewers": 2,
      "createdAt": "2026-05-16T10:00:00.000Z"
    }
  ]
}
```

## WebSocket API

### Connection

```javascript
const socket = io('http://localhost:3000');
```

### Events

#### Device Connection

**Emit: `device:connect`**

```javascript
socket.emit('device:connect', {
  sessionId: 'session-id',
  sessionToken: 'session-token',
  deviceInfo: {
    deviceName: 'My Device',
    platform: 'Android',
    resolution: '1080x2340'
  }
});
```

**Listen: `device:connected`**

```javascript
socket.on('device:connected', (deviceInfo) => {
  console.log('Device connected:', deviceInfo);
});
```

#### Viewer Join

**Emit: `viewer:join`**

```javascript
socket.emit('viewer:join', {
  sessionId: 'session-id'
});
```

**Listen: `session:info`**

```javascript
socket.on('session:info', (data) => {
  console.log('Session info:', data);
});
```

#### Start Mirroring

**Emit: `mirror:start`**

```javascript
socket.emit('mirror:start', {
  sessionId: 'session-id'
});
```

**Listen: `mirror:started`**

```javascript
socket.on('mirror:started', () => {
  console.log('Mirroring started');
});
```

#### Screen Frame Update

**Emit: `screen:frame`**

```javascript
socket.emit('screen:frame', {
  sessionId: 'session-id',
  frameData: 'base64-encoded-image',
  timestamp: '2026-05-16T10:00:00.000Z'
});
```

**Listen: `screen:update`**

```javascript
socket.on('screen:update', (data) => {
  const { frameData, timestamp } = data;
  // Display frame
});
```

#### Input Commands

**Emit: `input:command`**

```javascript
// Tap
socket.emit('input:command', {
  sessionId: 'session-id',
  command: {
    type: 'tap',
    x: 540,
    y: 1170
  }
});

// Swipe
socket.emit('input:command', {
  sessionId: 'session-id',
  command: {
    type: 'swipe',
    startX: 540,
    startY: 1000,
    endX: 540,
    endY: 1500
  }
});

// Key Press
socket.emit('input:command', {
  sessionId: 'session-id',
  command: {
    type: 'key',
    keyCode: 4  // Back button
  }
});
```

**Listen: `input:execute`**

```javascript
socket.on('input:execute', (command) => {
  console.log('Execute command:', command);
});
```

#### Stop Mirroring

**Emit: `mirror:stop`**

```javascript
socket.emit('mirror:stop', {
  sessionId: 'session-id'
});
```

**Listen: `mirror:stopped`**

```javascript
socket.on('mirror:stopped', () => {
  console.log('Mirroring stopped');
});
```

## Error Handling

All errors are emitted as `error` events:

```javascript
socket.on('error', (data) => {
  console.error('Error:', data.message);
});
```

## Status Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 404  | Session not found |
| 500  | Server error |

## Rate Limiting

None currently implemented. Should be added for production.

## Authentication

Currently uses session tokens. Should be upgraded to JWT for production.
