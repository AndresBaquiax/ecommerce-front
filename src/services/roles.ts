import { api } from './api';

export interface Rol {
  id_rol: number;
  nombre: string;
  descripcion?: string;
}

export const listRoles = () => api.get<Rol[]>('/rol');
