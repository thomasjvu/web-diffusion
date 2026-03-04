import React from 'react';

export const HowItWorks: React.FC = () => {
  return (
    <div className="brutalist-card" style={{ padding: '2.5rem', marginTop: '4rem', background: '#fafafa' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem', textTransform: 'uppercase', borderBottom: '4px solid black', display: 'inline-block' }}>
        [00] HOW_IT_WORKS
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        <section>
          <h4 style={{ fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', fontSize: '0.9rem' }}>01. Private Compute</h4>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', opacity: 0.8 }}>
            Unlike traditional AI services, <strong>no data ever leaves your device</strong>. Your prompts and generated images stay within your browser's local sandbox.
          </p>
        </section>

        <section>
          <h4 style={{ fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', fontSize: '0.9rem' }}>02. WebGPU Power</h4>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', opacity: 0.8 }}>
            We leverage <strong>WebGPU</strong> to run neural network arithmetic directly on your graphics card at near-native speeds, all through a standard web worker.
          </p>
        </section>

        <section>
          <h4 style={{ fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', fontSize: '0.9rem' }}>03. Infinite Cache</h4>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', opacity: 0.8 }}>
            Model weights are stored in your <strong>Cache API</strong> storage. After the initial sync, Lumina loads instantly from your disk, even if you are offline.
          </p>
        </section>

        <section>
          <h4 style={{ fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', fontSize: '0.9rem' }}>04. Native ONNX</h4>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', opacity: 0.8 }}>
            Running <strong>ONNX Runtime Web</strong> allows us to execute state-of-the-art models like Stable Diffusion and Janus-Pro without complex server-side infrastructure.
          </p>
        </section>
      </div>

      <div style={{ marginTop: '2.5rem', padding: '1rem', border: '2px dashed black', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', opacity: 0.6 }}>
        ENCRYPTED_LOCAL_ENVIRONMENT // NO_OUTBOUND_TELEMETRY
      </div>
    </div>
  );
};
