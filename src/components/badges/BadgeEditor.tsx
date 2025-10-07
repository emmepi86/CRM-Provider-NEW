import React, { useState, useRef } from 'react';
import { badgesAPI, BadgeTemplate, BadgeConfig, BadgeElementConfig } from '../../api/badges';
import {
  Save,
  X,
  Type,
  Image as ImageIcon,
  QrCode,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Settings,
  Grid
} from 'lucide-react';

interface BadgeEditorProps {
  eventId: number;
  template: BadgeTemplate | null;
  isCreating: boolean;
  onClose: (saved: boolean) => void;
}

// Available field placeholders
const AVAILABLE_FIELDS = [
  { value: '{nome}', label: 'Nome' },
  { value: '{cognome}', label: 'Cognome' },
  { value: '{titolo}', label: 'Titolo (Dr., Prof., etc.)' },
  { value: '{professione}', label: 'Professione' },
  { value: '{disciplina}', label: 'Disciplina' },
  { value: '{evento_nome}', label: 'Nome Evento' },
  { value: '{evento_date}', label: 'Date Evento' },
  { value: '{evento_luogo}', label: 'Luogo Evento' },
  { value: '{qr_code}', label: 'QR Code' },
];

export const BadgeEditor: React.FC<BadgeEditorProps> = ({
  eventId,
  template,
  isCreating,
  onClose,
}) => {
  const [name, setName] = useState(template?.name || 'Nuovo Template');
  const [description, setDescription] = useState(template?.description || '');
  const [participantType, setParticipantType] = useState(template?.participant_type || 'all');
  const [isDoubleSided, setIsDoubleSided] = useState(template?.is_double_sided || false);
  const [badgesPerPage, setBadgesPerPage] = useState(template?.badges_per_page || 8);
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');

  const [frontConfig, setFrontConfig] = useState<BadgeConfig>(
    template?.front_config || {
      width: 105,
      height: 74,
      unit: 'mm',
      background_color: '#FFFFFF',
      elements: [],
    }
  );

  const [backConfig, setBackConfig] = useState<BadgeConfig>(
    template?.back_config || {
      width: 105,
      height: 74,
      unit: 'mm',
      background_color: '#FFFFFF',
      elements: [],
    }
  );

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [saving, setSaving] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const currentConfig = currentSide === 'front' ? frontConfig : backConfig;
  const setCurrentConfig = currentSide === 'front' ? setFrontConfig : setBackConfig;

  // Add new element to canvas
  const addElement = (type: 'text' | 'image' | 'qrcode' | 'field') => {
    const newElement: BadgeElementConfig = {
      id: `element-${Date.now()}`,
      type,
      x: 10,
      y: 10,
      width: type === 'qrcode' ? 30 : type === 'image' ? 40 : 80,
      height: type === 'qrcode' ? 30 : type === 'image' ? 40 : 20,
      content: type === 'text' ? 'Testo esempio' : type === 'field' ? '{nome}' : '',
      style: {
        fontSize: type === 'text' || type === 'field' ? 14 : undefined,
        fontFamily: 'Arial',
        color: '#000000',
        fontWeight: 'normal',
        textAlign: 'center',
      },
      z_index: currentConfig.elements.length,
    };

    setCurrentConfig({
      ...currentConfig,
      elements: [...currentConfig.elements, newElement],
    });

    setSelectedElement(newElement.id);
  };

  // Delete element
  const deleteElement = (elementId: string) => {
    setCurrentConfig({
      ...currentConfig,
      elements: currentConfig.elements.filter((el) => el.id !== elementId),
    });
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
  };

  // Update element
  const updateElement = (elementId: string, updates: Partial<BadgeElementConfig>) => {
    setCurrentConfig({
      ...currentConfig,
      elements: currentConfig.elements.map((el) =>
        el.id === elementId ? { ...el, ...updates } : el
      ),
    });
  };

  // Duplicate element
  const duplicateElement = (elementId: string) => {
    const element = currentConfig.elements.find((el) => el.id === elementId);
    if (!element) return;

    const duplicate: BadgeElementConfig = {
      ...element,
      id: `element-${Date.now()}`,
      x: element.x + 5,
      y: element.y + 5,
    };

    setCurrentConfig({
      ...currentConfig,
      elements: [...currentConfig.elements, duplicate],
    });
  };

  // Drag element
  const handleElementDragStart = (e: React.DragEvent, elementId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('elementId', elementId);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const elementId = e.dataTransfer.getData('elementId');
    if (!elementId || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * currentConfig.width;
    const y = ((e.clientY - rect.top) / rect.height) * currentConfig.height;

    updateElement(elementId, { x, y });
  };

  // Save template
  const handleSave = async () => {
    try {
      setSaving(true);

      const templateData = {
        event_id: eventId,
        name,
        description,
        participant_type: participantType as any,
        is_double_sided: isDoubleSided,
        front_config: frontConfig,
        back_config: isDoubleSided ? backConfig : undefined,
        badges_per_page: badgesPerPage,
        page_orientation: 'portrait' as const,
      };

      if (isCreating) {
        await badgesAPI.createTemplate(eventId, templateData);
      } else if (template) {
        await badgesAPI.updateTemplate(eventId, template.id, templateData);
      }

      onClose(true);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Errore durante il salvataggio del template');
    } finally {
      setSaving(false);
    }
  };

  const selectedElementData = selectedElement
    ? currentConfig.elements.find((el) => el.id === selectedElement)
    : null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl max-w-7xl mx-auto">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isCreating ? 'Nuovo Template Badge' : 'Modifica Template Badge'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Usa il drag & drop per posizionare gli elementi sul badge
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`px-4 py-2 rounded-lg border ${
                  showGrid ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700'
                }`}
                title="Mostra/nascondi griglia"
              >
                <Grid size={20} />
              </button>

              <button
                onClick={() => onClose(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                disabled={saving}
              >
                <X size={20} />
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={20} />
                {saving ? 'Salvataggio...' : 'Salva Template'}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-12 gap-6 p-6">
            {/* Left Sidebar - Tools */}
            <div className="col-span-3 space-y-6">
              {/* Template Settings */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings size={18} />
                  Impostazioni Template
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Template
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrizione
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo Partecipante
                    </label>
                    <select
                      value={participantType}
                      onChange={(e) => setParticipantType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="all">Tutti</option>
                      <option value="participant">Solo Partecipanti</option>
                      <option value="speaker">Solo Relatori</option>
                      <option value="staff">Solo Staff</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isDoubleSided}
                        onChange={(e) => setIsDoubleSided(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Badge Fronte/Retro
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Badge per Foglio A4
                    </label>
                    <select
                      value={badgesPerPage}
                      onChange={(e) => setBadgesPerPage(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="2">2</option>
                      <option value="4">4</option>
                      <option value="6">6</option>
                      <option value="8">8</option>
                      <option value="10">10</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Side Selector */}
              {isDoubleSided && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Lato Badge</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentSide('front')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                        currentSide === 'front'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300'
                      }`}
                    >
                      <Eye size={16} className="inline mr-1" />
                      Fronte
                    </button>
                    <button
                      onClick={() => setCurrentSide('back')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                        currentSide === 'back'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300'
                      }`}
                    >
                      <EyeOff size={16} className="inline mr-1" />
                      Retro
                    </button>
                  </div>
                </div>
              )}

              {/* Add Elements */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Aggiungi Elemento</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => addElement('text')}
                    className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Type size={18} />
                    Testo
                  </button>
                  <button
                    onClick={() => addElement('field')}
                    className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Campo Dinamico
                  </button>
                  <button
                    onClick={() => addElement('image')}
                    className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ImageIcon size={18} />
                    Immagine/Logo
                  </button>
                  <button
                    onClick={() => addElement('qrcode')}
                    className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <QrCode size={18} />
                    QR Code
                  </button>
                </div>
              </div>
            </div>

            {/* Center - Canvas */}
            <div className="col-span-6">
              <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center min-h-[600px]">
                <div
                  ref={canvasRef}
                  onDragOver={handleCanvasDragOver}
                  onDrop={handleCanvasDrop}
                  className="bg-white shadow-2xl relative overflow-hidden"
                  style={{
                    width: `${currentConfig.width * 4}px`,
                    height: `${currentConfig.height * 4}px`,
                    backgroundColor: currentConfig.background_color,
                    backgroundImage: showGrid
                      ? 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)'
                      : undefined,
                    backgroundSize: showGrid ? '20px 20px' : undefined,
                  }}
                >
                  {/* Render elements */}
                  {currentConfig.elements.map((element) => (
                    <div
                      key={element.id}
                      draggable
                      onDragStart={(e) => handleElementDragStart(e, element.id)}
                      onClick={() => setSelectedElement(element.id)}
                      className={`absolute cursor-move border-2 ${
                        selectedElement === element.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                      } flex items-center justify-center p-2 overflow-hidden`}
                      style={{
                        left: `${(element.x / currentConfig.width) * 100}%`,
                        top: `${(element.y / currentConfig.height) * 100}%`,
                        width: `${(element.width / currentConfig.width) * 100}%`,
                        height: `${(element.height / currentConfig.height) * 100}%`,
                        fontSize: element.style?.fontSize ? `${element.style.fontSize}px` : undefined,
                        fontFamily: element.style?.fontFamily,
                        color: element.style?.color,
                        fontWeight: element.style?.fontWeight,
                        textAlign: element.style?.textAlign as any,
                        zIndex: element.z_index,
                      }}
                    >
                      {element.type === 'text' || element.type === 'field' ? (
                        <span className="text-xs">{element.content}</span>
                      ) : element.type === 'qrcode' ? (
                        <QrCode size={24} className="text-gray-400" />
                      ) : (
                        <ImageIcon size={24} className="text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 text-center text-sm text-gray-600">
                Dimensioni: {currentConfig.width}x{currentConfig.height} {currentConfig.unit} (scala 4:1 per editor)
              </div>
            </div>

            {/* Right Sidebar - Properties */}
            <div className="col-span-3">
              {selectedElementData ? (
                <div className="bg-gray-50 rounded-lg p-4 sticky top-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Proprietà Elemento</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => duplicateElement(selectedElementData.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Duplica"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => deleteElement(selectedElementData.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Elimina"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Position & Size */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">X (mm)</label>
                        <input
                          type="number"
                          value={Math.round(selectedElementData.x)}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, { x: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Y (mm)</label>
                        <input
                          type="number"
                          value={Math.round(selectedElementData.y)}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, { y: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Larghezza (mm)</label>
                        <input
                          type="number"
                          value={Math.round(selectedElementData.width)}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, { width: parseFloat(e.target.value) || 1 })
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Altezza (mm)</label>
                        <input
                          type="number"
                          value={Math.round(selectedElementData.height)}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, { height: parseFloat(e.target.value) || 1 })
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    {(selectedElementData.type === 'text' || selectedElementData.type === 'field') && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {selectedElementData.type === 'field' ? 'Campo' : 'Testo'}
                        </label>
                        {selectedElementData.type === 'field' ? (
                          <select
                            value={selectedElementData.content}
                            onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          >
                            {AVAILABLE_FIELDS.map((field) => (
                              <option key={field.value} value={field.value}>
                                {field.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={selectedElementData.content || ''}
                            onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        )}
                      </div>
                    )}

                    {/* Text Styling */}
                    {(selectedElementData.type === 'text' || selectedElementData.type === 'field') && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Dimensione Font</label>
                          <input
                            type="number"
                            value={selectedElementData.style?.fontSize || 14}
                            onChange={(e) =>
                              updateElement(selectedElementData.id, {
                                style: { ...selectedElementData.style, fontSize: parseInt(e.target.value) || 14 },
                              })
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Colore</label>
                          <input
                            type="color"
                            value={selectedElementData.style?.color || '#000000'}
                            onChange={(e) =>
                              updateElement(selectedElementData.id, {
                                style: { ...selectedElementData.style, color: e.target.value },
                              })
                            }
                            className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Font</label>
                          <select
                            value={selectedElementData.style?.fontFamily || 'Arial'}
                            onChange={(e) =>
                              updateElement(selectedElementData.id, {
                                style: { ...selectedElementData.style, fontFamily: e.target.value },
                              })
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          >
                            <option value="Arial">Arial</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Georgia">Georgia</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Peso</label>
                          <select
                            value={selectedElementData.style?.fontWeight || 'normal'}
                            onChange={(e) =>
                              updateElement(selectedElementData.id, {
                                style: { ...selectedElementData.style, fontWeight: e.target.value },
                              })
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          >
                            <option value="normal">Normale</option>
                            <option value="bold">Grassetto</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Allineamento</label>
                          <select
                            value={selectedElementData.style?.textAlign || 'center'}
                            onChange={(e) =>
                              updateElement(selectedElementData.id, {
                                style: { ...selectedElementData.style, textAlign: e.target.value },
                              })
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          >
                            <option value="left">Sinistra</option>
                            <option value="center">Centro</option>
                            <option value="right">Destra</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                  <p className="text-sm">Seleziona un elemento per modificarne le proprietà</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
