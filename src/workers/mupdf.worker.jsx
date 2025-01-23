import * as Comlink from "comlink";
import * as mupdfjs from "mupdf/mupdfjs";

export const MUPDF_LOADED = "MUPDF_LOADED";

class MupdfWorker {
  constructor() {
    this.document = undefined;
    this.initializeMupdf();
  }

  initializeMupdf() {
    try {
      postMessage(MUPDF_LOADED);
    } catch (error) {
      console.error("Failed to initialize MuPDF:", error);
    }
  }

  loadDocument(document) {
    this.document = mupdfjs.PDFDocument.openDocument(
      document,
      "application/pdf"
    );

    return true;
  }

  renderPageAsImage(pageIndex = 0, scale = 1) {
    if (!this.document) throw new Error("Document not loaded");

    const page = this.document.loadPage(pageIndex);
    const pixmap = page.toPixmap(
      [scale, 0, 0, scale, 0, 0],
      mupdfjs.ColorSpace.DeviceRGB
    );

    return pixmap.asPNG();
  }
}

Comlink.expose(new MupdfWorker());
