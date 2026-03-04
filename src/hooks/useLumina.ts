import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const checkSupport = async () => {
      if (!(navigator as any).gpu) {
        setIsWebGpuSupported(false);
        return;
      }
      setIsWebGpuSupported(true);
    };
    checkSupport();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    setElapsedTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
    const start = Date.now();
    timerRef.current = window.setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const loadModel = useCallback(async (modelId: EngineModelId) => {
    setIsLoading(true);
    setError(null);
    setProgress({ message: 'Initializing...', pct: 0 });
    startTimer();

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
      stopTimer();
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
    startTimer();

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
      stopTimer();
    }
  }, [loadedModelId]);

  const unloadModel = useCallback(async () => {
    await engine.unload();
    setLoadedModelId(null);
  }, []);

  const purgeCache = useCallback(async () => {
    await engine.unload(); // Unload first
    // In a real scenario we'd call engine.purge()
    setProgress({ message: 'Memory cleared', pct: 0 });
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
    elapsedTime,
    loadModel,
    generateImage,
    unloadModel,
    purgeCache
  };
}

