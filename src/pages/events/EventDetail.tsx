import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Award, ArrowLeft, Trash2, Clock, FileText, Mic, Building2, Trophy, Clipboard, Edit, Download, User, Mail, Video, MousePointerClick } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { eventsAPI } from '../../api/events';
import { EnrollParticipantModal } from '../../components/EnrollParticipantModal';
import { enrollmentsAPI } from '../../api/enrollments';
import { badgesAPI, BadgeTemplate } from '../../api/badges';
import { SessionList } from '../../components/events/SessionList';
import { FolderBrowser } from '../../components/events/FolderBrowser';
import { EventSpeakers } from '../../components/events/EventSpeakers';
import { EnrollmentNotesEdit } from '../../components/enrollments/EnrollmentNotesEdit';
import { SponsorsList } from '../../components/events/sponsors/SponsorsList';
import { PatronagesList } from '../../components/events/patronages/PatronagesList';
import { BadgeTab } from '../../components/badges/BadgeTab';
import { EditEventModal } from '../../components/events/EditEventModal';
import { SendEmailModal } from '../../components/emails/SendEmailModal';
import { MeetingTab } from '../../components/events/MeetingTab';
import { LandingTab } from '../../components/events/LandingTab';
import { EventProjectsTab } from '../../components/events/EventProjectsTab';
import { Event, Enrollment, EmailRecipient } from '../../types';

