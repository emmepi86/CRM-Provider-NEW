import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import mammoth from 'mammoth';
import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { X, Save, Download, Maximize2, Minimize2 } from 'lucide-react';
import { TinyMCEEditor } from '../common/TinyMCEEditor';

interface TextEditorModalProps {
  fileName?: string;
  initialContent?: string;
  existingDocxUrl?: string;
  onClose: () => void;
  onSave: (file: File, fileName: string) => Promise<void>;
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
  const [content, setContent] = useState<string>(initialContent);
  const [saving, setSaving] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [loading, setLoading] = useState(!!existingDocxUrl);

  // Load existing DOCX file if provided
  useEffect(() => {
    if (existingDocxUrl) {
      loadDocxFile(existingDocxUrl);
    }
  }, [existingDocxUrl]);

  const loadDocxFile = async (url: string) => {
    try {
      setLoading(true);
      const response = await fetch(`https://crm.digitalhealth.sm${url}`);
      const arrayBuffer = await response.arrayBuffer();

      const result = await mammoth.convertToHtml({ arrayBuffer });
      setContent(result.value);

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

  const htmlToDocxParagraphs = (html: string): Paragraph[] => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const paragraphs: Paragraph[] = [];
    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun(text)],
            })
          );
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();

        if (tagName === 'h1') {
          paragraphs.push(
            new Paragraph({
              text: element.textContent || '',
              heading: HeadingLevel.HEADING_1,
            })
          );
        } else if (tagName === 'h2') {
          paragraphs.push(
            new Paragraph({
              text: element.textContent || '',
              heading: HeadingLevel.HEADING_2,
            })
          );
        } else if (tagName === 'h3') {
          paragraphs.push(
            new Paragraph({
              text: element.textContent || '',
              heading: HeadingLevel.HEADING_3,
            })
          );
        } else if (tagName === 'p') {
          const children: TextRun[] = [];
          element.childNodes.forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
              children.push(new TextRun(child.textContent || ''));
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              const childElement = child as HTMLElement;
              const childTag = childElement.tagName.toLowerCase();
              const text = childElement.textContent || '';

              if (childTag === 'strong' || childTag === 'b') {
                children.push(new TextRun({ text, bold: true }));
              } else if (childTag === 'em' || childTag === 'i') {
                children.push(new TextRun({ text, italics: true }));
              } else if (childTag === 'u') {
                children.push(new TextRun({ text, underline: {} }));
              } else {
                children.push(new TextRun(text));
              }
            }
          });
          paragraphs.push(new Paragraph({ children }));
        } else if (tagName === 'ul' || tagName === 'ol') {
          element.querySelectorAll('li').forEach((li) => {
            paragraphs.push(
              new Paragraph({
                text: li.textContent || '',
                bullet: tagName === 'ul' ? { level: 0 } : undefined,
                numbering: tagName === 'ol' ? { reference: 'default', level: 0 } : undefined,
              })
            );
          });
        } else if (tagName === 'br') {
          paragraphs.push(new Paragraph({ children: [new TextRun('')] }));
        } else {
          element.childNodes.forEach(processNode);
        }
      }
    };

    tempDiv.childNodes.forEach(processNode);

    if (paragraphs.length === 0) {
      paragraphs.push(new Paragraph({ children: [new TextRun('')] }));
    }

    return paragraphs;
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!fileName.endsWith('.docx')) {
        alert('Il nome del file deve terminare con .docx');
        return;
      }

      const paragraphs = htmlToDocxParagraphs(content);

      const doc = new DocxDocument({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const file = new File([blob], fileName, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      await onSave(file, fileName);
      onClose();
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      alert('Errore durante il salvataggio del documento');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      const paragraphs = htmlToDocxParagraphs(content);

      const doc = new DocxDocument({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Errore durante il download:', error);
      alert('Errore durante il download del documento');
    }
  };

  const modalStyle = isMaximized
    ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
      }
    : undefined;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
      {isMaximized ? (
        <div style={modalStyle} className="bg-white flex flex-col">
          <EditorHeader
            fileName={fileName}
            setFileName={setFileName}
            isMaximized={isMaximized}
            setIsMaximized={setIsMaximized}
            onClose={onClose}
            onSave={handleSave}
            onDownload={handleDownload}
            saving={saving}
            loading={loading}
          />
          <div className="flex-1 overflow-hidden">
            <TinyMCEEditor
              value={content}
              onChange={setContent}
              height={window.innerHeight - 120}
              placeholder="Inizia a scrivere il tuo documento..."
              mode="document"
              disabled={loading}
            />
          </div>
        </div>
      ) : (
        <Rnd
          default={{
            x: window.innerWidth / 2 - 400,
            y: window.innerHeight / 2 - 300,
            width: 800,
            height: 600,
          }}
          minWidth={600}
          minHeight={400}
          bounds="window"
          dragHandleClassName="drag-handle"
        >
          <div className="bg-white rounded-lg shadow-2xl h-full flex flex-col">
            <EditorHeader
              fileName={fileName}
              setFileName={setFileName}
              isMaximized={isMaximized}
              setIsMaximized={setIsMaximized}
              onClose={onClose}
              onSave={handleSave}
              onDownload={handleDownload}
              saving={saving}
              loading={loading}
            />
            <div className="flex-1 overflow-hidden">
              <TinyMCEEditor
                value={content}
                onChange={setContent}
                height={520}
                placeholder="Inizia a scrivere il tuo documento..."
                mode="document"
                disabled={loading}
              />
            </div>
          </div>
        </Rnd>
      )}
    </div>
  );
};

interface EditorHeaderProps {
  fileName: string;
  setFileName: (name: string) => void;
  isMaximized: boolean;
  setIsMaximized: (maximized: boolean) => void;
  onClose: () => void;
  onSave: () => void;
  onDownload: () => void;
  saving: boolean;
  loading: boolean;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  fileName,
  setFileName,
  isMaximized,
  setIsMaximized,
  onClose,
  onSave,
  onDownload,
  saving,
  loading,
}) => {
  return (
    <div className="drag-handle border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between cursor-move rounded-t-lg">
      <div className="flex items-center space-x-3 flex-1">
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
          placeholder="nome-documento.docx"
        />
        {loading && <span className="text-xs text-gray-500">Caricamento...</span>}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onDownload}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          title="Download DOCX"
        >
          <Download size={18} />
        </button>
        <button
          onClick={() => setIsMaximized(!isMaximized)}
          className="p-2 hover:bg-gray-100 rounded-lg"
          title={isMaximized ? 'Ripristina' : 'Massimizza'}
        >
          {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
        <button
          onClick={onSave}
          disabled={saving || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Save size={18} />
          <span>{saving ? 'Salvataggio...' : 'Salva'}</span>
        </button>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg"
          title="Chiudi"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
