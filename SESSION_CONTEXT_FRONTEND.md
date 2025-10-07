# 🎨 CRM ECM Frontend - Session Context

**Leggi questo per capire il frontend React**

---

## 📋 Quick Facts

- **Tech Stack**: React 18 + TypeScript + Tailwind CSS + Vite
- **Build**: Create React App
- **API Base**: https://crm.digitalhealth.sm/api/v1
- **Routing**: React Router v6
- **State**: Local state (useState/useEffect)
- **Icons**: Lucide React

---

## 🏗️ Struttura Progetto

```
src/
├── api/                    # API client functions
│   ├── client.ts          # Axios instance + interceptors
│   ├── auth.ts            # Auth API
│   ├── events.ts          # Eventi API
│   ├── participants.ts    # Partecipanti API
│   ├── speakers.ts        # Relatori API
│   ├── enrollments.ts     # Iscrizioni API
│   ├── sync.ts            # Sincronizzazione API
│   ├── professions.ts     # Professioni API
│   ├── disciplines.ts     # Discipline API
│   ├── documents.ts       # Documenti API
│   ├── folders.ts         # Cartelle API
│   └── sessions.ts        # Sessioni API
│
├── components/
│   ├── layout/
│   │   └── Layout.tsx     # Layout principale (sidebar + header)
│   ├── participants/
│   │   ├── CreateParticipantModal.tsx  # ✅ NEW (7 Ott)
│   │   └── ParticipantNotesEdit.tsx
│   ├── speakers/
│   │   ├── CreateSpeakerModal.tsx      # ✅ NEW (7 Ott)
│   │   └── SpeakerEventsList.tsx
│   ├── enrollments/
│   │   └── EnrollmentsTable.tsx
│   └── events/
│       ├── EventSpeakers.tsx
│       ├── SessionList.tsx
│       ├── FolderBrowser.tsx
│       ├── DocumentManager.tsx
│       └── sponsors/, patronages/
│
├── pages/
│   ├── auth/
│   │   └── Login.tsx
│   ├── dashboard/
│   │   └── Dashboard.tsx
│   ├── events/
│   │   ├── EventList.tsx
│   │   └── EventDetail.tsx
│   ├── participants/
│   │   ├── ParticipantList.tsx        # ✅ UPDATED (7 Ott)
│   │   ├── ParticipantDetail.tsx
│   │   └── ECMProgress.tsx
│   ├── speakers/
│   │   ├── SpeakerList.tsx            # ✅ UPDATED (7 Ott)
│   │   └── SpeakerDetail.tsx
│   └── sync/
│       └── SyncDashboard.tsx          # ✅ NEW (7 Ott)
│
├── types/
│   ├── index.ts           # Tipi principali
│   ├── participant.ts     # Participant types
│   └── speaker.ts         # Speaker types
│
├── App.tsx                # Router + routes
└── index.tsx              # Entry point
```

---

## 🆕 Modifiche Recenti (7 Ottobre 2025)

### 1. Sistema Creazione Utenti con Anti-Duplicati

#### CreateParticipantModal ✅
**Path**: `src/components/participants/CreateParticipantModal.tsx`

**Funzionalità**:
- Form creazione partecipante (nome, cognome, email*, CF, telefono)
- Controllo duplicati real-time (debounced 500ms):
  - **Email identica** → Blocca creazione, mostra checkbox "forza creazione"
  - **Codice fiscale identico** → Blocca creazione, mostra checkbox
  - **Nome+cognome identici** → Warning, permette creazione
- Lista duplicati trovati con bottone "Usa questo"
- Validazione form (email required e formato valido)

**Integrazione**:
```tsx
// In ParticipantList.tsx
import { CreateParticipantModal } from '../../components/participants/CreateParticipantModal';

const [showCreateModal, setShowCreateModal] = useState(false);

// Button
<button onClick={() => setShowCreateModal(true)}>
  <UserPlus /> Nuovo Partecipante
</button>

// Modal
{showCreateModal && (
  <CreateParticipantModal
    onClose={() => setShowCreateModal(false)}
    onSuccess={(participant) => {
      fetchParticipants();
      navigate(`/participants/${participant.id}`);
    }}
  />
)}
```

#### CreateSpeakerModal ✅
**Path**: `src/components/speakers/CreateSpeakerModal.tsx`

**Funzionalità**:
- Form creazione relatore (nome*, cognome*, email, telefono, specializzazione, bio)
- Controllo duplicati real-time:
  - **Email identica** → Blocca creazione, checkbox "forza"
  - **Nome+cognome identici** → Warning, permette creazione
- Validazione form
- Auto-redirect a dettaglio dopo creazione

**Integrazione**:
```tsx
// In SpeakerList.tsx
import { CreateSpeakerModal } from '../../components/speakers/CreateSpeakerModal';

const [showCreateModal, setShowCreateModal] = useState(false);

// Modal
{showCreateModal && (
  <CreateSpeakerModal
    onClose={() => setShowCreateModal(false)}
    onSuccess={(speaker) => {
      fetchSpeakers();
      navigate(`/speakers/${speaker.id}`);
    }}
  />
)}
```

### 2. Dashboard Sincronizzazione Moodle

**Path**: `src/pages/sync/SyncDashboard.tsx`

**Funzionalità**:
- Statistiche sync (totale, successi, errori, record processati)
- Bottoni trigger manuale:
  - Sync Corsi
  - Sync Iscrizioni
  - Sync ECM
  - Sync Completo
