import { api } from './api';

export interface InventarioItem {
  id_inventario: number;
  cantidad: number;
  estado: boolean;
  producto: {
    id_producto: number;
    nombre: string;
    descripcion: string;
    precio_unitario: number;
    categoria?: { nombre: string };
  };
  created_at?: string;
  updated_at?: string;
}

export const listActiveInventory = async (): Promise<InventarioItem[]> => {
  const rows = await api.get<InventarioItem[]>('/inventario');
  return (rows || []).filter((i) => i.estado);
};

export const listInventory = () => api.get<InventarioItem[]>('/inventario');
