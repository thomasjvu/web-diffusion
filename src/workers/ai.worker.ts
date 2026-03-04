import * as ort from 'onnxruntime-web';
import { type WorkerRequest, type WorkerResponse, type ProgressEvent } from '../lib/engine/protocol';
import { MODEL_REGISTRY, type ModelArchitecture, IMAGE_SIZES, type ImageSizePreset } from '../lib/engine/registry';

// Global Environment Setup (Optimized for 8GB Mac)
ort.env.wasm.numThreads = (navigator as any).hardwareConcurrency || 4;
ort.env.wasm.simd = true;

const CACHE_NAME = 'lumina-engine-cache-v1';

class LuminaWorker {
  private sessions: Record<string, ort.InferenceSession> = {};
  private currentModelId: string | null = null;
  private currentArchitecture: ModelArchitecture | null = null;
  private tokenizer: any = null;
  private isInitializing = false;

  async handleMessage(req: WorkerRequest) {
    if (this.isInitializing && req.type !== 'unload') {
      this.postError('Engine is busy initializing. Please wait.');
      return;
    }

    try {
      this.log(`Received command: ${req.type}`);
      switch (req.type) {
        case 'load':
          await this.loadModel(req.modelId!, req.params);
          break;
        case 'generate':
          await this.generateProxy(req.params);
          break;
        case 'unload':
          await this.unload();
          break;
        case 'purge':
          await this.purge();
          break;
      }
    } catch (err: any) {
      console.error('Worker Fault:', err);
      this.postError(err.message || 'Internal AI Error');
      this.isInitializing = false;
    }
  }

  private postProgress(event: ProgressEvent) {
    self.postMessage({ type: 'progress', payload: event } as WorkerResponse);
  }

  private postError(message: string) {
    this.log(`ERROR: ${message}`, 'error');
    self.postMessage({ type: 'error', error: message } as WorkerResponse);
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    this.postProgress({ 
      phase: 'log', 
      message, 
      level, 
      timestamp: Date.now() 
    });
  }

  private async fetchWithCache(url: string, onProgress: (loaded: number, total: number) => void): Promise<ArrayBuffer> {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(url);
    
    if (cachedResponse) {
      this.log(`Cache hit: ${url.split('/').pop()}`);
      return await cachedResponse.arrayBuffer();
    }

    this.log(`Cache miss: downloading ${url.split('/').pop()}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Sync Error [${response.status}]: Access denied or file missing for ${url}`);
    }

    const total = parseInt(response.headers.get('content-length') || '0', 10);
    const reader = response.body!.getReader();
    let loaded = 0;
    const chunks: any[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      onProgress(loaded, total);
    }

