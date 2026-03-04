import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="animate-pop" style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
      <h1 style={{ 
        fontSize: '4.5rem', 
        fontWeight: 900, 
        letterSpacing: '-3px',
        color: 'var(--text-primary)',
        marginBottom: '0',
        lineHeight: '1',
        transform: 'rotate(-2deg)'
      }}>
        Lumina
      </h1>
      <div style={{
        display: 'inline-block',
        background: 'var(--bg-secondary)',
        color: 'var(--text-secondary)',
        padding: '4px 12px',
        fontWeight: 700,
        textTransform: 'uppercase',
        fontSize: '1.2rem',
        marginTop: '-10px',
        transform: 'rotate(1deg)'
      }}>
        Diffusion Engine
      </div>
      <p style={{ 
        color: 'var(--text-primary)', 
        fontSize: '1.1rem', 
        maxWidth: '500px', 
        margin: '2rem auto 0',
        fontWeight: 500,
        lineHeight: '1.4',
        borderLeft: '4px solid black',
        paddingLeft: '1rem',
        textAlign: 'left'
      }}>
        Fully local, browser-based image synthesis. 
        High-performance WebGPU inference with a pop-art soul.
      </p>
    </header>
  );
};
