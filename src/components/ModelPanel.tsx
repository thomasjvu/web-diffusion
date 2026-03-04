import React from 'react';

interface ModelPanelProps {
  loadedModelId: string | null;
  isLoading: boolean;
  onLoad: (modelId: string) => void;
  onUnload: () => void;
}

export const ModelPanel: React.FC<ModelPanelProps> = ({ 
  loadedModelId, 
  isLoading, 
  onLoad, 
  onUnload 
}) => {
  const [selectedModel, setSelectedModel] = React.useState('sd-turbo');

  return (
    <div className="brutalist-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', fontWeight: 900, marginBottom: '1.5rem', borderBottom: '2px solid black', display: 'inline-block' }}>
        [01] ENGINE_SELECT
      </h3>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <select 
            className="input-brutalist" 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={isLoading || !!loadedModelId}
            style={{ appearance: 'none' }}
          >
            <option value="sd-turbo">SD-TURBO / OPT_FP16</option>
            <option value="janus-pro-1b">JANUS-PRO / MULTI_MODAL</option>
          </select>
          <div style={{ marginTop: '8px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            STATUS: {loadedModelId ? 'ACTIVE' : (isLoading ? 'INITIALIZING' : 'STBY')}
          </div>
        </div>
        
        {loadedModelId ? (
          <button className="btn-brutalist" onClick={onUnload} disabled={isLoading} style={{ minWidth: '200px' }}>
            TERMINATE MODULE
          </button>
        ) : (
          <button className="btn-brutalist" onClick={() => onLoad(selectedModel)} disabled={isLoading} style={{ minWidth: '200px' }}>
            {isLoading ? 'DOWNLOADING...' : 'MOUNT ENGINE'}
          </button>
        )}
      </div>
      
      {loadedModelId && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#000', color: '#fff', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem' }}>
          SYS.LOADED: {loadedModelId} // READY_FOR_INFERENCE
        </div>
      )}
    </div>
  );
};
