import { api } from './api';

export type KPI = { total: number; porcentaje: number | null };

export type Resumen = {
  ventasSemanales: KPI;
  nuevosUsuarios: KPI;
  comprasSemanales: KPI;
  pedidosPendientesEntrega: KPI;
};

export type VentasMensuales = {
  categorias: string[];
  seriesVentas: number[];
  seriesCompras: number[];
};

export type LowStockItem = {
  id_producto: number;
  id_inventario: number;
  nombre: string;
  categoria: string | null;
  cantidad: number;
  stock_minimo: number;
};

export type EtiquetaValor = { etiqueta: string; valor: number };
export type TimelineItem = { id: number; titulo: string; fecha: string; tipo: string };

export const getResumen = () => api.get<Resumen>('/reportes/resumen');

export const getVentasMensuales = (anio?: number) =>
  api.get<VentasMensuales>(`/reportes/ventas-mensuales${anio ? `?anio=${anio}` : ''}`);

export const getStockPorCategoria = () => api.get<EtiquetaValor[]>('/reportes/stock-por-categoria');
export const getTopCategorias = () => api.get<EtiquetaValor[]>('/reportes/top-categorias');
export const getTimelinePedidos = () => api.get<TimelineItem[]>('/reportes/timeline-pedidos');
export const getUsuariosPorRol = () => api.get<EtiquetaValor[]>('/reportes/usuarios-por-rol');

function normalizeLowStock(x: any): LowStockItem {
  return {
    id_producto: Number(x.id_producto),
    id_inventario: Number(x.id_inventario),
    nombre: String(x.nombre ?? ''),
    categoria: x.categoria ?? null,
    cantidad: Number(x.cantidad ?? 0),
    stock_minimo: Number(x.stock_minimo ?? x['stock_mínimo'] ?? x.stockMinimo ?? 0),
  };
}

export const getStockBajo = async () => {
  const raw = await api.get<any[]>('/reportes/stock-bajo');
  return (Array.isArray(raw) ? raw : []).map(normalizeLowStock);
};
