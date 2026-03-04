import React from 'react';

interface ProgressBarProps {
  pct?: number;
  message?: string;
  isGenerating: boolean;
  isLoading: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  pct, 
  message, 
  isGenerating, 
  isLoading 
}) => {
  if (!isLoading && !isGenerating) return null;

  return (
    <div className="brutalist-card" style={{ padding: '1.5rem', marginBottom: '2rem', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.9rem' }}>
        <span>
          {message || (isLoading ? 'DAT_STREAM_INACTIVE' : 'PROC_RUNNING')}
        </span>
        {pct !== undefined && (
          <span>{pct}%</span>
        )}
      </div>
      
      <div style={{ 
        height: '32px', 
        width: '100%', 
        background: 'var(--bg-primary)', 
        border: '3px solid black',
        position: 'relative', 
        overflow: 'hidden' 
      }}>
        {/* Dither pattern for progress bar */}
        <div 
          className="dither-accent"
          style={{ 
            height: '100%', 
            width: pct !== undefined ? `${pct}%` : '50%', 
            background: '#000',
            transition: 'width 0.2s steps(20)',
            ...(pct === undefined && { animation: 'brutalist-indeterminate 2s linear infinite' }),
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '4px 4px'
          }} 
        />
      </div>

      <style>{`
        @keyframes brutalist-indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};
