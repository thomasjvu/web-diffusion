export interface ModelMetadata {
  id: string;
  name: string;
  baseUrl: string;
  files: {
    unet: { url: string; size: number };
    text_encoder: { url: string; size: number };
    vae_decoder: { url: string; size: number };
  };
}

export const MODEL_REGISTRY: Record<string, ModelMetadata> = {
  'sd-turbo': {
    id: 'sd-turbo',
    name: 'Stable Diffusion Turbo (Optimized)',
    baseUrl: 'https://huggingface.co/schmuell/sd-turbo-ort-web/resolve/main',
    files: {
      unet: { url: 'unet/model.onnx', size: 64010241024 }, // Sizes are approximations
      text_encoder: { url: 'text_encoder/model.onnx', size: 170010241024 },
      vae_decoder: { url: 'vae_decoder/model.onnx', size: 9510241024 },
    }
  }
};
