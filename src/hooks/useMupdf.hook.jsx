import * as Comlink from "comlink";
import { useCallback, useEffect, useRef, useState } from "react";

export function useMupdf() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isWorkerInitialized, setIsWorkerInitialized] = useState(false);
  const mupdfWorker = useRef(null);
  const MUPDF_LOADED = "MUPDF_LOADED";

  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/mupdf.worker", import.meta.url),
      { type: "module" }
    );

    // Wrap the worker with Comlink
    mupdfWorker.current = Comlink.wrap(worker);

    const handleWorkerMessage = (event) => {
      if (event.data === MUPDF_LOADED) {
        setIsWorkerInitialized(true);
      }
    };

    // Listen for messages from the worker
    worker.addEventListener("message", handleWorkerMessage);

    return () => {
      worker.removeEventListener("message", handleWorkerMessage);
      worker.terminate(); // Clean up worker
    };
  }, []);

  const loadDocument = useCallback(async (arrayBuffer) => {
    if (!mupdfWorker.current) {
      throw new Error("Worker is not initialized");
    }

    try {
      const success = await mupdfWorker.current.loadDocument(arrayBuffer);
      return success;
    } catch (error) {
      console.error("Failed to load document:", error);
      throw error;
    }
  }, []);

  const renderPage = useCallback(async (pageIndex) => {
    if (!mupdfWorker.current) {
      throw new Error("Worker is not initialized");
    }

    setCurrentPage(pageIndex);

    try {
      const scale = 0.5; 
      return await mupdfWorker.current.renderPageAsImage(pageIndex, scale);
    } catch (error) {
      console.error("Failed to render page:", error);
      throw error;
    }
  }, []);

  const getPageCount = useCallback(async () => {
    if (!mupdfWorker.current) {
      throw new Error("Worker is not initialized");
    }

    try {
      return await mupdfWorker.current.getPageCount();
    } catch (error) {
      console.error("Failed to get page count:", error);
      throw error;
    }
  }, []);

  return {
    isWorkerInitialized,
    loadDocument,
    renderPage,
    getPageCount,
    currentPage,
  };
}
