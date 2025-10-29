import { api } from './api';

export interface DetalleCompraDTO {
  id_inventario: number;
  cantidad: number;
  precio_unitario: number;
  fecha_vencimiento: string;
}

export interface RegistrarCompraDTO {
  tipo: 'Compra';
  fecha: string;
  subtotal: number;
  total: number;
  descuento?: number;
  id_proveedor: number;
  detalleProductos: DetalleCompraDTO[];
}

export const registrarCompra = (payload: RegistrarCompraDTO) =>
  api.post<{ mensaje: string }>('/compras', payload);