type TabType = 'enrollments' | 'projects' | 'sessions' | 'meetings' | 'documents' | 'speakers' | 'sponsors' | 'patronages' | 'badges' | 'landing';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canUseBadges, canUseSponsors, canUsePatronages, canUseDocuments } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [badgeTemplates, setBadgeTemplates] = useState<BadgeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('enrollments');
  const [downloadingBadge, setDownloadingBadge] = useState<number | null>(null);
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<number[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEvent(parseInt(id));
      fetchEnrollments(parseInt(id));
      fetchBadgeTemplates(parseInt(id));
    }
  }, [id]);

  const fetchEvent = async (eventId: number) => {
    try {
      setLoading(true);
      const data = await eventsAPI.getById(eventId);
      setEvent(data);
    } catch (error) {
      console.error('Errore caricamento evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async (eventId: number) => {
    try {
      setLoadingEnrollments(true);
      const data = await enrollmentsAPI.listByEvent(eventId);
      setEnrollments(data.items);
    } catch (error) {
      console.error('Errore caricamento iscritti:', error);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const fetchBadgeTemplates = async (eventId: number) => {
    try {
      const data = await badgesAPI.getTemplates(eventId);
      setBadgeTemplates(data.templates || []);
    } catch (error) {
      console.error('Errore caricamento template badge:', error);
      setBadgeTemplates([]);
    }
  };

  const handleCheckboxChange = (enrollmentId: number) => {
    setSelectedEnrollmentIds(prev =>
      prev.includes(enrollmentId)
        ? prev.filter(id => id !== enrollmentId)
        : [...prev, enrollmentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEnrollmentIds.length === enrollments.length) {
      setSelectedEnrollmentIds([]);
    } else {
      setSelectedEnrollmentIds(enrollments.map(e => e.id));
    }
  };

  const handleSendEmail = (recipientEnrollments?: Enrollment[]) => {
    const enrollmentsToEmail = recipientEnrollments ||
      enrollments.filter(e => selectedEnrollmentIds.includes(e.id));

    if (enrollmentsToEmail.length === 0) {
      alert('Nessun destinatario selezionato');
      return;
    }

    setShowEmailModal(true);
  };

  const getEmailRecipients = (): EmailRecipient[] => {
    const enrollmentsToEmail = enrollments.filter(e => selectedEnrollmentIds.includes(e.id));
    return enrollmentsToEmail
      .filter(e => e.participant?.email)
      .map(e => ({
        email: e.participant!.email,
        name: `${e.participant!.first_name} ${e.participant!.last_name}`,
        participant_id: e.participant_id
      }));
  };

  const handleDownloadBadge = async (participantId: number, participantName: string) => {
    if (badgeTemplates.length === 0) {
      alert('Nessun template badge configurato per questo evento');
      return;
    }

    try {
      setDownloadingBadge(participantId);
      // Usa il primo template disponibile (o il template 'all' se disponibile)
      const template = badgeTemplates.find(t => t.participant_type === 'all' || t.participant_type === 'participant')
                       || badgeTemplates[0];

      const blob = await badgesAPI.previewBadge(event!.id, template.id, participantId, 'front');

      // Download del file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `badge_${participantName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Errore download badge:', error);
      alert('Errore durante il download del badge');
    } finally {
      setDownloadingBadge(null);
    }
  };

  const handleDeleteEnrollment = async (enrollmentId: number) => {
    if (!window.confirm('Sei sicuro di voler rimuovere questa iscrizione?')) {
      return;
    }

    try {
      await enrollmentsAPI.delete(enrollmentId);
      setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
    } catch (error) {
      console.error('Errore eliminazione iscrizione:', error);
      alert('Errore durante la rimozione dell\'iscrizione');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type: string) => {
    return type === 'ecm'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-orange-100 text-orange-800';
  };

  const getPaymentBadge = (status: string) => {
    const colors = {
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading || !event) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/events')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          {!event.moodle_course_id && (
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              title="Modifica Evento"
            >
              <Edit size={18} />
              <span>Modifica</span>
            </button>
          )}
          {event.moodle_course_id && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600" title="Evento sincronizzato da Moodle (readonly)">
              Sincronizzato da Moodle
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeBadge(event.event_type)}`}>
            {event.event_type === 'ecm' ? 'ECM' : 'Non-ECM'}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(event.status)}`}>
            {event.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-3">
          <Calendar className="text-blue-600" size={24} />
          <div>
            <p className="text-sm text-gray-600">Date</p>
            <p className="font-medium">
              {new Date(event.start_date).toLocaleDateString('it-IT')}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-3">
          <MapPin className="text-green-600" size={24} />
          <div>
            <p className="text-sm text-gray-600">Location</p>
            <p className="font-medium">{event.location || 'Non specificata'}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-3">
          <Users className="text-purple-600" size={24} />
          <div>
            <p className="text-sm text-gray-600">Iscritti</p>
            <p className="font-medium">{enrollments.length}/{event.max_participants || '∞'}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-3">
          <Award className="text-yellow-600" size={24} />
          <div>
            <p className="text-sm text-gray-600">Crediti ECM</p>
            <p className="font-medium">{event.ecm_credits || 'N/A'}</p>
          </div>
        </div>
      </div>

      {event.event_type === 'ecm' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-purple-900">Informazioni ECM</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Codice ECM</p>
              <p className="font-medium">{event.ecm_code || 'Non assegnato'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Crediti</p>
              <p className="font-medium">{event.ecm_credits || 'N/A'}</p>
            </div>
            {event.ecm_provider_code && (
              <div>
                <p className="text-sm text-gray-600">Codice Provider</p>
                <p className="font-medium">{event.ecm_provider_code}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('enrollments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'enrollments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users size={18} />
              <span>Iscritti ({enrollments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clipboard size={18} />
              <span>Progetti</span>
            </button>
            {event.event_type !== 'ecm' && !event.moodle_course_id && (
              <button
                onClick={() => setActiveTab('landing')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'landing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MousePointerClick size={18} />
                <span>Landing Page</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('speakers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'speakers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Mic size={18} />
              <span>Relatori</span>
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'sessions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock size={18} />
              <span>Sessioni & Programma</span>
            </button>
            <button
              onClick={() => setActiveTab('meetings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'meetings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Video size={18} />
              <span>Meeting Online</span>
            </button>
            {canUseDocuments() && (
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'documents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText size={18} />
                <span>Documenti</span>
              </button>
            )}
            {canUseSponsors() && (
              <button
                onClick={() => setActiveTab('sponsors')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'sponsors'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Building2 size={18} />
                <span>Sponsor</span>
              </button>
            )}
            {canUsePatronages() && (
              <button
                onClick={() => setActiveTab('patronages')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'patronages'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Trophy size={18} />
                <span>Patrocini</span>
              </button>
            )}
            {canUseBadges() && (event.delivery_mode === 'RESIDENTIAL' || event.delivery_mode === 'HYBRID') && (
              <button
                onClick={() => setActiveTab('badges')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'badges'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clipboard size={18} />
                <span>Badge</span>
              </button>
            )}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'enrollments' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <span>Iscritti ({enrollments.length})</span>
                  {selectedEnrollmentIds.length > 0 && (
                    <span className="text-sm font-normal text-gray-600">
                      ({selectedEnrollmentIds.length} selezionati)
                    </span>
                  )}
                </h2>
                <div className="flex items-center space-x-2">
                  {selectedEnrollmentIds.length > 0 && (
                    <button
                      onClick={() => handleSendEmail()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Mail size={18} />
                      <span>Invia Email ({selectedEnrollmentIds.length})</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowEnrollModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Users size={18} />
                    <span>Aggiungi Iscritto</span>
                  </button>
                </div>
              </div>

              {loadingEnrollments ? (
                <p className="text-gray-500 text-center py-8">Caricamento iscritti...</p>
              ) : enrollments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nessun iscritto per questo evento</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-center py-3 px-2 font-semibold text-gray-700 w-12">
                          <input
                            type="checkbox"
                            checked={selectedEnrollmentIds.length === enrollments.length && enrollments.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Nome</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Stato</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Pagamento</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Data Iscrizione</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Note</th>
                        {badgeTemplates.length > 0 && (
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">Badge</th>
                        )}
                        <th className="text-center py-3 px-2 font-semibold text-gray-700 w-16">Email</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((enrollment) => (
                        <tr key={enrollment.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2 text-center">
                            <input
                              type="checkbox"
                              checked={selectedEnrollmentIds.includes(enrollment.id)}
                              onChange={() => handleCheckboxChange(enrollment.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-3 px-4">
                            {enrollment.participant ? (
                              <div className="flex items-center space-x-3">
                                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                  enrollment.participant.moodle_user_id ? 'bg-indigo-100' : 'bg-blue-100'
                                }`}>
                                  <User className={enrollment.participant.moodle_user_id ? 'text-indigo-600' : 'text-blue-600'} size={16} />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => navigate(`/ecm/${enrollment.id}`, { state: { eventId: event.id, eventTitle: event.title } })}
                                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left"
                                    title="Visualizza percorso ECM"
                                  >
                                    {`${enrollment.participant.first_name} ${enrollment.participant.last_name}`}
                                  </button>
                                  {enrollment.participant.moodle_user_id && (
                                    <span
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                                      title={`Sincronizzato da Moodle (ID: ${enrollment.participant.moodle_user_id})`}
                                    >
                                      Moodle
                                    </span>
                                  )}
                                  <button
                                    onClick={() => navigate(`/participants/${enrollment.participant_id}`)}
                                    className="text-gray-500 hover:text-gray-700"
                                    title="Visualizza anagrafica completa"
                                  >
                                    <User size={16} />
                                  </button>
                                </div>
                              </div>
                            ) : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            {enrollment.participant?.email || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(enrollment.status)}`}>
                              {enrollment.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentBadge(enrollment.payment_status)}`}>
                              {enrollment.payment_status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {new Date(enrollment.enrollment_date).toLocaleDateString('it-IT')}
                          </td>
                          <td className="py-3 px-4">
                            <EnrollmentNotesEdit
                              enrollmentId={enrollment.id}
                              currentNotes={enrollment.notes}
                              onUpdate={() => fetchEnrollments(event.id)}
                            />
                          </td>
                          {badgeTemplates.length > 0 && (
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleDownloadBadge(
                                  enrollment.participant_id,
                                  `${enrollment.participant?.first_name} ${enrollment.participant?.last_name}`
                                )}
                                disabled={downloadingBadge === enrollment.participant_id}
                                className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-wait"
                                title="Scarica badge"
                              >
                                {downloadingBadge === enrollment.participant_id ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
                                ) : (
                                  <Download size={18} />
                                )}
                              </button>
                            </td>
                          )}
                          <td className="py-3 px-2 text-center">
                            <button
                              onClick={() => {
                                if (!enrollment.participant?.email) {
                                  alert('Nessun indirizzo email disponibile per questo partecipante');
                                  return;
                                }
                                setSelectedEnrollmentIds([enrollment.id]);
                                handleSendEmail();
                              }}
                              disabled={!enrollment.participant?.email}
                              className="text-blue-600 hover:text-blue-800 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Invia email"
                            >
                              <Mail size={18} />
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDeleteEnrollment(enrollment.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Rimuovi iscrizione"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <EventProjectsTab eventId={event.id} />
          )}

          {activeTab === 'speakers' && (
            <EventSpeakers eventId={event.id} />
          )}

          {activeTab === 'sessions' && (
            <SessionList eventId={event.id} />
          )}

          {activeTab === 'meetings' && (
            <MeetingTab eventId={event.id} />
          )}

          {canUseDocuments() && activeTab === 'documents' && (
            <FolderBrowser entityType="event" entityId={event.id} />
          )}

          {canUseSponsors() && activeTab === 'sponsors' && (
            <SponsorsList eventId={event.id} />
          )}

          {canUsePatronages() && activeTab === 'patronages' && (
            <PatronagesList eventId={event.id} />
          )}

          {canUseBadges() && activeTab === 'badges' && (
            <BadgeTab eventId={event.id} deliveryMode={event.delivery_mode || 'RESIDENTIAL'} />
          )}

          {event.event_type !== 'ecm' && !event.moodle_course_id && activeTab === 'landing' && (
            <LandingTab eventId={event.id} />
          )}
        </div>
      </div>

      {showEnrollModal && (
        <EnrollParticipantModal
          eventId={event.id}
          enrolledParticipantIds={enrollments.map(e => e.participant_id)}
          onClose={() => setShowEnrollModal(false)}
          onSuccess={() => {
            fetchEnrollments(event.id);
          }}
        />
      )}

      {showEditModal && (
        <EditEventModal
          event={event}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            fetchEvent(event.id);
            setShowEditModal(false);
          }}
        />
      )}

      {showEmailModal && (
        <SendEmailModal
          recipients={getEmailRecipients()}
          eventId={event.id}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedEnrollmentIds([]);
          }}
          onSuccess={() => {
            setShowEmailModal(false);
            setSelectedEnrollmentIds([]);
          }}
        />
      )}
    </div>
  );
};
