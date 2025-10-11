import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Edit,
  Check,
  X,
  GitBranch
} from 'lucide-react';
import type { FormFieldCreateData } from '../../api/landingPagesAdmin';

interface FormFieldsEditorProps {
  formFields: FormFieldCreateData[];
  setFormFields: (fields: FormFieldCreateData[]) => void;
}

export const FormFieldsEditor: React.FC<FormFieldsEditorProps> = ({
  formFields,
  setFormFields
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<FormFieldCreateData | null>(null);

  const fieldTypes = [
    { value: 'text', label: 'Testo breve' },
    { value: 'textarea', label: 'Testo lungo' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Telefono' },
    { value: 'number', label: 'Numero' },
    { value: 'date', label: 'Data' },
    { value: 'select', label: 'Menu a tendina' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio button' },
    { value: 'file_upload', label: 'Upload file' }
  ];

  const participantMappings = [
    { value: '', label: 'Nessun mapping' },
    { value: 'email', label: 'Email' },
    { value: 'first_name', label: 'Nome' },
    { value: 'last_name', label: 'Cognome' },
    { value: 'phone', label: 'Telefono' },
    { value: 'fiscal_code', label: 'Codice Fiscale' },
    { value: 'profession', label: 'Professione' },
    { value: 'address', label: 'Indirizzo' },
    { value: 'city', label: 'Città' },
    { value: 'province', label: 'Provincia' },
    { value: 'zip', label: 'CAP' },
    { value: 'workplace_name', label: 'Ente/Azienda' }
  ];

  const addField = () => {
    const newField: FormFieldCreateData = {
      field_type: 'text',
      field_name: `field_${Date.now()}`,
      label: 'Nuovo Campo',
      required: false,
      order_index: formFields.length + 1,
      validation_rules: {},
      options: [],
      conditional_display: {}
    };
    setFormFields([...formFields, newField]);
    setEditingIndex(formFields.length);
    setEditingField(newField);
  };

  const removeField = (index: number) => {
    if (window.confirm('Sei sicuro di voler eliminare questo campo?')) {
      const updated = formFields.filter((_, i) => i !== index);
      // Ricalcola order_index
      updated.forEach((f, i) => f.order_index = i + 1);
      setFormFields(updated);
    }
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formFields.length) return;

    const updated = [...formFields];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    // Ricalcola order_index
    updated.forEach((f, i) => f.order_index = i + 1);
    setFormFields(updated);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditingField({ ...formFields[index] });
  };

  const saveEdit = () => {
    if (editingIndex !== null && editingField) {
      const updated = [...formFields];
      updated[editingIndex] = editingField;
      setFormFields(updated);
      setEditingIndex(null);
      setEditingField(null);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingField(null);
  };

  const addOption = () => {
    if (editingField) {
      setEditingField({
        ...editingField,
        options: [
          ...(editingField.options || []),
          { value: '', label: '' }
        ]
      });
    }
  };

  const updateOption = (index: number, key: 'value' | 'label', value: string) => {
    if (editingField) {
      const updated = [...(editingField.options || [])];
      updated[index] = { ...updated[index], [key]: value };
      setEditingField({ ...editingField, options: updated });
    }
  };

  const removeOption = (index: number) => {
    if (editingField) {
      const updated = (editingField.options || []).filter((_, i) => i !== index);
      setEditingField({ ...editingField, options: updated });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Form Builder</h3>
          <p className="text-sm text-gray-600 mt-1">
            Aggiungi e configura i campi del form di iscrizione
          </p>
        </div>
        <button
          onClick={addField}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Aggiungi Campo</span>
        </button>
      </div>

      {/* Fields List */}
      {formFields.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-600 mb-4">Nessun campo nel form</p>
          <button
            onClick={addField}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi Primo Campo</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {formFields.map((field, index) => (
            <div
              key={index}
              className={`border rounded-lg transition-colors ${
                editingIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
            >
              {/* Field Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => moveField(index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveField(index, 'down')}
                      disabled={index === formFields.length - 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{field.label}</div>
                    <div className="text-sm text-gray-500 space-x-2">
                      <span>{fieldTypes.find(t => t.value === field.field_type)?.label}</span>
                      {field.required && <span className="text-red-600">• Obbligatorio</span>}
                      {field.maps_to_participant_field && (
                        <span className="text-blue-600">
                          • Maps to: {participantMappings.find(m => m.value === field.maps_to_participant_field)?.label}
                        </span>
                      )}
                      {field.conditional_display?.field_name && (
                        <span className="text-purple-600 inline-flex items-center">
                          • <GitBranch className="w-3 h-3 mx-1" /> Condizionale
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {editingIndex === index ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Salva"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Annulla"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(index)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Modifica"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeField(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Elimina"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Edit Panel */}
              {editingIndex === index && editingField && (
                <div className="border-t border-blue-200 p-4 space-y-4 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo Campo *
                      </label>
                      <select
                        value={editingField.field_type}
                        onChange={(e) => setEditingField({
                          ...editingField,
                          field_type: e.target.value as any
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        {fieldTypes.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Campo *
                      </label>
                      <input
                        type="text"
                        value={editingField.field_name}
                        onChange={(e) => setEditingField({
                          ...editingField,
                          field_name: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Label *
                    </label>
                    <input
                      type="text"
                      value={editingField.label}
                      onChange={(e) => setEditingField({
                        ...editingField,
                        label: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={editingField.placeholder || ''}
                      onChange={(e) => setEditingField({
                        ...editingField,
                        placeholder: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Help Text
                    </label>
                    <input
                      type="text"
                      value={editingField.help_text || ''}
                      onChange={(e) => setEditingField({
                        ...editingField,
                        help_text: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mapping Participant Field
                    </label>
                    <select
                      value={editingField.maps_to_participant_field || ''}
                      onChange={(e) => setEditingField({
                        ...editingField,
                        maps_to_participant_field: e.target.value || undefined
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {participantMappings.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Collega questo campo a un campo del partecipante per il merge automatico
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="required"
                      checked={editingField.required}
                      onChange={(e) => setEditingField({
                        ...editingField,
                        required: e.target.checked
                      })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="required" className="text-sm font-medium text-gray-700">
                      Campo Obbligatorio
                    </label>
                  </div>

                  {/* Conditional Display */}
                  <div className="border-t border-gray-200 pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visualizzazione Condizionale
                    </label>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Mostra se campo
                          </label>
                          <select
                            value={editingField.conditional_display?.field_name || ''}
                            onChange={(e) => setEditingField({
                              ...editingField,
                              conditional_display: e.target.value ? {
                                field_name: e.target.value,
                                operator: editingField.conditional_display?.operator || 'equals',
                                value: editingField.conditional_display?.value || ''
                              } : undefined
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">Nessuna condizione</option>
                            {formFields
                              .filter((f, idx) => idx !== editingIndex)
                              .map((f) => (
                                <option key={f.field_name} value={f.field_name}>
                                  {f.label}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Operatore
                          </label>
                          <select
                            value={editingField.conditional_display?.operator || 'equals'}
                            onChange={(e) => setEditingField({
                              ...editingField,
                              conditional_display: editingField.conditional_display ? {
                                ...editingField.conditional_display,
                                operator: e.target.value
                              } : undefined
                            })}
                            disabled={!editingField.conditional_display?.field_name}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                          >
                            <option value="equals">Uguale a</option>
                            <option value="not_equals">Diverso da</option>
                            <option value="contains">Contiene</option>
                            <option value="is_checked">È selezionato</option>
                            <option value="is_not_checked">Non è selezionato</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Valore
                          </label>
                          <input
                            type="text"
                            value={editingField.conditional_display?.value || ''}
                            onChange={(e) => setEditingField({
                              ...editingField,
                              conditional_display: editingField.conditional_display ? {
                                ...editingField.conditional_display,
                                value: e.target.value
                              } : undefined
                            })}
                            disabled={
                              !editingField.conditional_display?.field_name ||
                              editingField.conditional_display?.operator === 'is_checked' ||
                              editingField.conditional_display?.operator === 'is_not_checked'
                            }
                            placeholder="valore"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Questo campo sarà visibile solo se la condizione specificata è soddisfatta.
                      </p>
                    </div>
                  </div>

                  {/* Options for select/radio */}
                  {(editingField.field_type === 'select' || editingField.field_type === 'radio') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opzioni
                      </label>
                      <div className="space-y-2">
                        {(editingField.options || []).map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={option.value}
                              onChange={(e) => updateOption(optIndex, 'value', e.target.value)}
                              placeholder="Valore"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <input
                              type="text"
                              value={option.label}
                              onChange={(e) => updateOption(optIndex, 'label', e.target.value)}
                              placeholder="Label"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <button
                              onClick={() => removeOption(optIndex)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={addOption}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          + Aggiungi Opzione
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
