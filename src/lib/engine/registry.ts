export interface ModelMetadata {
  id: string;
  name: string;
  baseUrl: string;
  files: {
    unet?: { url: string; size: number };
    text_encoder?: { url: string; size: number };
    vae_decoder?: { url: string; size: number };
    model?: { url: string; size: number }; // For single-file models like Janus
  };
}

export const MODEL_REGISTRY: Record<string, ModelMetadata> = {
  'sd-turbo': {
    id: 'sd-turbo',
    name: 'Stable Diffusion Turbo',
    baseUrl: 'https://huggingface.co/schmuell/sd-turbo-ort-web/resolve/main',
    files: {
      unet: { url: 'unet/model.onnx', size: 640000000 },
      text_encoder: { url: 'text_encoder/model.onnx', size: 1700000000 },
      vae_decoder: { url: 'vae_decoder/model.onnx', size: 95000000 },
    }
  },
  'janus-pro-1b': {
    id: 'janus-pro-1b',
    name: 'Janus Pro 1B',
    baseUrl: 'https://huggingface.co/deepseek-ai/Janus-Pro-1B/resolve/main',
    files: {
      model: { url: 'onnx/model_quantized.onnx', size: 800000000 } // DeepSeek Janus Pro usually needs a wrapper
    }
  }
};
