import { useLumina } from './hooks/useLumina';
import { Header } from './components/Header';
import { WebGPUGuard } from './components/WebGPUGuard';
import { ModelPanel } from './components/ModelPanel';
import { PromptInterface } from './components/PromptInterface';
import { ProgressBar } from './components/ProgressBar';
import { ImageDisplay } from './components/ImageDisplay';

function App() {
  const {
    isWebGpuSupported,
    isLoading,
    isGenerating,
    progress,
    error,
    loadedModelId,
    imageUrl,
    loadModel,
    generateImage,
    unloadModel,
    purgeCache
  } = useLumina();

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Header />
      
      {/* Pop Art Background Accents */}
      <div className="pop-circle" style={{ width: '300px', height: '300px', top: '-100px', right: '-100px' }}></div>
      <div className="pop-circle" style={{ width: '200px', height: '200px', bottom: '100px', left: '-50px', transform: 'rotate(15deg)' }}></div>
      
      <WebGPUGuard isSupported={isWebGpuSupported} />
      
      {isWebGpuSupported && (
        <main className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <ModelPanel 
            loadedModelId={loadedModelId}
            isLoading={isLoading}
            onLoad={(id) => loadModel(id as any)}
            onUnload={unloadModel}
          />

          <PromptInterface 
            onGenerate={({ prompt, seed }) => generateImage(prompt, seed)}
            onAbort={() => {}} // Custom abort logic can be added to engine
            isGenerating={isGenerating}
            isModelLoaded={!!loadedModelId}
          />

          <ProgressBar 
            pct={progress.pct}
            message={progress.message}
            isLoading={isLoading}
            isGenerating={isGenerating}
          />

          <ImageDisplay 
            imageUrl={imageUrl}
            isGenerating={isGenerating}
            error={error}
          />

          <footer style={{ marginTop: '3rem', textAlign: 'center', paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
              <button 
                onClick={purgeCache} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-muted)', 
                  fontSize: '0.8rem', 
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Clear engine cache
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Built with Lumina Engine • Optimized FP16 Inference • Deep Private
            </p>
          </footer>
        </main>
      )}
    </div>
  );
}

export default App;