    const blob = new Blob(chunks);
    if (blob.size < 100) {
      throw new Error(`Cloud Sync Received Incomplete Data (<100b) for ${url}`);
    }
    await cache.put(url, new Response(blob));
    return await blob.arrayBuffer();
  }

  private async internalUnload() {
    this.log('Releasing current engine resources...');
    for (const [key, sess] of Object.entries(this.sessions)) {
      try {
        await (sess as any).release();
        this.log(`Released GPU resource: ${key}`);
      } catch (e) {
        console.warn(`Leak Warning: Failed to release ${key}`);
      }
    }
    this.sessions = {};
    this.currentModelId = null;
    this.currentArchitecture = null;
    this.tokenizer = null;
    
    if (typeof (self as any).gc === 'function') (self as any).gc();
  }

  private async loadModel(modelId: string, _params: any) {
    this.isInitializing = true;
    
    if (this.currentModelId === modelId) {
      this.postProgress({ phase: 'loading', message: 'READY', pct: 100 });
      self.postMessage({ type: 'result', payload: { ok: true } } as WorkerResponse);
      this.isInitializing = false;
      return;
    }

    await this.internalUnload();

    const config = MODEL_REGISTRY[modelId];
    if (!config) throw new Error(`Model ${modelId} not found in manifest`);

    this.log(`Mounting architecture: ${config.architecture}`);
    this.postProgress({ phase: 'loading', message: `MNT: ${modelId}`, pct: 0 });
    
    const files = Object.entries(config.files);
    const totalFiles = files.length;
    let filesLoaded = 0;

    for (const [key, fileObj] of files) {
      const file = fileObj as any;
      const url = `${config.baseUrl}/${file.url}`;
      
      const buffer = await this.fetchWithCache(url, (l, t) => {
        const overallPct = ((filesLoaded + (l / (t || file.size))) / totalFiles) * 85;
        this.postProgress({ 
          phase: 'loading', 
          message: `SYNC: ${key}`, 
          pct: Math.round(overallPct) 
        });
      });

      this.log(`Initializing ORT Session: ${key} (WebGPU)`);
      this.postProgress({ phase: 'loading', message: `GPU: ${key}` });
      
      try {
        const session = await ort.InferenceSession.create(new Uint8Array(buffer), {
          executionProviders: ['webgpu'],
          graphOptimizationLevel: 'all',
          enableCpuMemAccessReuse: true
        } as any);
        
        this.sessions[key] = session;
        this.log(`Session attached: ${key}`);
        
        // Log Metadata for user insight
        for (const inputName of session.inputNames) {
          const meta = (session as any).inputMetadata[inputName];
          if (meta) {
            this.log(`  - Input: ${inputName} [${meta.type}] Shape: ${JSON.stringify(meta.dims)}`);
          }
        }
      } catch (err: any) {
        this.log(`GPU Initialization Failed for ${key}: ${err.message}`, 'error');
        throw err;
      }
      filesLoaded++;
    }

    this.postProgress({ phase: 'loading', message: 'ATTACH_TOKENIZER', pct: 90 });
    try {
      this.log('Loading tokenizer module...');
      const { AutoTokenizer, env } = await import('@xenova/transformers');
      env.allowLocalModels = false;
      
      const tokenizerId = config.architecture === 'janus' 
        ? 'deepseek-ai/Janus-Pro-1B' 
        : 'Xenova/clip-vit-base-patch16';
      
      this.tokenizer = await AutoTokenizer.from_pretrained(tokenizerId).catch(err => {
        this.log(`Primary tokenizer load failed, trying fallback: ${err.message}`, 'warn');
        return AutoTokenizer.from_pretrained('openai/clip-vit-base-patch32');
      });

      if (!this.tokenizer) throw new Error('Tokenizer load failure');
      this.log('Tokenizer attached successfully');
    } catch (err: any) {
      this.log(`Tokenizer Phase Error: ${err.message}`, 'error');
      throw err;
    }

    this.currentModelId = modelId;
    this.currentArchitecture = config.architecture;
    this.isInitializing = false;
    
    this.log('Engine ready for synthesis');
    this.postProgress({ phase: 'loading', message: 'ENGINE_READY', pct: 100 });
    self.postMessage({ type: 'result', payload: { ok: true } } as WorkerResponse);
  }

  private async generateProxy(params: any) {
    if (!this.currentModelId || !this.tokenizer) {
      throw new Error('Neural pipeline not mounted. Please re-initialize engine.');
    }

    if (this.currentArchitecture === 'janus') {
      await this.generateJanus(params);
    } else {
      await this.generateSD(params);
    }
  }

  private async generateSD(params: { prompt: string; seed?: number; size?: ImageSizePreset; steps?: number }) {
    const { prompt, seed, size = '512x512', steps = 20 } = params;
    const start = performance.now();

    this.log(`Starting SD pipeline for: "${prompt.substring(0, 30)}..."`);
    this.log(`Image size: ${size}, Steps: ${steps}`);

    const imageSize = IMAGE_SIZES[size];
    const latent_shape = [1, 4, imageSize.latentHeight, imageSize.latentWidth];

    // 1. Tokenize
    this.postProgress({ phase: 'tokenizing', message: 'TKN', pct: 5 });
    const { input_ids } = await this.tokenizer(prompt, { padding: true, max_length: 77, truncation: true, return_tensor: false });
    this.log(`Tokens generated: ${input_ids.length}`);
    
    // 2. Text Encoder
    this.postProgress({ phase: 'encoding', message: 'ENC', pct: 10 });
    this.log('Running Text Encoder (WebGPU)...');
    const ids = BigInt64Array.from((input_ids as number[]).map(BigInt));
    const encStart = performance.now();
    const encOut: any = await this.sessions.text_encoder.run({ 
      input_ids: new ort.Tensor('int64', ids, [1, ids.length]) 
    });
    this.log(`Text Encoder finished in ${(performance.now() - encStart).toFixed(0)}ms`);
    
    const last_hidden_state = encOut.last_hidden_state ?? encOut;

    // 3. Create latents and scheduler
    const sigma = 14.6146;
    const latents: Float32Array = randn_latents(latent_shape, sigma, seed);
    this.log('Random latents initialized');

    // Create timesteps for Euler scheduler (from high to low)
    const timesteps = this.createTimesteps(steps);
    this.log(`Running ${steps} denoising steps...`);

    let currentLatents: Float32Array = latents;
    
    // 4. Denoising loop
    for (let i = 0; i < timesteps.length; i++) {
      const t = timesteps[i];
      const tNext = i < timesteps.length - 1 ? timesteps[i + 1] : 0;
      
      this.postProgress({ phase: 'denoising', message: `SYNTH ${i + 1}/${steps}`, pct: 15 + Math.round((i / steps) * 65) });
      
      const scaled_latents = scale_model_inputs(currentLatents, t);
      
      const unetStart = performance.now();
      const unetOut: any = await this.sessions.unet.run({
        sample: new ort.Tensor('float32', scaled_latents, latent_shape),
        timestep: new ort.Tensor('float32', [t], []),
        encoder_hidden_states: last_hidden_state
      });
      
      const out_sample = unetOut.out_sample ?? unetOut;
      
      // Euler step
      const newLatents = eulerStep(
        out_sample.data as any,
        currentLatents,
        t,
        tNext,
        0
      );
      currentLatents = newLatents;
      
      if (i % 5 === 0 || i === timesteps.length - 1) {
        this.log(`Step ${i + 1}/${steps} done (${(performance.now() - unetStart).toFixed(0)}ms)`);
      }
    }

    this.log('Denoising complete, decoding with VAE...');

    // 5. VAE Decode
    this.postProgress({ phase: 'decoding', message: 'DEC', pct: 90 });
    this.log('Decoding latents to RGB (VAE)...');
    const vaeStart = performance.now();
    const vaeOut = await this.sessions.vae_decoder.run({ 
      latent_sample: new ort.Tensor('float32', currentLatents, latent_shape) 
    });
    this.log(`VAE finish in ${(performance.now() - vaeStart).toFixed(0)}ms`);
    
    const sample = vaeOut.sample ?? vaeOut;

    // 6. Render
    this.log('Rendering texture to Blob...');
    const blob = await tensorToPngBlob(sample);
    const timeMs = performance.now() - start;

    this.log(`Total generation time: ${(timeMs / 1000).toFixed(2)}s`);
    this.postProgress({ phase: 'complete', message: 'DONE', pct: 100 });
    self.postMessage({ type: 'result', payload: { blob, timeMs } } as WorkerResponse);
  }

  private createTimesteps(numSteps: number): number[] {
    const timesteps: number[] = [];
    for (let i = 0; i < numSteps; i++) {
      const t = Math.round(999 - (i / (numSteps - 1)) * 999);
      timesteps.push(t);
    }
    return timesteps;
  }

  private async generateJanus(_params: { prompt: string }) {
    this.postProgress({ phase: 'encoding', message: 'JANUS_PIPELINE_INIT', pct: 20 });
    throw new Error('Janus architecture integration is currently in Phase 3 verification.');
  }

  private async unload() {
    await this.internalUnload();
    self.postMessage({ type: 'result', payload: { ok: true } } as WorkerResponse);
  }

  private async purge() {
    this.log('Purging local model cache...');
    await caches.delete(CACHE_NAME);
    self.postMessage({ type: 'result', payload: { ok: true } } as WorkerResponse);
  }
}

