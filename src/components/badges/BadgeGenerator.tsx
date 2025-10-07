import React, { useState, useEffect } from 'react';
import { badgesAPI, BadgeTemplate } from '../../api/badges';
import { enrollmentsAPI } from '../../api/enrollments';
import { Enrollment } from '../../types';
import { X, Download, Users, CheckSquare, Square, Search } from 'lucide-react';

interface BadgeGeneratorProps {
  eventId: number;
  template: BadgeTemplate;
  onClose: () => void;
}

export const BadgeGenerator: React.FC<BadgeGeneratorProps> = ({ eventId, template, onClose }) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [includeSpeakers, setIncludeSpeakers] = useState(false);

  useEffect(() => {
    loadEnrollments();
  }, [eventId]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const data = await enrollmentsAPI.listByEvent(eventId);
      setEnrollments(data.items || []);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    if (!enrollment.participant) return false;
    const fullName = `${enrollment.participant.first_name} ${enrollment.participant.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const toggleSelection = (enrollmentId: number) => {
    setSelectedIds((prev) =>
      prev.includes(enrollmentId) ? prev.filter((id) => id !== enrollmentId) : [...prev, enrollmentId]
    );
  };

  const selectAll = () => {
    setSelectedIds(filteredEnrollments.map((e) => e.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const selectConfirmed = () => {
    setSelectedIds(
      filteredEnrollments.filter((e) => e.status === 'confirmed').map((e) => e.id)
    );
  };

  const handleGenerate = async () => {
    if (selectedIds.length === 0) {
      alert('Seleziona almeno un partecipante');
      return;
    }

    try {
      setGenerating(true);

      // Note: This will fail until PDF generation is implemented on backend
      const blob = await badgesAPI.generateBadges(eventId, {
        template_id: template.id,
        participant_ids: selectedIds,
        include_speakers: includeSpeakers,
        format: 'pdf',
        double_sided: template.is_double_sided,
      });

      // Download the generated PDF
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `badges_${template.name.replace(/\s/g, '_')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (error: any) {
      console.error('Error generating badges:', error);
      if (error.response?.status === 501) {
        alert('La generazione PDF dei badge sarà disponibile a breve!');
      } else {
        alert('Errore durante la generazione dei badge');
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-700 mt-4">Caricamento partecipanti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl mx-auto">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users size={28} />
                Genera Badge
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Template: <strong>{template.name}</strong>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <X size={20} />
              </button>

              <button
                onClick={handleGenerate}
                disabled={generating || selectedIds.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Download size={20} />
                {generating ? 'Generazione...' : `Genera PDF (${selectedIds.length})`}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Options */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Opzioni</h3>

              <div className="flex items-center gap-2 mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeSpeakers}
                    onChange={(e) => setIncludeSpeakers(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Includi badge per relatori</span>
                </label>
              </div>

              <div className="text-sm text-gray-600">
                {template.is_double_sided ? (
                  <p>✓ Badge fronte/retro</p>
                ) : (
                  <p>• Badge solo fronte</p>
                )}
                <p>• {template.badges_per_page} badge per foglio A4</p>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cerca partecipante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <button
                onClick={selectAll}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
              >
                Seleziona tutti
              </button>

              <button
                onClick={selectConfirmed}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
              >
                Solo confermati
              </button>

              <button
                onClick={deselectAll}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                Deseleziona tutti
              </button>
            </div>

            {/* Participants List */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 text-sm">
                Partecipanti ({filteredEnrollments.length})
              </div>

              <div className="max-h-96 overflow-y-auto">
                {filteredEnrollments.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {searchTerm ? 'Nessun partecipante trovato' : 'Nessun partecipante iscritto'}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredEnrollments.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        onClick={() => toggleSelection(enrollment.id)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                      >
                        <div className="flex-shrink-0">
                          {selectedIds.includes(enrollment.id) ? (
                            <CheckSquare size={20} className="text-blue-600" />
                          ) : (
                            <Square size={20} className="text-gray-400" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {enrollment.participant?.first_name} {enrollment.participant?.last_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {enrollment.participant?.profession && (
                              <span>{enrollment.participant.profession}</span>
                            )}
                            {enrollment.participant?.profession && enrollment.participant?.discipline && (
                              <span> • </span>
                            )}
                            {enrollment.participant?.discipline && (
                              <span>{enrollment.participant.discipline}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              enrollment.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : enrollment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {enrollment.status === 'confirmed'
                              ? 'Confermato'
                              : enrollment.status === 'pending'
                              ? 'In attesa'
                              : enrollment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="mt-4 text-sm text-gray-600 text-center">
              {selectedIds.length} {selectedIds.length === 1 ? 'partecipante selezionato' : 'partecipanti selezionati'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
