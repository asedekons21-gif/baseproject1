import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, Report } from '../types';

interface AppState {
  currentUser: User | null;
  users: User[];
  reports: Report[];
  isAuthenticated: boolean;
}

type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_REPORT'; payload: Report }
  | { type: 'UPDATE_REPORT'; payload: Report }
  | { type: 'DELETE_REPORT'; payload: string };

const initialState: AppState = {
  currentUser: null,
  users: [
    { id: 'admin1', name: 'Administrator', password: 'admin123', role: 'Admin' },
    { id: 'tu1', name: 'TU Staff', password: 'tu123', role: 'TU' },
    { id: 'coord1', name: 'Suwarti, S.H', password: 'coord123', role: 'Koordinator' },
    { id: 'coord2', name: 'Achamd Evianto', password: 'coord123', role: 'Koordinator' },
    { id: 'staff1', name: 'Budi Santoso', password: 'staff123', role: 'Staff' },
    { id: 'staff2', name: 'Sari Dewi', password: 'staff123', role: 'Staff' }
  ],
  reports: [
    {
      id: 'RPT001',
      noSurat: '001/SDM/2025',
      hal: 'Perpanjangan Kontrak PPPK',
      status: 'Dalam Proses',
      layanan: 'Layanan Perpanjangan Hubungan Kerja PPPK',
      dari: 'Bagian Kepegawaian',
      tanggalSurat: '2025-01-15',
      tanggalAgenda: '2025-01-16',
      noAgenda: 'AG001',
      kelompokAsalSurat: 'Internal',
      agendaSestama: 'AS001',
      sifat: ['Penting'],
      derajat: ['Segera'],
      createdBy: 'tu1',
      currentHolder: 'coord1',
      workflow: [
        { id: 'w1', action: 'Dibuat oleh TU Staff', user: 'TU Staff', timestamp: '2025-01-16 08:00', status: 'completed' },
        { id: 'w2', action: 'Diteruskan ke Koordinator', user: 'TU Staff', timestamp: '2025-01-16 08:30', status: 'completed' },
        { id: 'w3', action: 'Dalam Verifikasi Dokumen', user: 'Suwarti, S.H', timestamp: '2025-01-16 09:00', status: 'in-progress' }
      ]
    }
  ],
  isAuthenticated: false
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: true
      };
    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
        isAuthenticated: false
      };
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload]
      };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload.id ? action.payload : user
        )
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    case 'ADD_REPORT':
      return {
        ...state,
        reports: [...state.reports, action.payload]
      };
    case 'UPDATE_REPORT':
      return {
        ...state,
        reports: state.reports.map(report => 
          report.id === action.payload.id ? action.payload : report
        )
      };
    case 'DELETE_REPORT':
      return {
        ...state,
        reports: state.reports.filter(report => report.id !== action.payload)
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}