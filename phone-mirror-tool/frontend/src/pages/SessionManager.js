import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SessionManager.css';

function SessionManager() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/sessions');
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
    setLoading(false);
  };

  return (
    <div className="session-manager">
      <h2>Active Sessions</h2>
      
      {loading && <p>Loading...</p>}
      
      {sessions.length === 0 ? (
        <p>No active sessions</p>
      ) : (
        <table className="sessions-table">
          <thead>
            <tr>
              <th>Session ID</th>
              <th>Status</th>
              <th>Device</th>
              <th>Mirroring</th>
              <th>Viewers</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(session => (
              <tr key={session.sessionId}>
                <td><code>{session.sessionId.substring(0, 8)}...</code></td>
                <td><span className="badge">{session.status}</span></td>
                <td>{session.deviceConnected ? '✓ Connected' : '✗ Disconnected'}</td>
                <td>{session.mirroring ? '● Active' : '○ Inactive'}</td>
                <td>{session.viewers}</td>
                <td>{new Date(session.createdAt).toLocaleString()}</td>
                <td>
                  <a href={`/mirror/${session.sessionId}`} className="btn btn-small">
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SessionManager;
