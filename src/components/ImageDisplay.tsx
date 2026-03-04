import React from 'react';

interface ImageDisplayProps {
  imageUrl: string | null;
  isGenerating: boolean;
  error: string | null;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, isGenerating, error }) => {
  return (
    <div className="brutalist-card" style={{ 
      minHeight: '400px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative',
      padding: '2rem',
      background: 'white',
      backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}>
      {error && (
        <div style={{ textAlign: 'center', padding: '2rem', background: 'white', border: '4px solid black', boxShadow: '8px 8px 0px black' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠</div>
          <h3 style={{ textTransform: 'uppercase', marginBottom: '0.5rem' }}>Fatal Error</h3>
          <p style={{ fontWeight: 700 }}>{error}</p>
        </div>
      )}

      {!imageUrl && !isGenerating && !error && (
        <div style={{ textAlign: 'center', fontWeight: 900, textTransform: 'uppercase', opacity: 0.5 }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>▧</div>
          <p>Awaiting_Instruction</p>
        </div>
      )}

      {isGenerating && (
        <div style={{ textAlign: 'center', padding: '2rem', background: 'white', border: '4px solid black' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '8px solid black',
            borderTopColor: 'transparent',
            margin: '0 auto',
            animation: 'brutalist-spin 0.5s steps(8) infinite'
          }}></div>
          <p style={{ marginTop: '1.5rem', fontWeight: 900, textTransform: 'uppercase' }}>Computing_Matrix</p>
        </div>
      )}

      {imageUrl && !isGenerating && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            padding: '12px', 
            background: 'white', 
            border: '4px solid black', 
            boxShadow: '16px 16px 0px black',
            transition: 'transform 0.3s'
          }}>
            <img 
              src={imageUrl} 
              alt="AI Output" 
              style={{ 
                maxWidth: '100%', 
                display: 'block',
                imageRendering: 'pixelated'
              }} 
            />
          </div>
          
          <div style={{ marginTop: '3rem' }}>
            <a 
              href={imageUrl} 
              download="lumina-output.png" 
              className="btn-brutalist"
            >
              Export_Artifact
            </a>
          </div>
        </div>
      )}

      <style>{`
        @keyframes brutalist-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
