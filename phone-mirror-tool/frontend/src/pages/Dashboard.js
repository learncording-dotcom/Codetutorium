import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';

function Dashboard() {
  const [sessionId, setSessionId] = useState('');
  const [mirrorLink, setMirrorLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const createSession = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/sessions/create');
      const { sessionId, mirrorLink } = response.data;
      setSessionId(sessionId);
      setMirrorLink(mirrorLink);
    } catch (error) {
      alert('Error creating session: ' + error.message);
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mirrorLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dashboard">
      <div className="container">
        <section className="hero">
          <h2>Create a Mirroring Session</h2>
          <p>Generate a unique session link to start mirroring</p>
        </section>

        <section className="session-creation">
          <button 
            onClick={createSession} 
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Creating...' : '🔗 Create New Session'}
          </button>

          {mirrorLink && (
            <div className="session-info">
              <div className="info-box">
                <label>Session ID:</label>
                <code>{sessionId}</code>
              </div>

              <div className="info-box">
                <label>Mirror Link:</label>
                <div className="link-container">
                  <input type="text" value={mirrorLink} readOnly />
                  <button 
                    onClick={copyToClipboard}
                    className="btn btn-secondary"
                  >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
              </div>

              <div className="qr-section">
                <p>Share this link with your device or scan the QR code:</p>
                <div className="qr-placeholder">
                  QR Code will appear here
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="features">
          <h3>Features</h3>
          <ul>
            <li>✅ Real-time screen mirroring</li>
            <li>✅ Remote control capability</li>
            <li>✅ Session recording</li>
            <li>✅ Multi-viewer support</li>
            <li>✅ Secure authentication</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
