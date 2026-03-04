import React from 'react';

interface ProgressBarProps {
  pct?: number;
  message?: string;
  isGenerating: boolean;
  isLoading: boolean;
  elapsedTime: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  pct, 
  message, 
  isGenerating, 
  isLoading,
  elapsedTime
}) => {
  if (!isLoading && !isGenerating) return null;

  return (
    <div className="brutalist-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', background: 'black', animation: 'blink 1s infinite' }} />
          <span>{message || (isLoading ? 'SYNC_ACTIVE' : 'PROC_RUNNING')}</span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>T+{elapsedTime}S</span>
          {pct !== undefined && <span>{pct}%</span>}
        </div>
      </div>
      
      <div style={{ 
        height: '24px', 
        width: '100%', 
        background: 'rgba(0,0,0,0.05)', 
        border: '2px solid black',
        position: 'relative', 
        overflow: 'hidden' 
      }}>
        <div 
          style={{ 
            height: '100%', 
            width: pct !== undefined ? `${pct}%` : '50%', 
            background: '#000',
            transition: 'width 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67)',
            ...(pct === undefined && { animation: 'brutalist-indeterminate 2s linear infinite' }),
          }} 
        />
      </div>

      <style>{`
        @keyframes brutalist-indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};
