import React, { useMemo, useState, useEffect } from 'react';

import { api } from 'src/services/api';
import {
  listOfertas,
  type Oferta,
  createOferta,
  updateOferta,
  deleteOferta,
  type CreateOfertaDto,
} from 'src/services/ofertas';

type FormState = {
  descripcion: string;
  descuento_porcentaje: number | '';
  fecha_inicio: string;
  fecha_fin: string;
  id_producto: number | '';
};

const EMPTY_FORM: FormState = {
  descripcion: '',
  descuento_porcentaje: '',
  fecha_inicio: '',
  fecha_fin: '',
  id_producto: '',
};

interface ProductoOption {
  id_producto: number;
  nombre: string;
}

const OfertasView: React.FC = () => {
  const [rows, setRows] = useState<Oferta[]>([]);
  const [productos, setProductos] = useState<ProductoOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');

  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Oferta | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    (async () => {
      try {
        const [ofertas, prods] = await Promise.all([
          listOfertas(),
          api.get<ProductoOption[]>('/productos'),
        ]);
        setRows(Array.isArray(ofertas) ? ofertas : []);
        setProductos(Array.isArray(prods) ? prods : []);
      } catch (e) {
        console.error(e);
        setRows([]);
        setProductos([]);
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
    return rows.filter(
      (r) =>
        r.descripcion.toLowerCase().includes(s) ||
        (r.producto?.nombre || '').toLowerCase().includes(s)
    );
  }, [rows, q]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (oferta: Oferta) => {
    setEditing(oferta);
    setForm({
      descripcion: oferta.descripcion,
      descuento_porcentaje: parseFloat(oferta.descuento_porcentaje),
      fecha_inicio: oferta.fecha_inicio,
      fecha_fin: oferta.fecha_fin,
      id_producto: oferta.id_producto,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === 'id_producto'
          ? value === ''
            ? ''
            : Number(value)
          : name === 'descuento_porcentaje'
          ? value === ''
            ? ''
            : Number(value)
          : value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (typeof form.id_producto !== 'number') {
        alert('Selecciona un producto.');
        return;
      }
      if (typeof form.descuento_porcentaje !== 'number') {
        alert('Ingresa un porcentaje de descuento válido.');
        return;
      }

      const payload: CreateOfertaDto = {
        descripcion: form.descripcion,
        descuento_porcentaje: form.descuento_porcentaje,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        id_producto: form.id_producto,
      };

      if (editing) {
        const updated = await updateOferta(editing.id_oferta, payload);
        setRows((prev) => prev.map((x) => (x.id_oferta === editing.id_oferta ? updated : x)));
      } else {
        const created = await createOferta(payload);
        setRows((prev) => [created, ...prev]);
      }
      closeModal();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Error guardando la oferta.');
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta oferta?')) return;
    try {
      await deleteOferta(id);
      setRows((prev) => prev.filter((x) => x.id_oferta !== id));
      alert('Oferta eliminada');
    } catch (err) {
      console.error(err);
      alert('No se pudo eliminar la oferta.');
    }
  };

  if (loading) return <div className="p-8">Cargando ofertas…</div>;

  return (
    <main className="p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Ofertas</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600"
          onClick={openCreate}
        >
          <span className="material-icons mr-1 align-middle">add</span>
          Nueva Oferta
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
              placeholder="Buscar por descripción o producto…"
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
                <th className="p-4 w-64">Descripción</th>
                <th className="p-4 w-48">Producto</th>
                <th className="p-4 w-32">Descuento</th>
                <th className="p-4 w-40">Fecha Inicio</th>
                <th className="p-4 w-40">Fecha Fin</th>
                <th className="p-4 w-16" />
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {filtered.map((oferta) => (
                <tr key={oferta.id_oferta} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <input className="rounded" type="checkbox" />
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{oferta.descripcion}</div>
                    <div className="text-sm text-gray-500">ID: {oferta.id_oferta}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{oferta.producto?.nombre || 'N/A'}</div>
                    <div className="text-sm text-gray-500">
                      Precio: Q{parseFloat(oferta.producto?.precio_unitario || '0').toFixed(2)}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-lg font-bold text-orange-600">
                      {parseFloat(oferta.descuento_porcentaje).toFixed(0)}%
                    </span>
                  </td>
                  <td className="p-4">
                    {new Date(oferta.fecha_inicio).toLocaleDateString('es-GT')}
                  </td>
                  <td className="p-4">
                    {new Date(oferta.fecha_fin).toLocaleDateString('es-GT')}
                  </td>
                  <td className="p-4 text-right">
                    <div className="relative dropdown-container">
                      <button
                        className="p-2 text-gray-500 hover:text-gray-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(
                            menuOpenId === oferta.id_oferta ? null : oferta.id_oferta
                          );
                        }}
                      >
                        <span className="material-icons">more_vert</span>
                      </button>

                      {menuOpenId === oferta.id_oferta && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                          <div className="py-1">
                            <button
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                openEdit(oferta);
                                setMenuOpenId(null);
                              }}
                            >
                              <span className="material-icons mr-2 text-sm">edit</span>
                              Editar
                            </button>
                            <button
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              onClick={() => onDelete(oferta.id_oferta)}
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
            Mostrando {filtered.length} de {rows.length} ofertas
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
              <h2 className="text-2xl font-bold text-gray-800">
                {editing ? 'Editar Oferta' : 'Nueva Oferta'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg"
              >
                <span className="material-icons text-xl">close</span>
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <input
                  name="descripcion"
                  value={form.descripcion}
                  onChange={onChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Producto *
                  </label>
                  <select
                    name="id_producto"
                    value={form.id_producto}
                    onChange={onChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona un producto</option>
                    {productos.map((p) => (
                      <option key={p.id_producto} value={p.id_producto}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descuento (%) *
                  </label>
                  <input
                    type="number"
                    name="descuento_porcentaje"
                    value={form.descuento_porcentaje}
                    onChange={onChange}
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Inicio *
                  </label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={form.fecha_inicio}
                    onChange={onChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Fin *
                  </label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={form.fecha_fin}
                    onChange={onChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                  {editing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default OfertasView;
