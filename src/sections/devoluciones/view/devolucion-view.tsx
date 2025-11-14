import React, { useMemo, useState, useEffect } from 'react';

import {
  type Devolucion,
  listDevoluciones,
  createDevolucion,
  type CreateDevolucionDto,
} from 'src/services/devoluciones';

type FormState = {
  id_pedido: number | '';
  id_usuario: number | '';
  id_inventario: number | '';
  cantidad: number | '';
  motivo: string;
  monto_reembolsado: number | '';
};

const EMPTY_FORM: FormState = {
  id_pedido: '',
  id_usuario: '',
  id_inventario: '',
  cantidad: '',
  motivo: '',
  monto_reembolsado: '',
};

export function DevolucionView() {
  const [rows, setRows] = useState<Devolucion[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    (async () => {
      try {
        const devoluciones = await listDevoluciones();
        setRows(Array.isArray(devoluciones) ? devoluciones : []);
      } catch (e) {
        console.error(e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('.dropdown-container')) setMenuOpenId(null);
    };
    if (menuOpenId !== null) {
      document.addEventListener('click', close);
      return () => document.removeEventListener('click', close);
    }
    return undefined;
  }, [menuOpenId]);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return rows.filter((r) => r.motivo.toLowerCase().includes(s));
  }, [rows, q]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(EMPTY_FORM);
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === 'id_pedido' ||
        name === 'id_usuario' ||
        name === 'id_inventario' ||
        name === 'cantidad' ||
        name === 'monto_reembolsado'
          ? value === ''
            ? ''
            : Number(value)
          : value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (
        typeof form.id_pedido !== 'number' ||
        typeof form.id_usuario !== 'number' ||
        typeof form.id_inventario !== 'number' ||
        typeof form.cantidad !== 'number' ||
        typeof form.monto_reembolsado !== 'number'
      ) {
        alert('Por favor, completa todos los campos correctamente.');
        return;
      }

      const payload: CreateDevolucionDto = {
        id_pedido: form.id_pedido,
        id_usuario: form.id_usuario,
        id_inventario: form.id_inventario,
        cantidad: form.cantidad,
        motivo: form.motivo,
        monto_reembolsado: form.monto_reembolsado,
      };

      const created = await createDevolucion(payload);
      setRows((prev) => [created, ...prev]);
      closeModal();
      alert('Devolución creada exitosamente');
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Error creando la devolución.');
    }
  };

  if (loading) return <div className="p-8">Cargando devoluciones…</div>;

  return (
    <main className="p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Devoluciones</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600"
          onClick={openCreate}
        >
          <span className="material-icons mr-1 align-middle">add</span>
          Nueva devolución
        </button>
      </header>

      {/* Filters & Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div className="relative">
            <span
              className="material-icons absolute left-3 top-2.5 text-gray-400"
              style={{ fontSize: 20 }}
            >
              search
            </span>
            <input
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar por motivo…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <thead className="bg-gray-50 text-gray-500 uppercase text-sm font-semibold">
              <tr>
                <th className="p-4 w-12">
                  <input className="rounded" type="checkbox" />
                </th>
                <th className="p-4 w-32">ID</th>
                <th className="p-4 w-32">Cantidad</th>
                <th className="p-4 w-64">Motivo</th>
                <th className="p-4 w-40">Monto Reembolsado</th>
                <th className="p-4 w-40">Fecha Creación</th>
                <th className="p-4 w-16" />
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {filtered.map((devolucion) => (
                <tr key={devolucion.id_devolucion} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <input className="rounded" type="checkbox" />
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{devolucion.id_devolucion}</div>
                  </td>
                  <td className="p-4">{devolucion.cantidad}</td>
                  <td className="p-4">
                    <div className="font-medium">{devolucion.motivo}</div>
                  </td>
                  <td className="p-4">
                    <span className="text-lg font-bold text-green-600">
                      Q{parseFloat(devolucion.monto_reembolsado).toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4">
                    {new Date(devolucion.created_at).toLocaleDateString('es-GT')}
                  </td>
                  <td className="p-4 text-right">
                    <div className="relative dropdown-container">
                      <button
                        className="p-2 text-gray-500 hover:text-gray-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(
                            menuOpenId === devolucion.id_devolucion
                              ? null
                              : devolucion.id_devolucion
                          );
                        }}
                      >
                        <span className="material-icons">more_vert</span>
                      </button>

                      {menuOpenId === devolucion.id_devolucion && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                          <div className="py-1">
                            <button
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                setMenuOpenId(null);
                              }}
                            >
                              <span className="material-icons mr-2 text-sm">edit</span>
                              Editar
                            </button>
                            <button
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              onClick={() => {}}
                            >
                              <span className="material-icons mr-2 text-sm">delete</span>
                              Eliminar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            Mostrando {filtered.length} de {rows.length} devoluciones
          </div>
          <div className="flex items-center space-x-1">
            <button className="px-3 py-1 rounded-md text-gray-500 hover:bg-gray-200">
              <span className="material-icons">chevron_left</span>
            </button>
            <button className="px-3 py-1 rounded-md bg-blue-500 text-white">1</button>
            <button className="px-3 py-1 rounded-md text-gray-700 hover:bg-gray-200">2</button>
            <button className="px-3 py-1 rounded-md text-gray-500 hover:bg-gray-200">
              <span className="material-icons">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Nueva Devolución</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg"
              >
                <span className="material-icons text-xl">close</span>
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Pedido *
                  </label>
                  <input
                    type="number"
                    name="id_pedido"
                    value={form.id_pedido}
                    onChange={onChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Usuario *
                  </label>
                  <input
                    type="number"
                    name="id_usuario"
                    value={form.id_usuario}
                    onChange={onChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Inventario *
                  </label>
                  <input
                    type="number"
                    name="id_inventario"
                    value={form.id_inventario}
                    onChange={onChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    name="cantidad"
                    value={form.cantidad}
                    onChange={onChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
                <textarea
                  name="motivo"
                  value={form.motivo}
                  onChange={onChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Reembolsado *
                </label>
                <input
                  type="number"
                  name="monto_reembolsado"
                  value={form.monto_reembolsado}
                  onChange={onChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
