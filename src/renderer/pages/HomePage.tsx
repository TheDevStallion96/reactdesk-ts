/**
 * Home Page
 *
 * The main landing page of the application.
 * Demonstrates basic IPC communication and component usage.
 *
 * @example
 * import { HomePage } from '@/pages';
 * <HomePage />
 */

import React, { useState } from 'react';
import { Button } from '../components';
import { useAppVersion, useIPC } from '../hooks';

export const HomePage: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const version = useAppVersion();
  const { invoke } = useIPC();

  const handlePing = async () => {
    const response = await invoke('app:ping');
    setMessage(`Response: ${response}`);
  };

  return (
    <div className="home-page">
      <h1>Welcome to ReactDesk</h1>
      <p>A modern Electron + React + TypeScript template</p>

      {version && <p className="version">Version: {version}</p>}

      <div className="actions">
        <Button variant="primary" onClick={handlePing}>
          Test IPC
        </Button>
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  );
};
