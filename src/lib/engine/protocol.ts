export type EngineModelId = 'sd-xs' | 'sd-turbo' | 'janus-pro-1b';
export type ImageSizePreset = '256x256' | '512x512' | '1024x1024';

export interface ProgressEvent {
  phase: 'loading' | 'tokenizing' | 'encoding' | 'denoising' | 'decoding' | 'complete' | 'log';
  message: string;
  pct?: number;
  loaded?: number;
  total?: number;
  level?: 'info' | 'warn' | 'error';
  timestamp?: number;
}

export interface WorkerRequest {
  type: 'load' | 'generate' | 'unload' | 'purge';
  modelId?: EngineModelId;
  params?: {
    prompt: string;
    seed?: number;
    size?: ImageSizePreset;
    steps?: number;
  };
}

export interface WorkerResponse {
  type: 'progress' | 'result' | 'error';
  payload?: any;
  error?: string;
}
