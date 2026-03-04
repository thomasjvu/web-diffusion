import React from 'react';

interface PromptInterfaceProps {
  onGenerate: (params: { prompt: string; seed?: number }) => void;
  onAbort: () => void;
  isGenerating: boolean;
  isModelLoaded: boolean;
}

export const PromptInterface: React.FC<PromptInterfaceProps> = ({ 
  onGenerate, 
  onAbort, 
  isGenerating, 
  isModelLoaded 
}) => {
  const [prompt, setPrompt] = React.useState('');
  const [seed, setSeed] = React.useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || isGenerating || !isModelLoaded) return;
    onGenerate({ 
      prompt, 
      seed: seed === '' ? undefined : Number(seed) 
    });
  };

  return (
    <div className="brutalist-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            [02] INPUT_PROMPT
          </label>
          <textarea 
            className="input-brutalist"
            placeholder="TYPE_INPUT_HERE..."
            style={{ minHeight: '120px', resize: 'vertical' }}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={!isModelLoaded || isGenerating}
          />
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              SEED_PARAM (OPTIONAL)
            </label>
            <input 
              type="number"
              className="input-brutalist"
              placeholder="AUTO"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              disabled={!isModelLoaded || isGenerating}
              style={{ padding: '12px' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            {isGenerating ? (
              <button type="button" className="btn-brutalist" onClick={onAbort} style={{ background: '#000', color: '#fff' }}>
                ABORT_MISSION
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn-brutalist" 
                disabled={!isModelLoaded || !prompt}
                style={{ background: '#000', color: '#fff', minWidth: '220px' }}
              >
                EXEC_SYNTHESIS
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
