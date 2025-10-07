import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, TrendingUp, Award } from 'lucide-react';
import axios from 'axios';

interface MetricsResponse {
  timestamp: string;
  totals: {
    events: number;
    participants: number;
    enrollments: number;
  };
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<MetricsResponse['totals'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get<MetricsResponse>('https://crm.digitalhealth.sm/metrics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStats(response.data.totals);
    } catch (error) {
      console.error('Errore caricamento stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Totale Eventi',
      value: stats?.events || 0,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      title: 'Totale Partecipanti',
      value: stats?.participants || 0,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Iscrizioni Totali',
      value: stats?.enrollments || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
    {
      title: 'Crediti ECM',
      value: 0, // TODO: aggiungere al backend
      icon: Award,
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Aggiorna
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4"
            >
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Azioni Rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/events')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Calendar className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-sm font-medium">Nuovo Evento</p>
          </button>
          <button
            onClick={() => navigate('/participants')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <Users className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-sm font-medium">Nuovo Partecipante</p>
          </button>
          <button
            onClick={() => navigate('/sync')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
          >
            <TrendingUp className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-sm font-medium">Sync Moodle</p>
          </button>
        </div>
      </div>
    </div>
  );
};
