import React, { useState, useEffect } from 'react';
import type { AppVersionInfo } from '../shared/types/index';

/**
 * Main App Component
 * Demonstrates secure IPC communication with the main process
 */
const App: React.FC = () => {
  const [versionInfo, setVersionInfo] = useState<AppVersionInfo | null>(null);
  const [pingResult, setPingResult] = useState<string>('');
  const [processedData, setProcessedData] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [notification, setNotification] = useState<string>('');

  /**
   * Example: Get app version on component mount
   * Security: Read-only data from main process
   */
  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const info = await window.electronAPI.getAppVersion();
        setVersionInfo(info);
      } catch (error) {
        console.error('Failed to get version:', error);
      }
    };

    fetchVersion();
  }, []);

  /**
   * Example: Subscribe to notifications from main process
   * Security: Controlled event subscription with cleanup
   */
  useEffect(() => {
    const unsubscribe = window.electronAPI.onNotification((message) => {
      setNotification(message);
      // Auto-clear notification after 3 seconds
      setTimeout(() => setNotification(''), 3000);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  /**
   * Example: Simple ping/pong IPC
   */
  const handlePing = async () => {
    try {
      const result = await window.electronAPI.ping();
      setPingResult(result);
    } catch (error) {
      console.error('Ping failed:', error);
      setPingResult('Error');
    }
  };

  /**
   * Example: Process data with validation
   * Security: Input is validated in preload script
   */
  const handleProcessData = async () => {
    try {
      const result = await window.electronAPI.processData({
        text: 'Hello',
        count: 3,
      });
      setProcessedData(result.processed);
    } catch (error) {
      console.error('Process data failed:', error);
    }
  };

  /**
   * Example: Open file dialog and read file
   * Security: User explicitly selects file via native dialog
   */
  const handleOpenFile = async () => {
    try {
      const result = await window.electronAPI.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Text Files', extensions: ['txt', 'md'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        setSelectedFile(filePath);

        // Read the file content
        const content = await window.electronAPI.readFile(filePath);
        setFileContent(content);
      }
    } catch (error) {
      console.error('File operation failed:', error);
    }
  };

  return (
    <div className="app">
      <h1>🔒 Secure Electron + React</h1>
      <p>
        This is a secure Electron application with React 18+, Vite, and TypeScript.
      </p>

      {/* Version Information Section */}
      <section style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h2>📋 Application Information</h2>
        {versionInfo ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><strong>App Name:</strong> {versionInfo.name}</li>
            <li><strong>Version:</strong> {versionInfo.version}</li>
            <li><strong>Electron:</strong> {versionInfo.electronVersion}</li>
            <li><strong>Chrome:</strong> {versionInfo.chromeVersion}</li>
            <li><strong>Node:</strong> {versionInfo.nodeVersion}</li>
          </ul>
        ) : (
          <p>Loading version info...</p>
        )}
      </section>

      {/* IPC Communication Examples */}
      <section style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h2>🔌 IPC Communication Examples</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={handlePing}>Send Ping</button>
          {pingResult && <span style={{ marginLeft: '1rem' }}>Response: {pingResult}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <button onClick={handleProcessData}>Process Data</button>
          {processedData && (
            <div style={{ marginTop: '0.5rem' }}>
              <strong>Processed:</strong> {processedData}
            </div>
          )}
        </div>
      </section>

      {/* File Operations Section */}
      <section style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h2>📁 File Operations</h2>
        
        <div>
          <button onClick={handleOpenFile}>Open Text File</button>
          {selectedFile && (
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Selected File:</strong> {selectedFile}</p>
              <div style={{ 
                marginTop: '0.5rem', 
                padding: '0.5rem', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px',
                maxHeight: '200px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '0.9rem'
              }}>
                {fileContent}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Notification Display */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '1rem',
          backgroundColor: '#4CAF50',
          color: 'white',
          borderRadius: '4px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}>
          📬 {notification}
        </div>
      )}

      {/* Security Information */}
      <section style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
        <h3>🔒 Security Features Enabled:</h3>
        <ul>
          <li>✅ Context Isolation</li>
          <li>✅ Node Integration Disabled</li>
          <li>✅ Sandbox Mode</li>
          <li>✅ Secure IPC via contextBridge</li>
          <li>✅ Input Validation</li>
          <li>✅ Content Security Policy</li>
        </ul>
      </section>
    </div>
  );
};

export default App;
