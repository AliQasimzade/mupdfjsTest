import { MUPDF_LOADED } from "@/workers/mupdf.worker";
import * as Comlink from "comlink";
import { useCallback, useEffect, useRef, useState } from "react";

export function useMupdf() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isWorkerInitialized, setIsWorkerInitialized] = useState(false);
  const document = useRef(null);
  const mupdfWorker = useRef();

  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/mupdf.worker", import.meta.url),
      {
        type: "module",
      }
    );
    mupdfWorker.current = Comlink.wrap(worker);

    worker.addEventListener("message", (event) => {
      if (event.data === MUPDF_LOADED) {
        setIsWorkerInitialized(true);
      }
    });

    return () => {
      worker.terminate();
    };
  }, []);

  const loadDocument = useCallback((arrayBuffer) => {
    document.current = arrayBuffer;
    return mupdfWorker.current.loadDocument(arrayBuffer);
  }, []);

  const renderPage = useCallback((pageIndex) => {
    if (!document.current) {
      throw new Error("Document not loaded");
    }

    setCurrentPage(pageIndex);

    return mupdfWorker.current.renderPageAsImage(
      pageIndex,
      (window.devicePixelRatio * 96) / 72
    );
  }, []);

  return {
    isWorkerInitialized,
    loadDocument,
    renderPage,
    currentPage,
  };
}
