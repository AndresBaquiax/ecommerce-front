import { api } from './api';

export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio_unitario: string;
  stock_minimo: number;
  estado: boolean;
  id_categoria: number;
  url_imagen: string;
  created_at: string;
  updated_at: string;
}

export interface Oferta {
  id_oferta: number;
  descripcion: string;
  descuento_porcentaje: string;
  fecha_inicio: string;
  fecha_fin: string;
  id_producto: number;
  producto: Producto;
  created_at: string;
  updated_at: string;
}

export type CreateOfertaDto = {
  descripcion: string;
  descuento_porcentaje: number;
  fecha_inicio: string;
  fecha_fin: string;
  id_producto: number;
};

export type UpdateOfertaDto = Partial<CreateOfertaDto>;

export const listOfertas = () => api.get<Oferta[]>('/ofertas');
export const getOfertaById = (id: number) => api.get<Oferta>(`/ofertas/${id}`);
export const createOferta = (data: CreateOfertaDto) => api.post<Oferta>('/ofertas', data);
export const updateOferta = (id: number, data: UpdateOfertaDto) => api.put<Oferta>(`/ofertas/${id}`, data);
export const deleteOferta = (id: number) => api.del<string>(`/ofertas/${id}`);
