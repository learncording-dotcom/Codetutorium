import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import '../styles/MirrorViewer.css';

function MirrorViewer() {
  const { sessionId } = useParams();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [mirroring, setMirroring] = useState(false);
  const [screenFrame, setScreenFrame] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('viewer:join', { sessionId });
    });

    newSocket.on('device:connected', (deviceInfo) => {
      console.log('Device connected:', deviceInfo);
      setDeviceConnected(true);
    });

    newSocket.on('device:disconnected', () => {
      setDeviceConnected(false);
      setMirroring(false);
    });

    newSocket.on('mirror:started', () => {
      setMirroring(true);
    });

    newSocket.on('mirror:stopped', () => {
      setMirroring(false);
    });

    newSocket.on('screen:update', (data) => {
      setScreenFrame(data.frameData);
    });

    newSocket.on('viewer:joined', (data) => {
      setViewerCount(data.viewerCount);
    });

    return () => newSocket.disconnect();
  }, [sessionId]);

  const startMirror = () => {
    if (socket) socket.emit('mirror:start', { sessionId });
  };

  const stopMirror = () => {
    if (socket) socket.emit('mirror:stop', { sessionId });
  };

  const handleTap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (socket) {
      socket.emit('input:command', {
        sessionId,
        command: { type: 'tap', x, y }
      });
    }
  };

  return (
    <div className="mirror-viewer">
      <div className="viewer-header">
        <h2>Mirror Session: {sessionId}</h2>
        <div className="status-indicators">
          <span className={`status ${connected ? 'connected' : 'disconnected'}`}>
            Server: {connected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          <span className={`status ${deviceConnected ? 'connected' : 'disconnected'}`}>
            Device: {deviceConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          <span className="viewer-count">👥 Viewers: {viewerCount}</span>
        </div>
      </div>

      <div className="viewer-container">
        <div className="screen-display">
          {screenFrame ? (
            <img 
              src={`data:image/jpeg;base64,${screenFrame}`}
              alt="Device Screen"
              onClick={handleTap}
              className="screen-image"
            />
          ) : (
            <div className="screen-placeholder">
              {deviceConnected ? (
                <p>Waiting for screen capture...</p>
              ) : (
                <p>Waiting for device connection...</p>
              )}
            </div>
          )}
        </div>

        <div className="controls">
          <button 
            onClick={startMirror}
            disabled={!deviceConnected || mirroring}
            className="btn btn-success"
          >
            ▶ Start Mirror
          </button>
          <button 
            onClick={stopMirror}
            disabled={!mirroring}
            className="btn btn-danger"
          >
            ⏹ Stop Mirror
          </button>
        </div>
      </div>
    </div>
  );
}

export default MirrorViewer;
