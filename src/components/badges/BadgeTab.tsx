import React, { useEffect, useState } from 'react';
import { badgesAPI, BadgeTemplate } from '../../api/badges';
import {
  Clipboard,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  Copy,
  Eye,
  FileText
} from 'lucide-react';
import { BadgeEditor } from './BadgeEditor';
import { BadgeGenerator } from './BadgeGenerator';

interface BadgeTabProps {
  eventId: number;
  deliveryMode: string;
}

export const BadgeTab: React.FC<BadgeTabProps> = ({ eventId, deliveryMode }) => {
  const [templates, setTemplates] = useState<BadgeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<BadgeTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Check if badges are available for this event
  const badgesAvailable = deliveryMode === 'RESIDENTIAL' || deliveryMode === 'HYBRID';

  useEffect(() => {
    if (badgesAvailable) {
      loadTemplates();
    }
  }, [eventId, badgesAvailable]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await badgesAPI.getTemplates(eventId);
      setTemplates(data.templates);
    } catch (error) {
      console.error('Error loading badge templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setIsCreating(true);
    setSelectedTemplate(null);
    setShowEditor(true);
  };

  const handleEditTemplate = (template: BadgeTemplate) => {
    setIsCreating(false);
    setSelectedTemplate(template);
    setShowEditor(true);
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo template?')) {
      return;
    }

    try {
      await badgesAPI.deleteTemplate(eventId, templateId);
      await loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Errore durante l\'eliminazione del template');
    }
  };

  const handleDuplicateTemplate = async (template: BadgeTemplate) => {
    try {
      const newTemplate = {
        event_id: eventId,
        name: `${template.name} (Copia)`,
        description: template.description,
        participant_type: template.participant_type,
        is_double_sided: template.is_double_sided,
        front_config: template.front_config,
        back_config: template.back_config,
        badges_per_page: template.badges_per_page,
        page_orientation: template.page_orientation,
      };

      await badgesAPI.createTemplate(eventId, newTemplate);
      await loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert('Errore durante la duplicazione del template');
    }
  };

  const handleExportTemplate = async (template: BadgeTemplate) => {
    try {
      const blob = await badgesAPI.exportTemplate(eventId, template.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `badge_template_${template.name.replace(/\s/g, '_')}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting template:', error);
      alert('Errore durante l\'esportazione del template');
    }
  };

  const handleImportTemplate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const name = prompt('Nome per il template importato:', data.template?.name || 'Template Importato');
      if (!name) return;

      await badgesAPI.importTemplate(eventId, data, name);
      await loadTemplates();
    } catch (error) {
      console.error('Error importing template:', error);
      alert('Errore durante l\'importazione del template. Verifica che il file sia valido.');
    }

    // Reset input
    event.target.value = '';
  };

  const handleEditorClose = async (saved: boolean) => {
    setShowEditor(false);
    setSelectedTemplate(null);
    if (saved) {
      await loadTemplates();
    }
  };

  const handleGeneratorClose = () => {
    setShowGenerator(false);
    setSelectedTemplate(null);
  };

  const handleGenerateBadges = (template: BadgeTemplate) => {
    setSelectedTemplate(template);
    setShowGenerator(true);
  };

  if (!badgesAvailable) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <Clipboard size={48} className="mx-auto text-yellow-600 mb-4" />
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">
          Badge non disponibili per eventi FAD
        </h3>
        <p className="text-yellow-700">
          I badge fisici sono disponibili solo per eventi residenziali o misti
        </p>
      </div>
    );
  }

  if (showEditor) {
    return (
      <BadgeEditor
        eventId={eventId}
        template={selectedTemplate}
        isCreating={isCreating}
        onClose={handleEditorClose}
      />
    );
  }

  if (showGenerator && selectedTemplate) {
    return (
      <BadgeGenerator
        eventId={eventId}
        template={selectedTemplate}
        onClose={handleGeneratorClose}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clipboard size={28} />
            Badge Evento
          </h2>
          <p className="text-gray-600 mt-1">
            Crea e gestisci i template per i badge dei partecipanti
          </p>
        </div>

        <div className="flex gap-3">
          <label className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-2">
            <Upload size={20} />
            Importa Template
            <input
              type="file"
              accept=".json"
              onChange={handleImportTemplate}
              className="hidden"
            />
          </label>

          <button
            onClick={handleCreateTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Nuovo Template
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Clipboard size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Nessun template badge
          </h3>
          <p className="text-gray-600 mb-6">
            Crea il tuo primo template per generare badge personalizzati
          </p>
          <button
            onClick={handleCreateTemplate}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Crea Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              {/* Template Preview - placeholder */}
              <div className="bg-gray-100 rounded-lg h-48 mb-4 flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <FileText size={48} className="mx-auto text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">
                    {template.front_config.width}x{template.front_config.height} {template.front_config.unit}
                  </span>
                </div>
              </div>

              {/* Template Info */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {template.name}
              </h3>
              {template.description && (
                <p className="text-sm text-gray-600 mb-3">
                  {template.description}
                </p>
              )}

              {/* Template Details */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {template.participant_type === 'all' ? 'Tutti' :
                   template.participant_type === 'participant' ? 'Partecipanti' :
                   template.participant_type === 'speaker' ? 'Relatori' : 'Staff'}
                </span>
                {template.is_double_sided && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                    Fronte/Retro
                  </span>
                )}
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                  {template.badges_per_page} per foglio
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleGenerateBadges(template)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-1 text-sm"
                  title="Genera badge"
                >
                  <Eye size={16} />
                  Genera
                </button>

                <button
                  onClick={() => handleEditTemplate(template)}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  title="Modifica"
                >
                  <Edit2 size={16} />
                </button>

                <button
                  onClick={() => handleDuplicateTemplate(template)}
                  className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  title="Duplica"
                >
                  <Copy size={16} />
                </button>

                <button
                  onClick={() => handleExportTemplate(template)}
                  className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  title="Esporta"
                >
                  <Download size={16} />
                </button>

                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  title="Elimina"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
