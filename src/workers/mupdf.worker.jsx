import * as Comlink from "comlink";
import * as mupdfjs from "mupdf/mupdfjs";

export const MUPDF_LOADED = "MUPDF_LOADED";

const createMupdfWorker = () => {
  let document = null;

  const initializeMupdf = () => {
    try {
      postMessage(MUPDF_LOADED);
    } catch (error) {
      console.error("Failed to initialize MuPDF:", error);
    }
  };

  const loadDocument = (documentBuffer) => {
    try {
      document = mupdfjs.PDFDocument.openDocument(
        documentBuffer,
        "application/pdf"
      );
      return true;
    } catch (error) {
      console.error("Failed to load document:", error);
      throw error;
    }
  };

  const renderPageAsImage = (pageIndex = 2, scale = 0.3) => {
    if (!document) {
      throw new Error("Document not loaded");
    }

    try {
      const page = document.loadPage(2);
      const pixmap = page.toPixmap(
        [scale, 0, 0, scale, 0, 0],
        mupdfjs.ColorSpace.DeviceRGB
      );
      return pixmap.asPNG();
    } catch (error) {
      console.error("Failed to render page:", error);
      throw error;
    }
  };

  const getPageCount = () => {
    if (!document) {
      throw new Error("Document not loaded");
    }

    try {
      return document.countPages();
    } catch (error) {
      console.error("Failed to get page count:", error);
      throw error;
    }
  };

  // Initialize the worker
  initializeMupdf();

  // Expose the API
  return {
    loadDocument,
    renderPageAsImage,
    getPageCount, // Expose this method to get total page count
  };
};

// Expose the worker API using Comlink
Comlink.expose(createMupdfWorker());