// --- Utils ---
function mulberry32(s: number) {
  let t = s >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function randn_latents(shape: number[], sigma: number, seed?: number) {
  const rand = seed !== undefined ? mulberry32(seed) : Math.random;
  const data = new Float32Array(shape.reduce((a, b) => a * b, 1));
  for (let i = 0; i < data.length; i += 2) {
    const u = rand();
    const v = rand();
    const mag = sigma * Math.sqrt(-2 * Math.log(u || 0.0001));
    data[i] = mag * Math.cos(2 * Math.PI * v);
    if (i + 1 < data.length) data[i + 1] = mag * Math.sin(2 * Math.PI * v);
  }
  return data;
}

function scale_model_inputs(data: Float32Array, _sigma: number) {
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) out[i] = data[i];
  return out;
}

function eulerStep(model_out: Float32Array | Float64Array, sample: Float32Array, t: number, tNext: number, _scale: number): Float32Array {
  const out = new Float32Array(model_out.length);
  const sigmaNow = t / 1000;
  const sigmaNext = tNext / 1000;
  
  for (let i = 0; i < model_out.length; i++) {
    const noise_pred = model_out[i];
    const pred_original = (sample[i] - sigmaNow * noise_pred) / Math.sqrt(sigmaNow * sigmaNow + 1);
    out[i] = sigmaNext * pred_original + sigmaNext * noise_pred / Math.sqrt(sigmaNow * sigmaNow + 1);
  }
  return out;
}

async function tensorToPngBlob(t: any): Promise<Blob> {
  const [, , h, w] = t.dims;
  const data = t.data;
  const out = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const r = Math.round(Math.max(0, Math.min(1, data[i] / 2 + 0.5)) * 255);
    const g = Math.round(Math.max(0, Math.min(1, data[i + w * h] / 2 + 0.5)) * 255);
    const b = Math.round(Math.max(0, Math.min(1, data[i + 2 * w * h] / 2 + 0.5)) * 255);
    out[i * 4] = r;
    out[i * 4 + 1] = g;
    out[i * 4 + 2] = b;
    out[i * 4 + 3] = 255;
  }
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx!.putImageData(new ImageData(out, w, h), 0, 0);
  return await canvas.convertToBlob({ type: 'image/png' });
}

const worker = new LuminaWorker();
self.onmessage = (e) => worker.handleMessage(e.data);
