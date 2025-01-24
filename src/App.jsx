import "@/App.css";
import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { useMupdf } from "@/hooks/useMupdf.hook";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css"; // Import necessary styles for react-resizable
import Draggable from "react-free-draggable";

function App() {
  const { isWorkerInitialized, renderPage, loadDocument, getPageCount } =
    useMupdf();
  const [pageImgUrl, setPageImgUrl] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [canvases, setCanvases] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    id: null,
    name: "",
    type: "",
    size: "",
  });
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isWorkerInitialized) return;

    const loadAndRender = async () => {
      try {
        setLoading(true);
        const response = await fetch("/17I1K-04-BD-Drawings Vol 1.pdf");
        const arrayBuffer = await response.arrayBuffer();
        const success = await loadDocument(arrayBuffer);
        if (success) {
          const pageCount = await getPageCount();
          setTotalPages(pageCount);

          const firstPage = await renderPage(0);
          setPageImgUrl(
            URL.createObjectURL(new Blob([firstPage], { type: "image/png" }))
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadAndRender();
  }, [isWorkerInitialized, loadDocument, renderPage, getPageCount]);

  const handlePageClick = async ({ selected }) => {
    try {
      setLoading(true);
      const pageData = await renderPage(selected);
      setPageImgUrl(
        URL.createObjectURL(new Blob([pageData], { type: "image/png" }))
      );
      setCurrentPage(selected + 1);
    } catch (error) {
      console.error("Error rendering page:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRightClick = (event, canvas = null) => {
    event.preventDefault();
    const { clientX, clientY } = event;
    setModalPosition({ x: clientX, y: clientY });

    // If canvas exists, pre-fill modal fields with its data
    if (canvas) {
      setModalData({
        id: canvas.id,
        name: canvas.name,
        type: canvas.type,
        size: canvas.size,
      });
    } else {
      setModalData({
        id: null,
        name: "",
        type: "",
        size: "",
      });
    }

    setIsModalOpen(true);
  };

  const handleModalSubmit = () => {
    if (modalData.id) {
      // Update existing canvas
      setCanvases((prev) =>
        prev.map((canvas) =>
          canvas.id === modalData.id ? { ...canvas, ...modalData } : canvas
        )
      );
    } else {
      // Create new canvas at modal position
      const newCanvas = {
        ...modalData,
        id: Date.now(),
        size: parseInt(modalData.size), // Ensure size is treated as an integer
        position: modalPosition,
      };
      setCanvases((prev) => [...prev, newCanvas]);
    }
    setIsModalOpen(false);
  };

  const renderCanvas = (canvas) => (
    <Draggable
      bounds=".boxs"
      scale={1}
      key={canvas.id}
      defaultPosition={{ x: canvas.position.x, y: canvas.position.y }}
      onStop={(e, data) => {
        setCanvases((prev) =>
          prev.map((c) =>
            c.id === canvas.id
              ? { ...c, position: { x: data.x, y: data.y } }
              : c
          )
        );
      }}
    >
      {/* Use ResizableBox for resizing */}
      <ResizableBox
        width={canvas.size}
        height={canvas.size}
        minConstraints={[50, 50]} // Minimum size constraints
        maxConstraints={[500, 500]} // Maximum size constraints
        onResizeStop={(e, data) => {
          setCanvases((prev) =>
            prev.map((c) =>
              c.id === canvas.id ? { ...c, size: data.size.width } : c
            )
          );
        }}
      >
        <div
          className="canvas"
          style={{
            position: "absolute",
            left: canvas.position.x,
            top: canvas.position.y,
          }}
          onContextMenu={(e) => handleRightClick(e, canvas)}
        ></div>
      </ResizableBox>
    </Draggable>
  );

  return (
    <div className="app" onContextMenu={(e) => handleRightClick(e)}>
      {loading && <p>Loading...</p>}
      {pageImgUrl && (
        <img
          src={pageImgUrl}
          onContextMenu={(e) => handleRightClick(e)}
          alt={`Page ${currentPage + 1}`}
        />
      )}
      <div className="canvases">{canvases.map(renderCanvas)}</div>
      <div className="pagination-container">
        <ReactPaginate
          breakLabel="..."
          nextLabel="Next >"
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={totalPages}
          previousLabel="< Prev"
          renderOnZeroPageCount={null}
          forcePage={currentPage}
          containerClassName="pagination"
          activeClassName="active"
        />
      </div>
      {isModalOpen && (
        <div
          className="modal"
          style={{ top: modalPosition.y, left: modalPosition.x }}
        >
          <h3>{modalData.id ? "Edit Canvas" : "Create Canvas"}</h3>
          <label>
            Name:
            <input
              type="text"
              value={modalData.name}
              onChange={(e) =>
                setModalData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </label>
          <label>
            Type:
            <input
              type="text"
              value={modalData.type}
              onChange={(e) =>
                setModalData((prev) => ({ ...prev, type: e.target.value }))
              }
            />
          </label>
          <label>
            Size:
            <input
              type="text"
              value={modalData.size}
              onChange={(e) =>
                setModalData((prev) => ({ ...prev, size: e.target.value }))
              }
            />
          </label>
          <button onClick={handleModalSubmit}>Save</button>
          <button onClick={() => setIsModalOpen(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default App;
