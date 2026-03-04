import * as ort from 'onnxruntime-web/webgpu';
import { type WorkerRequest, type WorkerResponse, type ProgressEvent } from '../lib/engine/protocol';
import { MODEL_REGISTRY } from '../lib/engine/registry';

// Configure ORT Globals
ort.env.wasm.numThreads = (navigator as any).hardwareConcurrency || 4;
ort.env.wasm.simd = true;

const CACHE_NAME = 'lumina-engine-cache-v1';

class LuminaWorker {
  private sessions: Record<string, ort.InferenceSession> = {};
  private currentModelId: string | null = null;
  private tokenizer: any = null;

  async handleMessage(req: WorkerRequest) {
    try {
      switch (req.type) {
        case 'load':
          await this.loadModel(req.modelId!, req.params);
          break;
        case 'generate':
          await this.generate(req.params);
          break;
        case 'unload':
          await this.unload();
          break;
        case 'purge':
          await this.purge();
          break;
      }
    } catch (err: any) {
      this.postError(err.message);
    }
  }

  private postProgress(event: ProgressEvent) {
    self.postMessage({ type: 'progress', payload: event } as WorkerResponse);
  }

  private postError(message: string) {
    self.postMessage({ type: 'error', error: message } as WorkerResponse);
  }

  private async fetchWithCache(url: string, onProgress: (loaded: number, total: number) => void): Promise<ArrayBuffer> {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(url);
    
    if (cachedResponse) {
      return await cachedResponse.arrayBuffer();
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

    const total = parseInt(response.headers.get('content-length') || '0', 10);
    const reader = response.body!.getReader();
    let loaded = 0;
    const chunks: any[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value as any);
      loaded += (value as any).length;
      onProgress(loaded, total);
    }

    const blob = new Blob(chunks);
    await cache.put(url, new Response(blob));
    return await blob.arrayBuffer();
  }

  private async loadModel(modelId: string, _params: any) {
    if (this.currentModelId === modelId) {
       this.postProgress({ phase: 'loading', message: 'ENGINE_READY', pct: 100 });
       self.postMessage({ type: 'result', payload: { ok: true } } as WorkerResponse);
       return;
    }

    // Free previous sessions to save memory
    await this.unload();

    const config = MODEL_REGISTRY[modelId];
    if (!config) throw new Error(`Model ${modelId} not found in registry`);

    this.postProgress({ phase: 'loading', message: `INIT: ${modelId}`, pct: 0 });
    
    const files = Object.entries(config.files);
    const totalFiles = files.length;
    let filesLoaded = 0;

    for (const [key, fileObj] of files) {
      const file = fileObj as any;
      if (!file) continue;
      
      const url = `${config.baseUrl}/${file.url}`;
      const buffer = await this.fetchWithCache(url, (loaded, total) => {
        const overallPct = ((filesLoaded + (loaded / (total || file.size))) / totalFiles) * 85; 
        this.postProgress({ 
          phase: 'loading', 
          message: `SYNC: ${key}`, 
          pct: Math.round(overallPct),
        });
      });

      this.postProgress({ phase: 'loading', message: `MOUNT: ${key}` });
      
      const session = await ort.InferenceSession.create(new Uint8Array(buffer), {
        executionProviders: ['webgpu'],
        graphOptimizationLevel: 'all',
        enableCpuMemAccessReuse: true 
      } as any);
      
      this.sessions[key] = session;
      filesLoaded++;
    }

    this.postProgress({ phase: 'loading', message: 'ATTACH_CORE', pct: 90 });
    const { AutoTokenizer } = await import('@xenova/transformers');
    this.tokenizer = await AutoTokenizer.from_pretrained('Xenova/clip-vit-base-patch16');

    this.currentModelId = modelId;
    this.postProgress({ phase: 'loading', message: 'ENGINE_READY', pct: 100 });
    self.postMessage({ type: 'result', payload: { ok: true } } as WorkerResponse);
  }

