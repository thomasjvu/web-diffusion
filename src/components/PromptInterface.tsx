import React from 'react';
import type { ImageSizePreset } from '../lib/engine/protocol';

interface PromptInterfaceProps {
  onGenerate: (params: { prompt: string; seed?: number; size: ImageSizePreset; steps: number }) => void;
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
  const [prompt, setPrompt] = React.useState('japanese cherry blossoms, anime, school building, visual novel, niji');
  const [seed, setSeed] = React.useState<string>('');
  const [size, setSize] = React.useState<ImageSizePreset>('512x512');
  const [steps, setSteps] = React.useState<number>(20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || isGenerating || !isModelLoaded) return;
    onGenerate({ 
      prompt, 
      seed: seed === '' ? undefined : Number(seed),
      size,
      steps
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
          <div style={{ flex: 1, minWidth: '140px' }}>
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

          <div style={{ flex: 1, minWidth: '140px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              IMAGE_SIZE
            </label>
            <select 
              className="input-brutalist"
              value={size}
              onChange={(e) => setSize(e.target.value as ImageSizePreset)}
              disabled={!isModelLoaded || isGenerating}
              style={{ padding: '12px', width: '100%' }}
            >
              <option value="256x256">256 x 256</option>
              <option value="512x512">512 x 512</option>
              <option value="1024x1024">1024 x 1024</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '140px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              STEPS
            </label>
            <input 
              type="number"
              className="input-brutalist"
              min={1}
              max={50}
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
              disabled={!isModelLoaded || isGenerating}
              style={{ padding: '12px', width: '100%' }}
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
