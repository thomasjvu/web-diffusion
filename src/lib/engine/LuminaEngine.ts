import { type WorkerRequest, type WorkerResponse, type ProgressEvent, type EngineModelId } from './protocol';

export class LuminaEngine {
  private worker: Worker;
  private onProgressCb?: (event: ProgressEvent) => void;
  private resolveLoad?: (val: any) => void;
  private rejectLoad?: (err: any) => void;
  private resolveGen?: (val: any) => void;
  private rejectGen?: (err: any) => void;

  constructor() {
    this.worker = new Worker(
      new URL('../../workers/ai.worker.ts', import.meta.url),
      { type: 'module' }
    );

    this.worker.onmessage = this.handleMessage.bind(this);
  }

  private handleMessage(e: MessageEvent<WorkerResponse>) {
    const res = e.data;
    switch (res.type) {
      case 'progress':
        this.onProgressCb?.(res.payload);
        break;
      case 'result':
        if (this.resolveLoad) {
          this.resolveLoad(res.payload);
          this.resolveLoad = undefined;
        } else if (this.resolveGen) {
          this.resolveGen(res.payload);
          this.resolveGen = undefined;
        }
        break;
      case 'error':
        if (this.rejectLoad) {
          this.rejectLoad(new Error(res.error));
          this.rejectLoad = undefined;
        } else if (this.rejectGen) {
          this.rejectGen(new Error(res.error));
          this.rejectGen = undefined;
        }
        break;
    }
  }

  async loadModel(modelId: EngineModelId, onProgress?: (e: ProgressEvent) => void): Promise<void> {
    this.onProgressCb = onProgress;
    return new Promise((resolve, reject) => {
      this.resolveLoad = resolve;
      this.rejectLoad = reject;
      this.worker.postMessage({ type: 'load', modelId } as WorkerRequest);
    });
  }

  async generate(prompt: string, seed?: number, onProgress?: (e: ProgressEvent) => void): Promise<Blob> {
    this.onProgressCb = onProgress;
    return new Promise((resolve, reject) => {
      this.resolveGen = (payload: any) => resolve(payload.blob);
      this.rejectGen = reject;
      this.worker.postMessage({ type: 'generate', params: { prompt, seed } } as WorkerRequest);
    });
  }

  async unload(): Promise<void> {
    return new Promise((resolve) => {
      const handler = (e: MessageEvent<WorkerResponse>) => {
        if (e.data.type === 'result') {
          this.worker.removeEventListener('message', handler);
          resolve();
        }
      };
      this.worker.addEventListener('message', handler);
      this.worker.postMessage({ type: 'unload' } as WorkerRequest);
    });
  }
}

// Singleton instance
export const engine = new LuminaEngine();

