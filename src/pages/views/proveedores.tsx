import React, { useMemo, useState, useEffect } from 'react';

import {
  listProviders,
  type Proveedor,
  createProvider,
  updateProvider,
  deleteProvider,
} from 'src/services/proveedores';

type FormState = {
  nombre: string;
  telefono: string;
  nit: string;
};

type EstadoFilter = 'todos' | 'activos' | 'inactivos';

const EMPTY_FORM: FormState = { nombre: '', telefono: '', nit: '' };

const ProveedoresView: React.FC = () => {
  const [rows, setRows] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('todos');

  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Proveedor | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [estado, setEstado] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await listProviders();
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Error listando proveedores:', e);
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
    return rows
      .filter(
        (r) =>
          r.nombre.toLowerCase().includes(s) ||
          r.telefono.toLowerCase().includes(s) ||
          r.nit.toLowerCase().includes(s)
      )
      .filter((r) => {
        if (estadoFilter === 'activos') return r.estado === true;
        if (estadoFilter === 'inactivos') return r.estado === false;
        return true;
      });
  }, [rows, q, estadoFilter]);

  const activos = rows.filter((r) => r.estado).length;
  const inactivos = rows.length - activos;

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setEstado(true);
    setShowModal(true);
  };

  const openEdit = (r: Proveedor) => {
    setEditing(r);
    setForm({ nombre: r.nombre, telefono: r.telefono, nit: r.nit });
    setEstado(r.estado);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setEstado(true);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        const updated = await updateProvider(editing.id_proveedor, { ...form, estado });
        setRows((prev) => prev.map((p) => (p.id_proveedor === editing.id_proveedor ? updated : p)));
      } else {
        const created = await createProvider({ ...form });
        setRows((prev) => [created, ...prev]);
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error guardando el proveedor.');
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm('¿Eliminar (desactivar) este proveedor?')) return;
    try {
      const msg = await deleteProvider(id);
      if (typeof msg === 'string') alert(msg);
      setRows((prev) => prev.map((p) => (p.id_proveedor === id ? { ...p, estado: false } : p)));
    } catch (err) {
      console.error(err);
      alert('No se pudo eliminar.');
    }
  };

  if (loading) return <div className="p-8">Cargando proveedores…</div>;

  return (
    <main className="p-8">
      {}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Proveedores</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600"
          onClick={openCreate}
        >
          <span className="material-icons mr-1 align-middle">add</span>
          Nuevo Proveedor
        </button>
      </header>

      {}
      <div className="bg-white rounded-lg shadow-md p-6">
        {}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div className="relative">
            <span className="material-icons absolute left-3 top-2.5 text-gray-400" style={{ fontSize: 20 }}>
              search
            </span>
            <input
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar proveedor…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value as EstadoFilter)}
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </div>

        {}
        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <thead className="bg-gray-50 text-gray-500 uppercase text-sm font-semibold">
              <tr>
                <th className="p-4 w-12">
                  <input className="rounded" type="checkbox" />
                </th>
                <th className="p-4 w-56">Nombre</th>
                <th className="p-4 w-40">Teléfono</th>
                <th className="p-4 w-40">NIT</th>
                <th className="p-4 w-24">Estado</th>
                <th className="p-4 w-16" />
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {filtered.map((p) => (
                <tr key={p.id_proveedor} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <input className="rounded" type="checkbox" />
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{p.nombre}</div>
                    <div className="text-sm text-gray-500">ID: {p.id_proveedor}</div>
                  </td>
                  <td className="p-4">{p.telefono}</td>
                  <td className="p-4">{p.nit}</td>
                  <td className="p-4">
                    <span
                      className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${
                        p.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {p.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="relative dropdown-container">
                      <button
                        className="p-2 text-gray-500 hover:text-gray-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === p.id_proveedor ? null : p.id_proveedor);
                        }}
                      >
                        <span className="material-icons">more_vert</span>
                      </button>

                      {menuOpenId === p.id_proveedor && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                          <div className="py-1">
                            <button
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                openEdit(p);
                                setMenuOpenId(null);
                              }}
                            >
                              <span className="material-icons mr-2 text-sm">edit</span>
                              Editar
                            </button>
                            <button
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              onClick={() => onDelete(p.id_proveedor)}
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

        {}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            Mostrando {filtered.length} de {rows.length} proveedores — Activos: {activos} · Inactivos: {inactivos}
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

      {}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-xl mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={onChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={onChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIT *</label>
                  <input
                    name="nit"
                    value={form.nit}
                    onChange={onChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {editing && (
                <div className="flex items-center gap-3">
                  <input
                    id="estado"
                    type="checkbox"
                    checked={estado}
                    onChange={(e) => setEstado(e.target.checked)}
                  />
                  <label htmlFor="estado" className="text-sm text-gray-700">
                    Activo
                  </label>
                </div>
              )}

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

export default ProveedoresView;
