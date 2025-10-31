/**
 * useAppVersion Hook
 * 
 * A hook that fetches and returns the application version from the main process.
 * 
 * @example
 * const version = useAppVersion();
 * return <div>Version: {version}</div>;
 */

import { useState, useEffect } from 'react';
import { useIPC } from './useIPC';

export function useAppVersion(): string | null {
  const [version, setVersion] = useState<string | null>(null);
  const { invoke } = useIPC();

  useEffect(() => {
    invoke('app:getVersion').then((v) => {
      if (typeof v === 'string') {
        setVersion(v);
      }
    });
  }, [invoke]);

  return version;
}
