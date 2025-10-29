import { api } from './api';

export interface Proveedor {
  id_proveedor: number;
  nombre: string;
  telefono: string;
  nit: string;
  estado: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateProveedorDto = {
  nombre: string;
  telefono: string;
  nit: string;
  estado?: boolean;
};

export type UpdateProveedorDto = Partial<CreateProveedorDto>;

export const listProviders    = () => api.get<Proveedor[]>('/proveedores');
export const getProviderById  = (id: number) => api.get<Proveedor>(`/proveedores/${id}`);
export const createProvider   = (data: CreateProveedorDto) =>
  api.post<Proveedor>('/proveedores', { estado: true, ...data });
export const updateProvider = (id: number, data: UpdateProveedorDto) =>
  api.patch<Proveedor>(`/proveedores/${id}`, data);

export const deleteProvider = (id: number) =>
  api.patch<string>(`/proveedores/eliminar/${id}`, {});

export const listActiveProviders = async () => {
  const all = await listProviders();
  return all.filter((p) => p.estado);
};
