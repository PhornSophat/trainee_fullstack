/**
 * Utility to render and cache the first page thumbnail of a PDF file using PDF.js.
 */

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

let pdfjsLoadingPromise: Promise<any> | null = null;

export function loadPdfJs(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window not defined"));
  }

  if (window.pdfjsLib) {
    if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.js";
    }
    return Promise.resolve(window.pdfjsLib);
  }

  if (pdfjsLoadingPromise) return pdfjsLoadingPromise;

  pdfjsLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/vendor/pdfjs/pdf.min.js";
    script.async = true;

    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.js";
        resolve(window.pdfjsLib);
      } else {
        reject(new Error("pdfjsLib not available after script load"));
      }
    };

    script.onerror = () => {
      // Fallback to cdnjs if local vendor script fails
      const cdnScript = document.createElement("script");
      cdnScript.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      cdnScript.async = true;

      cdnScript.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          resolve(window.pdfjsLib);
        } else {
          reject(new Error("pdfjsLib not available after CDN fallback"));
        }
      };

      cdnScript.onerror = (err) => reject(err);
      document.head.appendChild(cdnScript);
    };

    document.head.appendChild(script);
  });

  return pdfjsLoadingPromise;
}

const thumbnailMemoryCache = new Map<string, string>();

/**
 * Generates a base64 JPEG data URL of the first page of the PDF file at `url`.
 */
export async function generatePdfThumbnail(url: string, targetWidth = 260): Promise<string> {
  if (thumbnailMemoryCache.has(url)) {
    return thumbnailMemoryCache.get(url)!;
  }

  const pdfjs = await loadPdfJs();
  const loadingTask = pdfjs.getDocument({
    url,
    cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
    cMapPacked: true,
  });

  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);

  const unscaledViewport = page.getViewport({ scale: 1.0 });
  const scale = targetWidth / unscaledViewport.width;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not acquire 2D canvas context");

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  // Fill with clean white background in case page has transparent parts
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  await page.render(renderContext).promise;

  const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
  thumbnailMemoryCache.set(url, dataUrl);
  return dataUrl;
}