- Log recenti con dettagli espandibili
- Auto-refresh (ogni 5s) quando ci sono job in esecuzione
- Visualizzazione errori dettagliati

**API Utilizzate**:
```typescript
// src/api/sync.ts
syncAPI.getStats()                    // Statistiche
syncAPI.getSyncLogs()                 // Log
syncAPI.triggerSyncCourses()          // Trigger sync
syncAPI.triggerSyncEnrollments()
syncAPI.triggerSyncECM()
syncAPI.triggerSyncAll()
```

### 3. Menu Aggiornato

**Path**: `src/components/layout/Layout.tsx`

**Modifiche**:
- Aggiunta voce "Relatori" (icona Mic)
- Aggiunta voce "Sync Moodle" (icona RefreshCw)
- User info spostata nel sidebar (in basso)
- Rimosso header duplicato

---

## 🔌 API Integration

### Axios Client

**Path**: `src/api/client.ts`

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor: Aggiunge token automaticamente
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: Refresh token su 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Tenta refresh
      const refreshToken = localStorage.getItem('refresh_token');
      // ... refresh logic
    }
    return Promise.reject(error);
  }
);
```

### API Patterns

Tutte le API seguono questo pattern:

```typescript
// src/api/resource.ts
export const resourceAPI = {
  list: async (params?) => {
    const { data } = await apiClient.get('/resource/', { params });
    return data;
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get(`/resource/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await apiClient.post('/resource/', payload);
    return data;
  },

  update: async (id: number, payload) => {
    const { data } = await apiClient.put(`/resource/${id}`, payload);
    return data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/resource/${id}`);
  }
};
```

---

## 🎨 UI/UX Patterns

### Modal Pattern

```tsx
interface ModalProps {
  onClose: () => void;
  onSuccess: (result: T) => void;
}

export const MyModal: React.FC<ModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await api.create(formData);
      onSuccess(result);
      onClose();
    } catch (error) {
      alert('Errore!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2>Titolo</h2>
          <button onClick={onClose}><X /></button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Form fields */}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button onClick={onClose}>Annulla</button>
          <button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Salvataggio...' : 'Salva'}
          </button>
        </div>
      </div>
    </div>
  );
};
```

### List Page Pattern

```tsx
export const ResourceList: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await resourceAPI.list();
      setItems(data.items);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1>Resources</h1>
        <button onClick={() => setShowCreateModal(true)}>
          Nuovo
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md">
        <table>
          {/* ... */}
        </table>
      </div>

      {/* Modal */}
      {showCreateModal && (
        <CreateResourceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchItems();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};
```

---

## 🐛 Common Issues

### 1. CORS Errors

**Sintomo**: Console → `CORS policy blocked`

**Causa**: Backend CORS_ORIGINS non include frontend URL

**Fix Backend**:
```env
CORS_ORIGINS=["http://localhost:3000","https://crm.digitalhealth.sm"]
```

### 2. 401 Unauthorized Loop

**Sintomo**: Infinite redirect a /login

**Causa**: Refresh token endpoint non funziona o token scaduto

**Fix**:
```typescript
// Rimuovi token e forza re-login
localStorage.clear();
window.location.href = '/login';
```

### 3. 502 Bad Gateway

**Sintomo**: Tutte le API calls falliscono con 502

**Causa**: Backend non attivo o crashato

**Fix**:
```bash
# Sul server backend
ps aux | grep uvicorn
# Se non attivo:
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🚀 Development Workflow

### 1. Aggiungere Nuova Pagina

```bash
# 1. Crea componente
nano src/pages/mypage/MyPage.tsx

# 2. Aggiungi route in App.tsx
<Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />

# 3. Aggiungi al menu (se necessario)
nano src/components/layout/Layout.tsx

# 4. Build
npm run build
```

### 2. Aggiungere Nuova API

```bash
# 1. Crea file API
nano src/api/myresource.ts

# 2. Usa nel componente
import { myResourceAPI } from '../../api/myresource';

const data = await myResourceAPI.list();
```

### 3. Aggiungere Nuovo Type

```bash
# 1. Definisci in types/
nano src/types/mytype.ts

# 2. Export da index
nano src/types/index.ts
export * from './mytype';

# 3. Usa nei componenti
import { MyType } from '../../types';
```

---

## 🛠️ Build & Deploy

### Development

```bash
npm start
# → http://localhost:3000
```

### Production Build

```bash
npm run build
# → build/ directory
```

### Check TypeScript

```bash
npm run build 2>&1 | grep -E "error|warning"
```

---

## 📦 Dependencies Key

```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "lucide-react": "^0.x",  // Icons
  "tailwindcss": "^3.x"
}
```

---

## ⚠️ Regole Frontend

1. **SEMPRE tipizzare** con TypeScript (no `any`)
2. **Error handling** su ogni API call (try/catch)
3. **Loading states** per UX migliore
4. **Form validation** prima di submit
5. **Debounce search** per performance (500ms)
6. **Cleanup** in useEffect se necessario
7. **Keys** su liste (React requirement)

---

## 🎯 Next Features da Implementare

- [ ] Paginazione su liste lunghe
- [ ] Filtri avanzati
- [ ] Export Excel/CSV
- [ ] Notifiche real-time
- [ ] Dark mode
- [ ] Mobile responsive migliorato
- [ ] Upload documenti con progress bar
- [ ] Ricerca globale

---

**Ultima revisione**: 7 Ottobre 2025
**Build Size**: ~122KB gzipped
**Browser Support**: Chrome, Firefox, Safari, Edge (modern)
