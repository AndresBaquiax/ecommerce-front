import React, { useEffect, useMemo, useState } from 'react';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { listActiveProviders, type Proveedor } from 'src/services/proveedores';
import { registrarCompra, type RegistrarCompraDTO } from 'src/services/compras';
import { listActiveInventory, type InventarioItem } from 'src/services/inventario';

type DetalleForm = {
  id_inventario: number;
  cantidad: number;
  precio_unitario: number;
  fecha_vencimiento: string;
};

type FormState = {
  fecha: string;
  id_proveedor: number;
  descuento: number; // % (0-100)
  detalleProductos: DetalleForm[];
};

const EMPTY_FORM: FormState = {
  fecha: new Date().toISOString().split('T')[0],
  id_proveedor: 0,
  descuento: 0,
  detalleProductos: [],
};

const money = (v: number | undefined) =>
  `Q${Number(v ?? 0).toFixed(2)}`;

export default function ComprasView() {
  const router = useRouter();

  // datos base
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [inventario, setInventario] = useState<InventarioItem[]>([]);

  // ui / estado
  const [loadingBase, setLoadingBase] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // formulario
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  // Cargar proveedores + inventario (activos)
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        setLoadingBase(true);
        const [prov, inv] = await Promise.all([
          listActiveProviders(),
          listActiveInventory(),
        ]);
        setProveedores(prov);
        setInventario(inv);
      } catch (err: any) {
        setError(err?.message || 'No se pudo cargar datos base');
      } finally {
        setLoadingBase(false);
      }
    })();
  }, []);

  // Cálculos
  const subtotal = useMemo(
    () =>
      form.detalleProductos.reduce(
        (acc, d) => acc + (Number(d.cantidad || 0) * Number(d.precio_unitario || 0)),
        0,
      ),
    [form.detalleProductos],
  );

  const total = useMemo(() => {
    const desc = Math.min(Math.max(Number(form.descuento || 0), 0), 100);
    const montoDesc = (subtotal * desc) / 100;
    return subtotal - montoDesc;
  }, [subtotal, form.descuento]);

  // Handlers de formulario
  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addDetalle = () =>
    setForm((prev) => ({
      ...prev,
      detalleProductos: [
        ...prev.detalleProductos,
        { id_inventario: 0, cantidad: 1, precio_unitario: 0, fecha_vencimiento: '' },
      ],
    }));

  const removeDetalle = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      detalleProductos: prev.detalleProductos.filter((_, i) => i !== idx),
    }));

  const updateDetalle = <K extends keyof DetalleForm>(
    idx: number,
    key: K,
    value: DetalleForm[K],
  ) =>
    setForm((prev) => {
      const next = [...prev.detalleProductos];
      next[idx] = { ...next[idx], [key]: value };

      // si se escogió inventario, autocompletar precio con el del producto
      if (key === 'id_inventario') {
        const found = inventario.find((x) => x.id_inventario === Number(value));
        if (found) next[idx].precio_unitario = Number(found.producto.precio_unitario || 0);
      }

      return { ...prev, detalleProductos: next };
    });

  // Submit
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.id_proveedor) {
      setError('Selecciona un proveedor');
      return;
    }
    if (form.detalleProductos.length === 0) {
      setError('Agrega al menos un producto');
      return;
    }
    const incompleto = form.detalleProductos.some(
      (d) =>
        !d.id_inventario ||
        !d.cantidad ||
        !d.precio_unitario ||
        !d.fecha_vencimiento,
    );
    if (incompleto) {
      setError('Completa todos los campos de cada producto');
      return;
    }

    const payload: RegistrarCompraDTO = {
      tipo: 'Compra',
      fecha: form.fecha,
      subtotal,
      total,
      descuento: Number(form.descuento || 0),
      id_proveedor: form.id_proveedor,
      detalleProductos: form.detalleProductos.map((d) => ({
        id_inventario: Number(d.id_inventario),
        cantidad: Number(d.cantidad),
        precio_unitario: Number(d.precio_unitario),
        fecha_vencimiento: d.fecha_vencimiento,
      })),
    };

    try {
      setLoadingSubmit(true);
      await registrarCompra(payload);
      alert('Compra registrada exitosamente');
      // reset form
      setForm(EMPTY_FORM);
      // si quieres redirigir: router.push('/compras') o quedarte en la vista
    } catch (err: any) {
      setError(err?.message || 'No se pudo registrar la compra');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingBase) {
    return (
      <DashboardContent maxWidth="xl">
        <div className="p-6">Cargando datos…</div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <h1 className="text-2xl font-bold mb-6">Registrar compra</h1>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-16">
        {/* Cabecera */}
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha *</label>
              <input
                type="date"
                value={form.fecha}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setField('fecha', e.target.value)}
                className="w-full rounded border px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Proveedor *</label>
              <select
                value={form.id_proveedor}
                onChange={(e) => setField('id_proveedor', Number(e.target.value))}
                className="w-full rounded border px-3 py-2"
                required
              >
                <option value={0}>Seleccione…</option>
                {proveedores.map((p) => (
                  <option key={p.id_proveedor} value={p.id_proveedor}>
                    {p.nombre} — NIT: {p.nit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Descuento (%) — opcional
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={form.descuento}
                onChange={(e) => setField('descuento', Number(e.target.value || 0))}
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </div>
        </section>

        {/* Detalles */}
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Productos</h2>
            <button
              type="button"
              onClick={addDetalle}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Agregar producto
            </button>
          </div>

          {form.detalleProductos.length === 0 ? (
            <div className="text-sm text-gray-500">Aún no has agregado productos.</div>
          ) : (
            <div className="space-y-4">
              {form.detalleProductos.map((d, idx) => (
                <div key={idx} className="grid md:grid-cols-5 gap-3 items-end border rounded p-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Producto (inventario) *
                    </label>
                    <select
                      value={d.id_inventario}
                      onChange={(e) => updateDetalle(idx, 'id_inventario', Number(e.target.value))}
                      className="w-full rounded border px-3 py-2"
                      required
                    >
                      <option value={0}>Seleccione…</option>
                      {inventario.map((item) => (
                        <option key={item.id_inventario} value={item.id_inventario}>
                          {item.producto.nombre} (stock: {item.cantidad}) — {money(item.producto.precio_unitario)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Cantidad *</label>
                    <input
                      type="number"
                      min={1}
                      value={d.cantidad}
                      onChange={(e) => updateDetalle(idx, 'cantidad', Number(e.target.value || 1))}
                      className="w-full rounded border px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Precio unit. *</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={d.precio_unitario}
                      onChange={(e) => updateDetalle(idx, 'precio_unitario', Number(e.target.value || 0))}
                      className="w-full rounded border px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Fecha vencimiento *
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={d.fecha_vencimiento}
                      onChange={(e) => updateDetalle(idx, 'fecha_vencimiento', e.target.value)}
                      className="w-full rounded border px-3 py-2"
                      required
                    />
                  </div>

                  <div className="md:col-span-5 flex items-center justify-between pt-1">
                    <div className="text-sm text-gray-600">
                      Subtotal ítem:{' '}
                      <strong>{money(Number(d.cantidad || 0) * Number(d.precio_unitario || 0))}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDetalle(idx)}
                      className="rounded border border-red-300 px-3 py-1 text-red-600 hover:bg-red-50"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Totales */}
        <section className="bg-white rounded-lg shadow p-6 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <strong>{money(subtotal)}</strong>
          </div>
          {form.descuento > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Descuento ({form.descuento}%):</span>
              <strong>-{money((subtotal * form.descuento) / 100)}</strong>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 text-lg">
            <span>Total:</span>
            <strong>{money(total)}</strong>
          </div>
        </section>

        {/* Acciones */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setForm(EMPTY_FORM)}
            className="rounded border px-4 py-2 hover:bg-gray-50"
            disabled={loadingSubmit}
          >
            Limpiar
          </button>
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={
              loadingSubmit ||
              !form.id_proveedor ||
              form.detalleProductos.length === 0
            }
          >
            {loadingSubmit ? 'Registrando…' : 'Registrar compra'}
          </button>
        </div>
      </form>
    </DashboardContent>
  );
}
