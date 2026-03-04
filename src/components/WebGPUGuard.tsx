import React from 'react';

interface WebGPUGuardProps {
  isSupported: boolean | null;
}

export const WebGPUGuard: React.FC<WebGPUGuardProps> = ({ isSupported }) => {
  if (isSupported === null || isSupported === true) return null;

  return (
    <div className="brutalist-card" style={{ 
      padding: '3rem', 
      textAlign: 'center', 
      maxWidth: '600px', 
      margin: '4rem auto',
    }}>
      <div style={{ fontSize: '5rem', marginBottom: '1.5rem', filter: 'grayscale(1)' }}>🚫</div>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Hardware Conflict</h2>
      <p style={{ fontSize: '1.2rem', fontWeight: 500, marginBottom: '2rem' }}>
        Lumina requires <strong>WebGPU</strong> for neural processing. 
        Your current environment is incompatible.
      </p>
      
      <div style={{ borderTop: '4px solid black', paddingTop: '2rem', textAlign: 'left' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Initialization Checklist:</h3>
        <ul style={{ listStyle: 'none', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem' }}>
          <li style={{ marginBottom: '8px' }}>[ ] Chrome / Edge 113+</li>
          <li style={{ marginBottom: '8px' }}>[ ] GFX Acceleration ON</li>
          <li style={{ marginBottom: '8px' }}>[ ] GPU Drivers Updated</li>
        </ul>
      </div>
    </div>
  );
};
