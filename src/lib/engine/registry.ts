export type ModelArchitecture = 'stable-diffusion' | 'janus';

export type ImageSizePreset = '256x256' | '512x512' | '1024x1024';

export interface ImageSize {
  width: number;
  height: number;
  latentWidth: number;
  latentHeight: number;
}

export const IMAGE_SIZES: Record<ImageSizePreset, ImageSize> = {
  '256x256': { width: 256, height: 256, latentWidth: 32, latentHeight: 32 },
  '512x512': { width: 512, height: 512, latentWidth: 64, latentHeight: 64 },
  '1024x1024': { width: 1024, height: 1024, latentWidth: 128, latentHeight: 128 },
};

export interface ModelMetadata {
  id: string;
  name: string;
  description: string;
  architecture: ModelArchitecture;
  baseUrl: string;
  files: {
    unet?: { url: string; size: number };
    text_encoder?: { url: string; size: number };
    vae_decoder?: { url: string; size: number };
    model?: { url: string; size: number }; 
  };
}

export const MODEL_REGISTRY: Record<string, ModelMetadata> = {
  'sd-xs': {
    id: 'sd-xs',
    name: 'Stable Diffusion XS (Tiny)',
    description: 'Ultra-distilled Tiny-SD. Optimized for 8GB Mac (M2). Fastest synthesis.',
    architecture: 'stable-diffusion',
    baseUrl: 'https://huggingface.co/IlyasMoutawwakil/tiny-stable-diffusion-onnx/resolve/main',
    files: {
      unet: { url: 'unet/model.onnx', size: 160000000 },
      text_encoder: { url: 'text_encoder/model.onnx', size: 85000000 },
      vae_decoder: { url: 'vae_decoder/model.onnx', size: 45000000 },
    }
  },
  'sd-turbo': {
    id: 'sd-turbo',
    name: 'Stable Diffusion Turbo',
    description: 'Fast 1-step generation. High-quality distilled architecture.',
    architecture: 'stable-diffusion',
    baseUrl: 'https://huggingface.co/schmuell/sd-turbo-ort-web/resolve/main',
    files: {
      unet: { url: 'unet/model.onnx', size: 641000000 },
      text_encoder: { url: 'text_encoder/model.onnx', size: 171000000 },
      vae_decoder: { url: 'vae_decoder/model.onnx', size: 95000000 },
    }
  },
  'janus-pro-1b': {
    id: 'janus-pro-1b',
    name: 'Janus Pro 1B',
    description: 'Vision-LLM generation. Powerful, but slower on low-VRAM devices.',
    architecture: 'janus',
    baseUrl: 'https://huggingface.co/deepseek-ai/Janus-Pro-1B/resolve/main',
    files: {
      model: { url: 'onnx/model_quantized.onnx', size: 850000000 }
    }
  }
};

export type EngineModelId = keyof typeof MODEL_REGISTRY;
