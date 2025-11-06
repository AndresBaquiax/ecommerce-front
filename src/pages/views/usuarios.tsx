import React, { useMemo, useState, useEffect } from 'react';

import { type Rol, listRoles } from 'src/services/roles';
import { listUsers, createUser, updateUser, deleteUser, type Usuario } from 'src/services/usuarios';

type EstadoFilter = 'todos' | 'activos' | 'inactivos';

type FormState = {
  nombre: string;
  telefono: string;
  direccion?: string;
  correo: string;
  id_rol: number | '';
  contrasena?: string;
};

const EMPTY_FORM: FormState = {
  nombre: '',
  telefono: '',
  direccion: '',
  correo: '',
  id_rol: '',
  contrasena: '',
};

const UsuariosView: React.FC = () => {
  const [rows, setRows] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('todos');
  const [rolFilter, setRolFilter] = useState<number | 'todos'>('todos');

  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [estado, setEstado] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [u, r] = await Promise.all([listUsers(), listRoles()]);
        setRows(Array.isArray(u) ? u : []);
        setRoles(Array.isArray(r) ? r : []);
      } catch (e) {
        console.error(e);
        setRows([]);
        setRoles([]);
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
      .filter((r) =>
        r.nombre.toLowerCase().includes(s) ||
        r.correo.toLowerCase().includes(s) ||
        r.telefono.toLowerCase().includes(s) ||
        (r.rol?.nombre || '').toLowerCase().includes(s)
      )
      .filter((r) => {
        if (estadoFilter === 'activos') return r.estado === true;
        if (estadoFilter === 'inactivos') return r.estado === false;
        return true;
      })
      .filter((r) => (rolFilter === 'todos' ? true : r.rol?.id_rol === rolFilter));
  }, [rows, q, estadoFilter, rolFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setEstado(true);
    setShowModal(true);
  };

  const openEdit = (u: Usuario) => {
    setEditing(u);
    setForm({
      nombre: u.nombre,
      telefono: u.telefono,
      direccion: u.direccion ?? '',
      correo: u.correo,
      id_rol: u.rol?.id_rol ?? '',
      contrasena: '',
    });
    setEstado(u.estado);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setEstado(true);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'id_rol' ? (value === '' ? '' : Number(value)) : value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        const payload: any = {
          nombre: form.nombre,
          telefono: form.telefono,
          direccion: form.direccion || undefined,
          correo: form.correo,
          id_rol: typeof form.id_rol === 'number' ? form.id_rol : undefined,
          estado,
        };
        if (form.contrasena && form.contrasena.trim().length >= 6) {
          payload.contrasena = form.contrasena.trim();
        }
        const updated = await updateUser(editing.id_usuario, payload);
        setRows((prev) => prev.map((x) => (x.id_usuario === editing.id_usuario ? updated : x)));
      } else {
        if (!form.contrasena || form.contrasena.trim().length < 6) {
          alert('La contraseña debe tener al menos 6 caracteres.');
          return;
        }
        if (typeof form.id_rol !== 'number') {
          alert('Selecciona un rol.');
          return;
        }
        const created = await createUser({
          nombre: form.nombre,
          telefono: form.telefono,
          direccion: form.direccion || undefined,
          correo: form.correo,
          contrasena: form.contrasena.trim(),
          id_rol: form.id_rol,
          estado: true,
        });
        setRows((prev) => [created, ...prev]);
      }
      closeModal();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Error guardando el usuario.');
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm('¿Desactivar este usuario?')) return;
    try {
      const msg = await deleteUser(id);
      alert(typeof msg === 'string' ? msg : 'Usuario desactivado');
      setRows((prev) => prev.map((x) => (x.id_usuario === id ? { ...x, estado: false } : x)));
    } catch (err) {
      console.error(err);
      alert('No se pudo desactivar.');
    }
  };

  if (loading) return <div className="p-8">Cargando usuarios…</div>;

  const activos = rows.filter((r) => r.estado).length;
  const inactivos = rows.length - activos;

  return (
    <main className="p-8">
      {}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600"
          onClick={openCreate}
        >
          <span className="material-icons mr-1 align-middle">add</span>
          Nuevo Usuario
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
              placeholder="Buscar por nombre, correo, teléfono o rol…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value as EstadoFilter)}
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={rolFilter}
              onChange={(e) => setRolFilter(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
            >
              <option value="todos">Todos los roles</option>
              {roles.map((r) => (
                <option key={r.id_rol} value={r.id_rol}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {}
        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <thead className="bg-gray-50 text-gray-500 uppercase text-sm font-semibold">
              <tr>
                <th className="p-4 w-12"><input className="rounded" type="checkbox" /></th>
                <th className="p-4 w-56">Nombre</th>
                <th className="p-4 w-56">Correo</th>
                <th className="p-4 w-40">Teléfono</th>
                <th className="p-4 w-32">Rol</th>
                <th className="p-4 w-28">Estado</th>
                <th className="p-4 w-16" />
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {filtered.map((u) => (
                <tr key={u.id_usuario} className="border-b hover:bg-gray-50">
                  <td className="p-4"><input className="rounded" type="checkbox" /></td>
                  <td className="p-4">
                    <div className="font-medium">{u.nombre}</div>
                    <div className="text-sm text-gray-500">ID: {u.id_usuario}</div>
                  </td>
                  <td className="p-4 break-words">{u.correo}</td>
                  <td className="p-4">{u.telefono}</td>
                  <td className="p-4">{u.rol?.nombre || '-'}</td>
                  <td className="p-4">
                    <span
                      className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${
                        u.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {u.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="relative dropdown-container">
                      <button
                        className="p-2 text-gray-500 hover:text-gray-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === u.id_usuario ? null : u.id_usuario);
                        }}
                      >
                        <span className="material-icons">more_vert</span>
                      </button>

                      {menuOpenId === u.id_usuario && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                          <div className="py-1">
                            <button
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                openEdit(u);
                                setMenuOpenId(null);
                              }}
                            >
                              <span className="material-icons mr-2 text-sm">edit</span>
                              Editar
                            </button>
                            <button
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              onClick={() => onDelete(u.id_usuario)}
                            >
                              <span className="material-icons mr-2 text-sm">delete</span>
                              Desactivar
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
            Mostrando {filtered.length} de {rows.length} usuarios — Activos: {activos} · Inactivos: {inactivos}
          </div>
          <div className="flex items-center space-x-1">
            <button className="px-3 py-1 rounded-md text-gray-500 hover:bg-gray-200"><span className="material-icons">chevron_left</span></button>
            <button className="px-3 py-1 rounded-md bg-blue-500 text-white">1</button>
            <button className="px-3 py-1 rounded-md text-gray-700 hover:bg-gray-200">2</button>
            <button className="px-3 py-1 rounded-md text-gray-500 hover:bg-gray-200"><span className="material-icons">chevron_right</span></button>
          </div>
        </div>
      </div>

      {}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg">
                <span className="material-icons text-xl">close</span>
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input name="nombre" value={form.nombre} onChange={onChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo *</label>
                  <input type="email" name="correo" value={form.correo} onChange={onChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                  <input name="telefono" value={form.telefono} onChange={onChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                  <select name="id_rol" value={form.id_rol} onChange={onChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Selecciona un rol</option>
                    {roles.map((r) => (
                      <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <textarea name="direccion" value={form.direccion} onChange={onChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>

              {}
              {!editing ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                  <input type="password" name="contrasena" value={form.contrasena} onChange={onChange} required minLength={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cambiar contraseña (opcional)</label>
                  <input type="password" name="contrasena" value={form.contrasena} onChange={onChange} placeholder="Deja vacío para no cambiar" minLength={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              )}

              {editing && (
                <div className="flex items-center gap-3">
                  <input id="estado" type="checkbox" checked={estado} onChange={(e) => setEstado(e.target.checked)} />
                  <label htmlFor="estado" className="text-sm text-gray-700">Activo</label>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">{editing ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default UsuariosView;
