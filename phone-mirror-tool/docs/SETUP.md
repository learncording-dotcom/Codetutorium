# Phone Mirror Tool - Setup Guide

## Prerequisites

- Node.js 16+
- Python 3.8+
- npm or yarn
- Git

## Server Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:3001
MIRROR_URL=http://localhost:3000
```

### 3. Start the Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

Server will be available at `http://localhost:3000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm start
```

Dashboard will be available at `http://localhost:3000`

## Client Setup

### Python Client

#### Install Dependencies

```bash
cd client
pip install -r requirements.txt
```

#### Run Client

```bash
python mirror_client.py \
  --server http://localhost:3000 \
  --session-id <SESSION_ID> \
  --session-token <SESSION_TOKEN> \
  --device-name "My Device"
```

### Android Client

1. Open Android Studio
2. Import the `client/android` directory
3. Build and run on emulator or device

## API Endpoints

### Create Session

```bash
POST /api/sessions/create
Response:
{
  "success": true,
  "sessionId": "uuid",
  "sessionToken": "uuid",
  "mirrorLink": "http://localhost:3000/mirror/uuid",
  "expiresAt": "2026-05-17T00:00:00Z"
}
```

### Get Session Status

```bash
GET /api/sessions/:sessionId
Response:
{
  "sessionId": "uuid",
  "status": "active",
  "deviceConnected": true,
  "mirroring": false,
  "viewers": 2,
  "createdAt": "2026-05-16T00:00:00Z",
  "expiresAt": "2026-05-17T00:00:00Z"
}
```

### List All Sessions

```bash
GET /api/sessions
Response:
{
  "sessions": [
    {
      "sessionId": "uuid",
      "status": "active",
      "deviceConnected": true,
      "mirroring": false,
      "viewers": 1,
      "createdAt": "2026-05-16T00:00:00Z"
    }
  ]
}
```

## WebSocket Events

### Device Events

- `device:connect` - Device connects to session
- `device:connected` - Server confirms device connection
- `device:disconnected` - Device disconnects

### Mirror Events

- `mirror:start` - Start mirroring
- `mirror:started` - Mirroring started
- `mirror:stop` - Stop mirroring
- `mirror:stopped` - Mirroring stopped

### Screen Events

- `screen:frame` - Device sends screen frame
- `screen:update` - Server broadcasts screen update

### Input Events

- `input:command` - Viewer sends input command
- `input:execute` - Device receives input to execute

### Viewer Events

- `viewer:join` - Viewer joins session
- `viewer:joined` - Server broadcasts viewer joined

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
```

### Connection Issues

1. Ensure server is running
2. Check firewall settings
3. Verify CORS configuration
4. Check browser console for errors

### Device Not Connecting

1. Verify session ID and token
2. Check device has network connectivity
3. Review server logs for connection errors

## Next Steps

- Configure database (MongoDB)
- Implement user authentication
- Add session persistence
- Deploy to production server
- Implement encryption for frames
