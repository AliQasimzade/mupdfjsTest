import "@/App.css";
import { useMupdf } from "@/hooks/useMupdf.hook";
import { useEffect, useState } from "react";

function App() {
  const { isWorkerInitialized, renderPage, loadDocument, currentPage } =
    useMupdf();
  const [pageImgUrl, setPageImgUrl] = useState(null);

  // Demo effect to load and display the first page of the PDF as an image.
  useEffect(() => {
    if (!isWorkerInitialized) {
      return;
    }

    const loadAndRender = async () => {
      try {
        const response = await fetch("/17I1K-04-BD-Drawings Vol 1.pdf");

        const arrayBuffer = await response.arrayBuffer();

        await loadDocument(arrayBuffer);
        const pngData = await renderPage(currentPage);

        setPageImgUrl(
          URL.createObjectURL(new Blob([pngData], { type: "image/png" }))
        );
      } catch (error) {
        console.error(error);
      }
    };

    loadAndRender();
  }, [currentPage, isWorkerInitialized, loadDocument, renderPage]);

  return <>{pageImgUrl && <img src={pageImgUrl} alt="PDF page" />}</>;
}

export default App;
