import React, { useEffect, useRef } from 'react';

interface TelemetryTerminalProps {
  logs: string[];
}

export const TelemetryTerminal: React.FC<TelemetryTerminalProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (logs.length === 0) return null;

  return (
    <div className="brutalist-card" style={{ 
      background: '#0a0a0a', 
      color: '#00ff41', 
      padding: '1.5rem', 
      marginTop: '1.5rem',
      fontFamily: 'monospace',
      fontSize: '0.75rem',
      maxHeight: '200px',
      overflowY: 'auto',
      border: '4px solid #333'
    }} ref={scrollRef}>
      <div style={{ marginBottom: '1rem', fontWeight: 900, borderBottom: '1px solid #333', paddingBottom: '0.5rem', color: '#fff' }}>
        [SYSTEM_TELEMETRY_LOG]
      </div>
      {logs.map((log, i) => (
        <div key={i} style={{ marginBottom: '0.25rem', opacity: 0.9 }}>
          <span style={{ color: '#555', marginRight: '8px' }}>&gt;</span>
          {log}
        </div>
      ))}
    </div>
  );
};
