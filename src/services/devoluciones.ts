import { api } from './api';

export interface Devolucion {
  id_devolucion: number;
  cantidad: number;
  motivo: string;
  monto_reembolsado: string;
  created_at: string;
  updated_at: string;
}

export type CreateDevolucionDto = {
  id_pedido: number;
  id_usuario: number;
  id_inventario: number;
  cantidad: number;
  motivo: string;
  monto_reembolsado: number;
};

export const listDevoluciones = () => api.get<Devolucion[]>('/devolucion');
export const createDevolucion = (data: CreateDevolucionDto) =>
  api.post<Devolucion>('/devolucion', data);
