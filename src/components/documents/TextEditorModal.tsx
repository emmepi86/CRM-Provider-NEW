import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import mammoth from 'mammoth';
import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import {
  X,
  Save,
  Download,
  Maximize2,
  Minimize2,
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';

interface TextEditorModalProps {
  fileName?: string;
  initialContent?: string;
  existingDocxUrl?: string; // URL of existing DOCX file to edit
  onClose: () => void;
  onSave: (file: File, fileName: string) => Promise<void>; // Changed to pass File instead of string
}

export const TextEditorModal: React.FC<TextEditorModalProps> = ({
  fileName: initialFileName,
  initialContent = '',
  existingDocxUrl,
  onClose,
  onSave,
}) => {
  const [fileName, setFileName] = useState<string>(
    initialFileName || 'nuovo-documento.docx'
  );
  const [saving, setSaving] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [loading, setLoading] = useState(!!existingDocxUrl);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[500px] p-4',
      },
    },
  });

  // Load existing DOCX file if provided
  useEffect(() => {
    if (existingDocxUrl && editor) {
      loadDocxFile(existingDocxUrl);
    }
  }, [existingDocxUrl, editor]);

  const loadDocxFile = async (url: string) => {
    try {
      setLoading(true);
      const response = await fetch(`https://crm.digitalhealth.sm${url}`);
      const arrayBuffer = await response.arrayBuffer();

      const result = await mammoth.convertToHtml({ arrayBuffer });
      editor?.commands.setContent(result.value);

      console.log('DOCX caricato con successo');
      if (result.messages.length > 0) {
        console.warn('Messaggi conversione DOCX:', result.messages);
      }
    } catch (error) {
      console.error('Errore caricamento DOCX:', error);
      alert('Errore nel caricamento del documento');
    } finally {
      setLoading(false);
    }
  };

  const htmlToDocx = async (html: string): Promise<Blob> => {
    // Simple HTML to DOCX conversion
    // Parse HTML and convert to DOCX paragraphs
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const paragraphs: Paragraph[] = [];

    // Process each element
    const processNode = (node: Node): TextRun[] => {
      const runs: TextRun[] = [];

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          runs.push(new TextRun({ text }));
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const text = element.textContent?.trim() || '';

        if (!text) return runs;

        const isBold = element.tagName === 'STRONG' || element.tagName === 'B';
        const isItalic = element.tagName === 'EM' || element.tagName === 'I';
        const isCode = element.tagName === 'CODE';

        runs.push(new TextRun({
          text,
          bold: isBold,
          italics: isItalic,
          font: isCode ? 'Courier New' : undefined,
        }));
      }

      return runs;
    };

    // Process paragraphs and headings
    doc.body.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const text = element.textContent?.trim() || '';

        if (!text) return;

        if (element.tagName === 'P') {
          const runs: TextRun[] = [];
          element.childNodes.forEach((child) => {
            runs.push(...processNode(child));
          });

          if (runs.length === 0) {
            runs.push(new TextRun({ text }));
          }

          paragraphs.push(new Paragraph({ children: runs }));
        } else if (element.tagName.match(/^H[1-6]$/)) {
          const level = parseInt(element.tagName[1]);
          const headingLevel = [
            HeadingLevel.HEADING_1,
            HeadingLevel.HEADING_2,
            HeadingLevel.HEADING_3,
            HeadingLevel.HEADING_4,
            HeadingLevel.HEADING_5,
            HeadingLevel.HEADING_6,
          ][level - 1];

          paragraphs.push(
            new Paragraph({
              text,
              heading: headingLevel,
            })
          );
        } else if (element.tagName === 'LI') {
          paragraphs.push(
            new Paragraph({
              text,
              bullet: { level: 0 },
            })
          );
        } else {
          // Fallback for other elements
          paragraphs.push(new Paragraph({ text }));
        }
      }
    });

    // Create DOCX document
    const docx = new DocxDocument({
      sections: [
        {
          properties: {},
          children: paragraphs.length > 0 ? paragraphs : [new Paragraph({ text: ' ' })],
        },
      ],
    });

    // Generate blob
    const blob = await Packer.toBlob(docx);
    return blob;
  };

  const handleSave = async () => {
    if (!fileName.trim()) {
      alert('Inserisci un nome per il file');
      return;
    }

    if (!editor) return;

    try {
      setSaving(true);
      const htmlContent = editor.getHTML();
      const docxBlob = await htmlToDocx(htmlContent);

      // Ensure .docx extension
      const finalFileName = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;

      // Convert blob to File
      const file = new File([docxBlob], finalFileName, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      await onSave(file, finalFileName);
      onClose();
    } catch (error) {
      console.error('Errore salvataggio documento:', error);
      alert('Errore durante il salvataggio del documento');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!editor) return;

    try {
      const htmlContent = editor.getHTML();
      const docxBlob = await htmlToDocx(htmlContent);
      const url = URL.createObjectURL(docxBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Errore download documento:', error);
      alert('Errore durante il download del documento');
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const modalStyle = isMaximized
    ? { width: '100vw', height: '100vh', x: 0, y: 0 }
    : { width: 1000, height: 700, x: (window.innerWidth - 1000) / 2, y: 50 };

  if (!editor || loading) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-2xl">
            <div className="text-gray-700">Caricamento documento...</div>
          </div>
        </div>
      </>
    );
  }

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
        minWidth={700}
        minHeight={500}
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
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 max-w-md"
                placeholder="Nome file..."
              />
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
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-2 rounded hover:bg-gray-200 ${
                    editor.isActive('bold') ? 'bg-gray-300' : ''
                  }`}
                  title="Grassetto"
                >
                  <Bold size={16} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-2 rounded hover:bg-gray-200 ${
                    editor.isActive('italic') ? 'bg-gray-300' : ''
                  }`}
                  title="Corsivo"
                >
                  <Italic size={16} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={`p-2 rounded hover:bg-gray-200 ${
                    editor.isActive('strike') ? 'bg-gray-300' : ''
                  }`}
                  title="Barrato"
                >
                  <Strikethrough size={16} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={`p-2 rounded hover:bg-gray-200 ${
                    editor.isActive('code') ? 'bg-gray-300' : ''
                  }`}
                  title="Codice"
                >
                  <Code size={16} />
                </button>

                <div className="w-px h-6 bg-gray-400 mx-2" />

                <button
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`p-2 rounded hover:bg-gray-200 ${
                    editor.isActive('bulletList') ? 'bg-gray-300' : ''
                  }`}
                  title="Lista puntata"
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={`p-2 rounded hover:bg-gray-200 ${
                    editor.isActive('orderedList') ? 'bg-gray-300' : ''
                  }`}
                  title="Lista numerata"
                >
                  <ListOrdered size={16} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={`p-2 rounded hover:bg-gray-200 ${
                    editor.isActive('blockquote') ? 'bg-gray-300' : ''
                  }`}
                  title="Citazione"
                >
                  <Quote size={16} />
                </button>

                <div className="w-px h-6 bg-gray-400 mx-2" />

                <button
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Annulla"
                >
                  <Undo size={16} />
                </button>
                <button
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Ripeti"
                >
                  <Redo size={16} />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  title="Download HTML"
                >
                  <Download size={16} />
                  <span className="text-sm">Download</span>
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving || !fileName.trim()}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  title="Salva"
                >
                  <Save size={16} />
                  <span className="text-sm">{saving ? 'Salvataggio...' : 'Salva'}</span>
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-600">
              {editor.storage.characterCount?.characters() || editor.getText().length} caratteri
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-auto bg-white">
            <EditorContent editor={editor} />
          </div>
        </div>
      </Rnd>

      <style>{`
        .ProseMirror {
          min-height: 500px;
          padding: 1rem;
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror p {
          margin: 0.5rem 0;
        }
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 1rem 0;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75rem 0;
        }
        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5rem 0;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 2rem;
          margin: 0.5rem 0;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #6b7280;
        }
        .ProseMirror code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.9em;
        }
        .ProseMirror pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        .ProseMirror pre code {
          background-color: transparent;
          padding: 0;
          color: inherit;
        }
      `}</style>
    </>
  );
};
