// src/pages/views/pedidos.tsx
import React, { useEffect, useMemo, useState } from 'react';

import { listPedidos, buscarPedidos, marcarComoEntregado, type Pedido } from 'src/services/pedidos';

// Icons simples
const SearchIcon = () => (<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const EyeIcon    = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>);
const TruckIcon  = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h12v8H3zM15 9h4l2 3v3h-6zM7 19a2 2 0 11-4 0 2 2 0 014 0zm12 0a2 2 0 11-4 0 2 2 0 014 0z" /></svg>);
const ShoppingBagIcon = () => (<svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" /></svg>);
const AlertCircleIcon = () => (<svg width="72" height="72" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={1.5} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01" /></svg>);

const toast = {
  success: (m: string) => console.log('✅', m),
  error:   (m: string) => console.error('❌', m),
  info:    (m: string) => console.info('ℹ️', m),
};

type Tab = 'todos' | 'pendientes' | 'entregados';

const PedidosPage: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState<Tab>('todos');
  const [viewing, setViewing] = useState<Pedido | null>(null);

  const money = (n: number) => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n);

  // OJO: en tu modelo estado=true = NO ENTREGADO (pendiente), estado=false = ENTREGADO
  const Badge = ({ estado }: { estado: boolean }) =>
    estado ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Pendiente
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Entregado
      </span>
    );

  async function cargar(tabActual: Tab) {
    try {
      setLoading(true);
      if (tabActual === 'todos') {
        const data = await listPedidos();
        setPedidos(data);
        return;
      }
      const data = await buscarPedidos({ estado: tabActual === 'pendientes' ? true : false });
      setPedidos(data);
    } catch (e: any) {
      toast.error(e?.message || 'No se pudieron cargar pedidos');
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar(tab);
  }, [tab]);

  const filtrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return pedidos;
    return pedidos.filter((p) =>
      p.direccion_envio.toLowerCase().includes(term) ||
      String(p.id_pedido).includes(term) ||
      String(p.id_usuario).includes(term)
    );
  }, [pedidos, searchTerm]);

  const marcarEntregado = async (p: Pedido) => {
    if (!p.estado) return; // ya entregado
    // eslint-disable-next-line no-alert
    if (!window.confirm(`¿Marcar pedido #${p.id_pedido} como ENTREGADO?`)) return;
    try {
      await marcarComoEntregado(p.id_pedido);
      toast.success(`Pedido #${p.id_pedido} marcado como entregado`);
      await cargar(tab); // refrescar lista
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo marcar como entregado');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          <p className="text-gray-600">Cargando pedidos…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-blue-600 mr-3"><ShoppingBagIcon /></div>
            <h1 className="text-4xl font-bold text-gray-900">Gestión de Pedidos</h1>
          </div>
          <p className="text-xl text-gray-600">Administra pedidos entregados y pendientes</p>
        </div>

        {/* Tabs + search */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
          <div className="bg-white p-1 rounded-lg border border-gray-200 inline-flex">
            <button
              className={`px-4 py-2 rounded-md ${tab==='todos' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setTab('todos')}
            >Todos</button>
            <button
              className={`px-4 py-2 rounded-md ${tab==='pendientes' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setTab('pendientes')}
            >Pendientes</button>
            <button
              className={`px-4 py-2 rounded-md ${tab==='entregados' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setTab('entregados')}
            >Entregados</button>
          </div>

          <div className="relative w-full lg:w-96">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></div>
            <input
              type="text"
              placeholder="Buscar por dirección, ID o usuario…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lista */}
        {filtrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="mx-auto text-gray-400 mb-4"><AlertCircleIcon /></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron pedidos' : 'No hay pedidos en esta vista'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Prueba con otros términos de búsqueda' : 'Cambia de pestaña o vuelve más tarde'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtrados.map((p) => (
              <div key={p.id_pedido} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">Pedido #{p.id_pedido}</h3>
                        <Badge estado={p.estado} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-gray-600"><span className="font-medium">Fecha:</span> {new Date(p.fecha_pedido).toLocaleDateString('es-GT')}</p>
                          <p className="text-gray-600"><span className="font-medium">Usuario:</span> #{p.id_usuario}</p>
                          <p className="text-gray-600"><span className="font-medium">Factura:</span> #{p.id_factura}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-600"><span className="font-medium">Subtotal:</span> {money(p.subtotal)}</p>
                          <p className="text-gray-600"><span className="font-medium">Envío:</span> {money(p.costo_envio)}</p>
                          <p className="text-gray-900 font-semibold"><span className="font-medium">Total:</span> {money(p.total)}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-gray-600 text-sm"><span className="font-medium">Dirección:</span> {p.direccion_envio}</p>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Creado: {new Date(p.created_at).toLocaleString('es-GT')}
                        {p.updated_at !== p.created_at && (
                          <span className="ml-4">Actualizado: {new Date(p.updated_at).toLocaleString('es-GT')}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setViewing(p)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Ver detalles"
                      ><EyeIcon /></button>

                      {p.estado && (
                        <button
                          type="button"
                          onClick={() => marcarEntregado(p)}
                          className="p-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors inline-flex items-center"
                          title="Marcar como entregado"
                        >
                          <TruckIcon /> <span className="ml-1 text-sm">Entregado</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal simple de detalles */}
        {viewing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Detalles del Pedido #{viewing.id_pedido}</h2>
                <button type="button" onClick={() => setViewing(null)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
              </div>
              <div className="p-6 space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-medium">Fecha:</span> {new Date(viewing.fecha_pedido).toLocaleDateString('es-GT')}</p>
                    <p><span className="font-medium">Estado:</span> {viewing.estado ? 'Pendiente' : 'Entregado'}</p>
                    <p><span className="font-medium">Usuario:</span> #{viewing.id_usuario}</p>
                    <p><span className="font-medium">Factura:</span> #{viewing.id_factura}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Subtotal:</span> {money(viewing.subtotal)}</p>
                    <p><span className="font-medium">Envío:</span> {money(viewing.costo_envio)}</p>
                    <p><span className="font-medium">Total:</span> {money(viewing.total)}</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Dirección de envío</p>
                  <p className="bg-gray-50 p-3 rounded">{viewing.direccion_envio}</p>
                </div>

                {viewing.estado && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => marcarEntregado(viewing)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
                    >
                      <TruckIcon /> <span className="ml-2">Marcar como entregado</span>
                    </button>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button type="button" onClick={() => setViewing(null)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PedidosPage;
