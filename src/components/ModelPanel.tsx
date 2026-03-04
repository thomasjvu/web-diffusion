import React from 'react';
import { MODEL_REGISTRY, type EngineModelId } from '../lib/engine/registry';

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
  const [selectedModel, setSelectedModel] = React.useState<EngineModelId>('sd-xs');
  const selectedConfig = MODEL_REGISTRY[selectedModel];

  return (
    <div className="brutalist-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', fontWeight: 900, marginBottom: '1.5rem', borderBottom: '2px solid black', display: 'inline-block' }}>
        [01] ENGINE_SELECT
      </h3>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <select 
            className="input-brutalist" 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as EngineModelId)}
            disabled={isLoading || !!loadedModelId}
            style={{ marginBottom: '1rem' }}
          >
            {Object.values(MODEL_REGISTRY).map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          
          <div style={{ padding: '1rem', background: '#f5f5f5', borderLeft: '3px solid black' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
              {selectedConfig.description}
            </p>
          </div>

          <div style={{ marginTop: '8px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.6 }}>
            STATUS: {loadedModelId ? 'ACTIVE' : (isLoading ? 'INITIALIZING' : 'IDLE')}
          </div>
        </div>
        
        {loadedModelId ? (
          <button className="btn-brutalist" onClick={onUnload} disabled={isLoading} style={{ minWidth: '220px' }}>
            TERMINATE_MODULE
          </button>
        ) : (
          <button className="btn-brutalist" onClick={() => onLoad(selectedModel)} disabled={isLoading} style={{ minWidth: '220px', background: '#000', color: '#fff' }}>
            {isLoading ? 'SYNCING...' : 'MOUNT_ENGINE'}
          </button>
        )}
      </div>
      
      {loadedModelId && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#000', color: '#fff', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem' }}>
          SYS.LOADED: {MODEL_REGISTRY[loadedModelId as EngineModelId]?.name} // GPU_ACCELERATED
        </div>
      )}
    </div>
  );
};
