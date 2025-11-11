import { api } from './api';

export interface Log {
  id_log: number;
  accion: string;
  created_at: string;
  updated_at: string;
}

export const listLogs = () => api.get<Log[]>('/logs');
export const listLogsByUser = (id: number) => api.get<Log[]>(`/logs/user/${id}`);
