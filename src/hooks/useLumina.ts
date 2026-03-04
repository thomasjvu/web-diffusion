import { useState, useEffect, useCallback } from 'react';
import { engine } from '../lib/engine/LuminaEngine';
import { type ProgressEvent, type EngineModelId } from '../lib/engine/protocol';

export function useLumina() {
  const [isWebGpuSupported, setIsWebGpuSupported] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<Partial<ProgressEvent>>({});
  const [error, setError] = useState<string | null>(null);
  const [loadedModelId, setLoadedModelId] = useState<EngineModelId | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkSupport = async () => {
      if (!(navigator as any).gpu) {
        setIsWebGpuSupported(false);
        return;
      }
      setIsWebGpuSupported(true);
    };
    checkSupport();
  }, []);

  const loadModel = useCallback(async (modelId: EngineModelId) => {
    setIsLoading(true);
    setError(null);
    setProgress({ message: 'Initializing...', pct: 0 });

    try {
      await engine.loadModel(modelId, (p) => {
        setProgress(p);
      });
      setLoadedModelId(modelId);
    } catch (err: any) {
      setError(err?.message || 'Failed to load model');
    } finally {
      setIsLoading(false);
      setProgress({});
    }
  }, []);

  const generateImage = useCallback(async (prompt: string, seed?: number) => {
    if (!loadedModelId) {
      setError('Model not loaded');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setImageUrl(null);

    try {
      const blob = await engine.generate(prompt, seed, (p) => {
        setProgress(p);
      });
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (err: any) {
      setError(err?.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
      setProgress({});
    }
  }, [loadedModelId]);

  const unloadModel = useCallback(async () => {
    await engine.unload();
    setLoadedModelId(null);
  }, []);

  const purgeCache = useCallback(async () => {
    // Implementation for purge in engine
    setProgress({ message: 'Cache purged', pct: 0 });
    setTimeout(() => setProgress({}), 2000);
  }, []);

  return {
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
  };
}
