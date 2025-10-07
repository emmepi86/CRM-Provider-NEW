import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download, Maximize2, Minimize2 } from 'lucide-react';

// Configure PDF.js worker - use local file to avoid CORS issues
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface DocumentViewerModalProps {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  fileUrl,
  fileName,
  onClose,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isMaximized, setIsMaximized] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(true);

  // Fetch PDF as blob to avoid CORS and header issues
  React.useEffect(() => {
    const fetchPdf = async () => {
      try {
        setLoadingPdf(true);
        const response = await fetch(`https://crm.digitalhealth.sm${fileUrl}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        setPdfBlob(blob);
      } catch (error) {
        console.error('Errore download PDF:', error);
      } finally {
        setLoadingPdf(false);
      }
    };

    fetchPdf();
  }, [fileUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    console.log('PDF caricato con successo, numero pagine:', numPages);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Errore caricamento PDF:', error);
    console.error('URL tentato:', `https://crm.digitalhealth.sm${fileUrl}`);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handlePrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `https://crm.digitalhealth.sm${fileUrl}`;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const modalStyle = isMaximized
    ? { width: '100vw', height: '100vh', x: 0, y: 0 }
    : { width: 900, height: 700, x: (window.innerWidth - 900) / 2, y: 50 };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

      {/* Draggable Modal */}
      <Rnd
        default={{
          x: modalStyle.x,
          y: modalStyle.y,
          width: modalStyle.width,
          height: modalStyle.height,
        }}
        minWidth={600}
        minHeight={400}
        bounds="window"
        dragHandleClassName="drag-handle"
        className="z-50"
        disableDragging={isMaximized}
        enableResizing={!isMaximized}
        size={isMaximized ? { width: '100vw', height: '100vh' } : undefined}
        position={isMaximized ? { x: 0, y: 0 } : undefined}
      >
        <div className="flex flex-col h-full bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header - Draggable */}
          <div className="drag-handle bg-gray-800 text-white px-4 py-3 flex items-center justify-between cursor-move">
            <div className="flex items-center space-x-3 flex-1">
              <span className="font-medium truncate">{fileName}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMaximize}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                title={isMaximized ? 'Ripristina' : 'Massimizza'}
              >
                {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                title="Chiudi"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={pageNumber <= 1}
                className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Pagina precedente"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-sm text-gray-700 px-3">
                Pagina {pageNumber} di {numPages || '...'}
              </span>

              <button
                onClick={handleNextPage}
                disabled={pageNumber >= numPages}
                className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Pagina successiva"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom out"
              >
                <ZoomOut size={18} />
              </button>

              <span className="text-sm text-gray-700 px-3 min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>

              <button
                onClick={handleZoomIn}
                disabled={scale >= 3.0}
                className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom in"
              >
                <ZoomIn size={18} />
              </button>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              <button
                onClick={handleDownload}
                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                title="Download"
              >
                <Download size={18} />
              </button>
            </div>
          </div>

          {/* PDF Content */}
          <div className="flex-1 overflow-auto bg-gray-200 flex items-center justify-center p-4">
            {loadingPdf ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-gray-500">Download PDF in corso...</div>
              </div>
            ) : pdfBlob ? (
              <Document
                file={pdfBlob}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <div className="text-gray-500">Rendering PDF...</div>
                  </div>
                }
                error={
                  <div className="flex flex-col items-center justify-center p-8">
                    <div className="text-red-500 mb-2">Errore nel caricamento del PDF</div>
                    <div className="text-sm text-gray-600">Controlla la console per dettagli</div>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            ) : (
              <div className="flex flex-col items-center justify-center p-8">
                <div className="text-red-500 mb-2">Impossibile caricare il PDF</div>
                <div className="text-sm text-gray-600">Controlla la console per dettagli</div>
              </div>
            )}
          </div>
        </div>
      </Rnd>
    </>
  );
};
