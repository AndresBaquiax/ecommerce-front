// src/services/pedidos.ts
import { api } from './api';

export interface Pedido {
  id_pedido: number;
  fecha_pedido: string;
  direccion_envio: string;
  costo_envio: number;
  subtotal: number;
  total: number;
  estado: boolean;
  id_usuario: number;
  id_factura: number;
  created_at: string;
  updated_at: string;
}

export type FiltroPedidos = {
  estado?: boolean;
  id_usuario?: number;
  desde?: string;
  hasta?: string;
};

export const listPedidos = () => api.get<Pedido[]>('/pedidos');

export const buscarPedidos = (filtros: FiltroPedidos) =>
  api.post<Pedido[]>('/pedidos/buscar', filtros);

export const updatePedido = (id: number, data: Partial<Pedido>) =>
  api.put<Pedido>(`/pedidos/${id}`, data);

export const marcarComoEntregado = (id: number) =>
  updatePedido(id, { estado: false });