  private async generate(params: { prompt: string; seed?: number }) {
    if (!this.currentModelId || !this.tokenizer) {
      this.postError('Model not loaded');
      return;
    }

    try {
      const { prompt, seed } = params;
      const start = performance.now();

      // 1. Tokenize
      this.postProgress({ phase: 'tokenizing', message: 'TOKENIZING', pct: 5 });
      const { input_ids } = await this.tokenizer(prompt, { padding: true, max_length: 77, truncation: true, return_tensor: false });
      
      // 2. Text Encoder
      this.postProgress({ phase: 'encoding', message: 'ENCODING', pct: 15 });
      const ids = Int32Array.from(input_ids as number[]);
      const encOut: any = await this.sessions.text_encoder.run({ 
        input_ids: new ort.Tensor('int32', ids, [1, ids.length]) 
      });
      const last_hidden_state = encOut.last_hidden_state ?? encOut;

      // 3. Latents
      const latent_shape = [1, 4, 64, 64];
      const sigma = 14.6146;
      const latents = randn_latents(latent_shape, sigma, seed);

      // 4. UNet (1 step for SD-Turbo)
      this.postProgress({ phase: 'denoising', message: 'DENOISING', pct: 50 });
      const tstep = [BigInt(999)];
      const scaled_latents = scale_model_inputs(latents, sigma);
      
      const unetOut: any = await this.sessions.unet.run({
        sample: new ort.Tensor('float32', scaled_latents, latent_shape),
        timestep: new ort.Tensor('int64', tstep, [1]),
        encoder_hidden_states: last_hidden_state
      });
      const out_sample = unetOut.out_sample ?? unetOut;

      // 5. Scheduler step
      const vae_scaling_factor = 0.18215;
      const new_latents = step(out_sample.data as Float32Array, latents, sigma, vae_scaling_factor);

      // 6. VAE Decode
      this.postProgress({ phase: 'decoding', message: 'DECODING', pct: 90 });
      const vaeOut = await this.sessions.vae_decoder.run({ 
        latent_sample: new ort.Tensor('float32', new_latents, latent_shape) 
      });
      const sample = vaeOut.sample ?? vaeOut;

      // 7. Convert to Image
      const blob = await tensorToPngBlob(sample);
      const timeMs = performance.now() - start;

      this.postProgress({ phase: 'complete', message: `DONE`, pct: 100 });
      self.postMessage({ type: 'result', payload: { blob, timeMs } } as WorkerResponse);
    } catch (err: any) {
      console.error('Generation Error:', err);
      this.postError(err.message);
    }
  }

  private async unload() {
    for (const [key, sess] of Object.entries(this.sessions)) {
      try {
        await (sess as any).release();
      } catch (e) {
        console.warn(`Failed to release session ${key}:`, e);
      }
    }
    this.sessions = {};
    this.currentModelId = null;
    this.tokenizer = null;
    // Suggest GC
    if (typeof (self as any).gc === 'function') (self as any).gc();
    self.postMessage({ type: 'result', payload: { ok: true } } as WorkerResponse);
  }

  private async purge() {
    await caches.delete(CACHE_NAME);
    self.postMessage({ type: 'result', payload: { ok: true } } as WorkerResponse);
  }
}

// --- Helpers ---

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function randn_latents(shape: number[], noise_sigma: number, seed?: number) {
  const rand = seed !== undefined ? mulberry32(seed) : Math.random;
  function randn() {
    const u = rand();
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  let size = 1;
  for (const s of shape) size *= s;
  const data = new Float32Array(size);
  for (let i = 0; i < size; i++) data[i] = randn() * noise_sigma;
  return data;
}

function scale_model_inputs(data: Float32Array, sigma: number) {
  const out = new Float32Array(data.length);
  const divi = Math.sqrt(sigma * sigma + 1);
  for (let i = 0; i < data.length; i++) out[i] = data[i] / divi;
  return out;
}

function step(model_output: Float32Array, sample: Float32Array, sigma: number, vae_scaling_factor: number) {
  const out = new Float32Array(model_output.length);
  const sigma_hat = sigma;
  for (let i = 0; i < model_output.length; i++) {
    const pred_original_sample = sample[i] - sigma_hat * model_output[i];
    const derivative = (sample[i] - pred_original_sample) / sigma_hat;
    const dt = -sigma_hat;
    out[i] = (sample[i] + derivative * dt) / vae_scaling_factor;
  }
  return out;
}

async function tensorToPngBlob(t: any): Promise<Blob> {
  const [, , h, w] = t.dims;
  const data = t.data;
  const out = new Uint8ClampedArray(w * h * 4);
  let idx = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const r = data[0 * h * w + y * w + x];
      const g = data[1 * h * w + y * w + x];
      const b = data[2 * h * w + y * w + x];
      const clamp = (v: number) => {
        let x = v / 2 + 0.5;
        return Math.round(Math.max(0, Math.min(1, x)) * 255);
      };
      out[idx++] = clamp(r);
      out[idx++] = clamp(g);
      out[idx++] = clamp(b);
      out[idx++] = 255;
    }
  }
  const imageData = new ImageData(out, w, h);
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx!.putImageData(imageData, 0, 0);
  return await canvas.convertToBlob({ type: 'image/png' });
}

const worker = new LuminaWorker();
self.onmessage = (e) => worker.handleMessage(e.data);
