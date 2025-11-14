import React, { useMemo, useState, useEffect } from 'react';

import { fDateTime } from 'src/utils/format-time';

import { listUsers, type Usuario } from 'src/services/usuarios';
import { listLogs, type Log, listLogsByUser } from 'src/services/logs';


type EstadoFilter = 'todos';

const LogsView: React.FC = () => {
  const [rows, setRows] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [estadoFilter] = useState<EstadoFilter>('todos');

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const perPageOptions = [10, 25, 50];

  const [selectedUser, setSelectedUser] = useState<number | 'todos'>('todos');
  const [users, setUsers] = useState<Usuario[]>([]);

  const [selectedMethod, setSelectedMethod] = useState<'todos'|'GET'|'POST'|'PUT'|'PATCH'|'DELETE'|'OPTIONS'>('todos');

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const u = await listUsers();
        setUsers(Array.isArray(u) ? u : []);
      } catch (e) {
        console.error('Error listando usuarios:', e);
        setUsers([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (selectedUser === 'todos') {
          const data = await listLogs();
          setRows(Array.isArray(data) ? data : []);
        } else {
          const data = await listLogsByUser(selectedUser as number);
          setRows(Array.isArray(data) ? data : []);
        }
      } catch (e: any) {
        console.error('Error listando logs por usuario:', e);
        setRows([]);
        setError(e?.message || 'Error cargando logs.');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedUser]);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();

    const from = fromDate ? new Date(fromDate + 'T00:00:00') : null;
    const to = toDate ? new Date(toDate + 'T23:59:59.999') : null;

    return rows
      .filter((r) => r.accion.toLowerCase().includes(s))
      .filter((r) => {
        if (selectedMethod === 'todos') return true;
        const m = (r.accion.match(/^\s*([A-Z]+)\s*:/)?.[1] || '').toUpperCase();
        return m === selectedMethod;
      })
      .filter((r) => {
        if (!from && !to) return true;
        const d = new Date(r.created_at);
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
  }, [rows, q, fromDate, toDate, selectedMethod]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const currentRows = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  if (loading) return <div className="p-8">Cargando logs…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  const startIndex = total === 0 ? 0 : (page - 1) * perPage + 1;
  const endIndex = Math.min(page * perPage, total);

  return (
    <main className="p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Actividades de los usuarios</h1>
      </header>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div className="relative w-full md:w-1/2">
            <span className="material-icons absolute left-3 top-2.5 text-gray-400" style={{ fontSize: 20 }}>
              search
            </span>
            <input
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar por acción…"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-500">Por usuario</label>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedUser}
              onChange={(e) => { setSelectedUser(e.target.value === 'todos' ? 'todos' : Number(e.target.value)); setPage(1); }}
            >
              <option value="todos">Todos</option>
              {users.map((u) => (
                <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>
              ))}
            </select>

            <label className="text-sm text-gray-500">Por método</label>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedMethod}
              onChange={(e) => { setSelectedMethod(e.target.value as any); setPage(1); }}
            >
              <option value="todos">Todos</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
              <option value="OPTIONS">OPTIONS</option>
            </select>

            <div className="flex items-center gap-2">
               <label className="text-sm text-gray-500">Desde</label>
               <input
                 type="date"
                 value={fromDate}
                 onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                 className="px-2 py-1 border rounded-lg text-sm"
               />
             </div>

             <div className="flex items-center gap-2">
               <label className="text-sm text-gray-500">Hasta</label>
               <input
                 type="date"
                 value={toDate}
                 onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                 className="px-2 py-1 border rounded-lg text-sm"
               />
             </div>

             <button
               onClick={() => { setFromDate(''); setToDate(''); setPage(1); }}
               className="px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-700 hover:bg-gray-200"
               title="Limpiar fechas"
             >
               Limpiar
             </button>
           </div>
         </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <thead className="bg-gray-50 text-gray-500 uppercase text-sm font-semibold">
              <tr>
                <th className="p-4 w-12"><input className="rounded" type="checkbox" /></th>
                <th className="p-4 w-24">ID</th>
                <th className="p-4">Acción</th>
                <th className="p-4 w-48">Fecha</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentRows.map((r) => (
                <tr key={r.id_log} className="border-b hover:bg-gray-50">
                  <td className="p-4"><input className="rounded" type="checkbox" /></td>
                  <td className="p-4">{r.id_log}</td>
                  <td className="p-4 break-words">{r.accion}</td>
                  <td className="p-4">{fDateTime(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            Mostrando {startIndex}-{endIndex} de {total} registros
          </div>

          <div className="flex items-center space-x-1">
            <button
              className="px-3 py-1 rounded-md text-gray-500 hover:bg-gray-200"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <span className="material-icons">chevron_left</span>
            </button>

            <div className="px-3 py-1 rounded-md bg-blue-500 text-white">{page}</div>

            <button
              className="px-3 py-1 rounded-md text-gray-500 hover:bg-gray-200"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <span className="material-icons">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LogsView;
