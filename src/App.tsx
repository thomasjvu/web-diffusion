import { useLumina } from './hooks/useLumina';
import { Header } from './components/Header';
import { WebGPUGuard } from './components/WebGPUGuard';
import { ModelPanel } from './components/ModelPanel';
import { PromptInterface } from './components/PromptInterface';
import { ProgressBar } from './components/ProgressBar';
import { ImageDisplay } from './components/ImageDisplay';
import { HowItWorks } from './components/HowItWorks';
import { TelemetryTerminal } from './components/TelemetryTerminal';

function App() {
  const {
    isWebGpuSupported,
    isLoading,
    isGenerating,
    progress,
    error,
    loadedModelId,
    imageUrl,
    elapsedTime,
    loadModel,
    generateImage,
    unloadModel,
    purgeCache,
    logs
  } = useLumina();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 1rem', position: 'relative' }}>
      <Header />
      
      <WebGPUGuard isSupported={isWebGpuSupported} />
      
      {isWebGpuSupported && (
        <main className="animate-pop">
          <ModelPanel 
            loadedModelId={loadedModelId}
            isLoading={isLoading}
            onLoad={(id) => loadModel(id as any)}
            onUnload={unloadModel}
          />

          <PromptInterface 
            onGenerate={({ prompt, seed, size, steps }) => generateImage(prompt, seed, size, steps)}
            onAbort={() => {}} 
            isGenerating={isGenerating}
            isModelLoaded={!!loadedModelId}
          />

          <ProgressBar 
            pct={progress.pct}
            message={progress.message}
            isLoading={isLoading}
            isGenerating={isGenerating}
            elapsedTime={elapsedTime}
          />

          <TelemetryTerminal logs={logs} />

          <ImageDisplay 
            imageUrl={imageUrl}
            isGenerating={isGenerating}
            error={error}
          />

          <HowItWorks />

          <footer style={{ marginTop: '5rem', textAlign: 'center', opacity: 0.6 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
              <button 
                onClick={purgeCache} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'black', 
                  fontSize: '0.75rem', 
                  cursor: 'pointer',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  borderBottom: '2px solid black'
                }}
              >
                Clear_Cache
              </button>
            </div>
            <p style={{ color: 'black', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Lumina Browser Engine • No Servers • Secure Local AI
            </p>
          </footer>
        </main>
      )}
    </div>
  );
}

export default App;
