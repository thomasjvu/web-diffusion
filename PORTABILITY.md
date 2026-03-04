# Portability Guide: Dropping Web Stable Diffusion into Your Project

This project is designed to be easily portable. The core AI logic is encapsulated in a single React hook.

## Quick Drop-in Steps

1.  **Install Dependencies**

    ```bash
    npm install web-txt2img @xenova/transformers @huggingface/transformers onnxruntime-web
    ```

2.  **Add the Hook**
    Copy `src/hooks/useWebTxt2Img.ts` into your project.

3.  **Usage Example**

    ```tsx
    import { useWebTxt2Img } from "./hooks/useWebTxt2Img";

    function MyAIComponent() {
      const {
        loadModel,
        generateImage,
        imageUrl,
        isLoading,
        isGenerating,
        progress,
      } = useWebTxt2Img();

      return (
        <div>
          <button onClick={() => loadModel("sd-turbo")}>Load SD-Turbo</button>
          <button
            onClick={() => generateImage({ prompt: "A sunset over mountains" })}
          >
            Generate
          </button>

          {isLoading && (
            <p>
              Loading: {progress.message} ({progress.pct}%)
            </p>
          )}
          {isGenerating && <p>Generating: {progress.message}</p>}
          {imageUrl && <img src={imageUrl} alt="AI Generated" />}
        </div>
      );
    }
    ```

## Vite Configuration (Required)

Ensure your `vite.config.ts` handles workers and excludes the library from dependency optimization if you encounter issues:

```ts
export default defineConfig({
  worker: {
    format: "es",
  },
  optimizeDeps: {
    exclude: ["web-txt2img"],
  },
});
```

## Hosting WASM Assets (Optional for SD-Turbo)

If you want to support the experimental WASM fallback for SD-Turbo, you'll need to serve the ONNX Runtime WASM files. See the `web-txt2img` documentation for details.
