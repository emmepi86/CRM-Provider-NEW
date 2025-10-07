import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Briefcase, Calendar,
  ArrowLeft, FileText, Award, Building, Plane, Hotel, Utensils
} from 'lucide-react';
import { participantsAPI } from '../../api/participants';
import { enrollmentsAPI } from '../../api/enrollments';
import { ParticipantNotesEdit } from '../../components/participants/ParticipantNotesEdit';
import { Participant, Enrollment } from '../../types';

export const ParticipantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  useEffect(() => {
    if (id) {
      fetchParticipant(parseInt(id));
      fetchEnrollments(parseInt(id));
    }
  }, [id]);

  const fetchParticipant = async (participantId: number) => {
    try {
      setLoading(true);
      const data = await participantsAPI.get(participantId);
      setParticipant(data);
    } catch (error) {
      console.error('Errore caricamento partecipante:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async (participantId: number) => {
    try {
      setLoadingEnrollments(true);
      const data = await enrollmentsAPI.listByParticipant(participantId);
      setEnrollments(data.items);
    } catch (error) {
      console.error('Errore caricamento iscrizioni:', error);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      waitlist: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Caricamento partecipante...</div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-600 mb-4">Partecipante non trovato</p>
        <button
          onClick={() => navigate('/participants')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <ArrowLeft size={18} />
          <span>Torna alla lista</span>
        </button>
      </div>
    );
  }

  const hasTravelNeeds = participant.travel_needs && (
    participant.travel_needs.hotel_required ||
    participant.travel_needs.flight_required ||
    participant.travel_needs.dietary_restrictions ||
    participant.travel_needs.special_requirements ||
    participant.travel_needs.notes
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/participants')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          <span>Torna alla lista</span>
        </button>
      </div>

      {/* Dati Anagrafici */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="text-blue-600" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {participant.first_name} {participant.last_name}
            </h1>
            <p className="text-gray-500">UUID: {participant.uuid}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contatti */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Contatti</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-gray-400" />
                <span className="text-gray-900">{participant.email}</span>
              </div>
              {participant.phone && (
                <div className="flex items-center space-x-3">
                  <Phone size={18} className="text-gray-400" />
                  <span className="text-gray-900">{participant.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dati Personali */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Dati Personali</h3>
            <div className="space-y-2 text-sm">
              {participant.fiscal_code && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Codice Fiscale:</span>
                  <span className="text-gray-900 font-medium">{participant.fiscal_code}</span>
                </div>
              )}
              {participant.gender && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Sesso:</span>
                  <span className="text-gray-900">{participant.gender}</span>
                </div>
              )}
              {participant.birth_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Data di Nascita:</span>
                  <span className="text-gray-900">
                    {new Date(participant.birth_date).toLocaleDateString('it-IT')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Luogo di Nascita */}
          {(participant.birth_city || participant.birth_country) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Luogo di Nascita</h3>
              <div className="space-y-2 text-sm">
                {participant.birth_city && (
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-gray-900">
                      {participant.birth_city}
                      {participant.birth_province && ` (${participant.birth_province})`}
                    </span>
                  </div>
                )}
                {participant.birth_region && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Regione:</span>
                    <span className="text-gray-900">{participant.birth_region}</span>
                  </div>
                )}
                {participant.birth_country && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paese:</span>
                    <span className="text-gray-900">{participant.birth_country}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Residenza */}
          {(participant.address || participant.city) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Residenza</h3>
              <div className="space-y-2 text-sm">
                {participant.address && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Indirizzo:</span>
                    <span className="text-gray-900">{participant.address}</span>
                  </div>
                )}
                {participant.city && (
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-gray-900">
                      {participant.city}
                      {participant.province && ` (${participant.province})`}
                      {participant.zip && ` - ${participant.zip}`}
                    </span>
                  </div>
                )}
                {participant.country && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paese:</span>
                    <span className="text-gray-900">{participant.country}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dati Professionali */}
      {(participant.profession || participant.workplace_name) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Briefcase size={20} />
            <span>Dati Professionali</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Professione */}
            {participant.profession && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Professione</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Professione:</span>
                    <span className="text-gray-900 font-medium">{participant.profession}</span>
                  </div>
                  {participant.discipline && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Disciplina:</span>
                      <span className="text-gray-900">{participant.discipline}</span>
                    </div>
                  )}
                  {participant.specialization && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Specializzazione:</span>
                      <span className="text-gray-900">{participant.specialization}</span>
                    </div>
                  )}
                  {participant.employment_type && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo Rapporto:</span>
                      <span className="text-gray-900">{participant.employment_type}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ordine/Albo */}
            {participant.registered_order && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Ordine/Albo</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Iscritto:</span>
                    <span className="text-green-600 font-medium">Sì</span>
                  </div>
                  {participant.order_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Numero:</span>
                      <span className="text-gray-900">{participant.order_number}</span>
                    </div>
                  )}
                  {participant.order_region && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Regione:</span>
                      <span className="text-gray-900">{participant.order_region}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sede di Lavoro */}
            {participant.workplace_name && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center space-x-2">
                  <Building size={16} />
                  <span>Sede di Lavoro</span>
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nome:</span>
                    <span className="text-gray-900 font-medium">{participant.workplace_name}</span>
                  </div>
                  {participant.workplace_address && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Indirizzo:</span>
                      <span className="text-gray-900">{participant.workplace_address}</span>
                    </div>
                  )}
                  {participant.workplace_city && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Città:</span>
                      <span className="text-gray-900">
                        {participant.workplace_city}
                        {participant.workplace_province && ` (${participant.workplace_province})`}
                        {participant.workplace_zip && ` - ${participant.workplace_zip}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Esigenze Viaggio */}
      {hasTravelNeeds && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center space-x-2">
            <Plane size={20} />
            <span>Esigenze Viaggio</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {participant.travel_needs?.hotel_required && (
                <div className="flex items-center space-x-3 text-sm">
                  <Hotel size={18} className="text-blue-600" />
                  <span className="text-gray-900 font-medium">Hotel richiesto</span>
                </div>
              )}
              {participant.travel_needs?.flight_required && (
                <div className="flex items-center space-x-3 text-sm">
                  <Plane size={18} className="text-blue-600" />
                  <span className="text-gray-900 font-medium">Volo richiesto</span>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              {participant.travel_needs?.dietary_restrictions && (
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Utensils size={16} className="text-blue-600" />
                    <span className="text-gray-600 font-medium">Restrizioni alimentari:</span>
                  </div>
                  <p className="text-gray-900 ml-6">{participant.travel_needs.dietary_restrictions}</p>
                </div>
              )}
              {participant.travel_needs?.special_requirements && (
                <div>
                  <span className="text-gray-600 font-medium">Requisiti speciali:</span>
                  <p className="text-gray-900 mt-1">{participant.travel_needs.special_requirements}</p>
                </div>
              )}
            </div>

            {participant.travel_needs?.notes && (
              <div className="md:col-span-2">
                <span className="text-gray-600 font-medium text-sm">Note viaggio:</span>
                <p className="text-gray-900 mt-1 text-sm">{participant.travel_needs.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Storico Iscrizioni */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Calendar size={20} />
          <span>Storico Iscrizioni ({enrollments.length})</span>
        </h2>

        {loadingEnrollments ? (
          <div className="text-center py-8 text-gray-500">Caricamento iscrizioni...</div>
        ) : enrollments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Evento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Iscrizione</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Azioni</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.map((enrollment) => (
                  <tr
                    key={enrollment.id}
                    onClick={() => enrollment.event && navigate(`/events/${enrollment.event.id}`)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {enrollment.event?.title || 'N/A'}
                      </div>
                      {enrollment.event?.event_type && (
                        <div className="text-xs text-gray-500">
                          {enrollment.event.event_type.toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {enrollment.event?.start_date &&
                        new Date(enrollment.event.start_date).toLocaleDateString('it-IT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(enrollment.status)}`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getPaymentBadge(enrollment.payment_status)}`}>
                        {enrollment.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(enrollment.enrollment_date).toLocaleDateString('it-IT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/ecm/${enrollment.id}`);
                        }}
                        className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                      >
                        Vedi ECM
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Nessuna iscrizione trovata
          </div>
        )}
      </div>

      {/* Note Globali */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <FileText size={20} />
          <span>Note Globali Partecipante</span>
        </h2>
        <ParticipantNotesEdit
          participantId={participant.id}
          currentNotes={participant.notes}
          onUpdate={() => fetchParticipant(participant.id)}
        />
      </div>
    </div>
  );
};
