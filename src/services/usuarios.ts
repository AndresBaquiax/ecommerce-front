import { api } from './api';

import type { Rol } from './roles';

export interface Usuario {
  id_usuario: number;
  nombre: string;
  telefono: string;
  direccion: string | null;
  correo: string;
  estado: boolean;
  fecha_creacion: string;
  rol: Rol;
}

export type CreateUsuarioDto = {
  nombre: string;
  contrasena: string;
  telefono: string;
  direccion?: string;
  correo: string;
  id_rol: number;
  estado?: boolean;
};

export type UpdateUsuarioDto = Partial<Omit<CreateUsuarioDto, 'contrasena'>> & {
  contrasena?: string;
};

export const listUsers    = () => api.get<Usuario[]>('/usuario');
export const getUserById  = (id: number) => api.get<Usuario>(`/usuario/${id}`);
export const createUser   = (data: CreateUsuarioDto) => api.post<Usuario>('/usuario', data);
export const updateUser   = (id: number, data: UpdateUsuarioDto) => api.patch<Usuario>(`/usuario/${id}`, data);
export const deleteUser   = (id: number) => api.patch<string>(`/usuario/eliminar/${id}`, {});
