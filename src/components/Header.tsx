import React from 'react';

export const Header: React.FC = () => {
  return (
    <header style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
      <h1 style={{ 
        fontSize: '4.5rem', 
        fontWeight: 900, 
        letterSpacing: '-3px',
        color: 'var(--text-primary)',
        marginBottom: '0',
        lineHeight: '1',
      }}>
        Lumina
      </h1>
      <div style={{
        display: 'inline-block',
        background: 'var(--bg-secondary)',
        color: 'var(--text-secondary)',
        padding: '2px 10px',
        fontWeight: 800,
        textTransform: 'uppercase',
        fontSize: '0.9rem',
        marginTop: '4px',
      }}>
        Browser Engine v1.0
      </div>
      <div style={{ 
        maxWidth: '550px', 
        margin: '2.5rem auto 0',
        padding: '1.5rem',
        borderLeft: '4px solid black',
        background: 'rgba(0,0,0,0.02)',
        textAlign: 'left'
      }}>
        <p style={{ 
          fontSize: '1rem', 
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: '1.6',
          margin: 0
        }}>
          <strong>Next-generation image synthesis.</strong> Fully local, browser-based inference powered by WebGPU. No servers, no tracking, just pure AI.
        </p>
      </div>
    </header>
  );
};
