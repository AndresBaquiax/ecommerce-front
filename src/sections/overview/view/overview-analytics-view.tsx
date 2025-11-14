import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useAuth } from 'src/hooks/use-auth';

import {
  generateResumenPdf,
  generateStockBajoPdf,
  generateTopCategoriasPdf,
  generateUsuariosPorRolPdf,
  generateVentasMensualesPdf,
  generateTimelinePedidosPdf,
  generateStockPorCategoriaPdf,
} from 'src/utils/generateReportePdf';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  getResumen,
  type Resumen,
  getStockBajo,
  getTopCategorias,
  getUsuariosPorRol,
  type TimelineItem,
  type LowStockItem,
  getVentasMensuales,
  getTimelinePedidos,
  type EtiquetaValor,
  getStockPorCategoria, type VentasMensuales,
} from 'src/services/reportes';

import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsOrderTimeline } from '../analytics-order-timeline';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsCurrentSubject } from '../analytics-current-subject';
import { AnalyticsConversionRates } from '../analytics-conversion-rates';


export function OverviewAnalyticsView() {
  const { user } = useAuth();

  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [mensual, setMensual] = useState<VentasMensuales | null>(null);
  const [stockCat, setStockCat] = useState<EtiquetaValor[]>([]);
  const [topCats, setTopCats] = useState<EtiquetaValor[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [usuariosRol, setUsuariosRol] = useState<EtiquetaValor[]>([]);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);

  const handleGenerarResumenPdf = async () => {
    try {
      const data = await getResumen();
      generateResumenPdf(data);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Error al generar el reporte PDF');
    }
  };

  const handleGenerarVentasMensualesPdf = async () => {
    try {
      const data = await getVentasMensuales();
      generateVentasMensualesPdf(data);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Error al generar el reporte PDF');
    }
  };

  const handleGenerarStockPorCategoriaPdf = async () => {
    try {
      const data = await getStockPorCategoria();
      generateStockPorCategoriaPdf(data);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Error al generar el reporte PDF');
    }
  };

  const handleGenerarTopCategoriasPdf = async () => {
    try {
      const data = await getTopCategorias();
      generateTopCategoriasPdf(data);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Error al generar el reporte PDF');
    }
  };

  const handleGenerarTimelinePedidosPdf = async () => {
    try {
      const data = await getTimelinePedidos();
      generateTimelinePedidosPdf(data);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Error al generar el reporte PDF');
    }
  };

  const handleGenerarUsuariosPorRolPdf = async () => {
    try {
      const data = await getUsuariosPorRol();
      generateUsuariosPorRolPdf(data);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Error al generar el reporte PDF');
    }
  };

  const handleGenerarStockBajoPdf = async () => {
    try {
      const data = await getStockBajo();
      generateStockBajoPdf(data);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Error al generar el reporte PDF');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [r, vm, sc, tc, tl, ur, ls] = await Promise.all([
          getResumen(),
          getVentasMensuales(),
          getStockPorCategoria(),
          getTopCategorias(),
          getTimelinePedidos(),
          getUsuariosPorRol(),
          getStockBajo(),
        ]);
        setResumen(r);
        setMensual(vm);
        setStockCat(sc);
        setTopCats(tc);
        setTimeline(tl);
        setUsuariosRol(ur);
        setLowStock(ls);
      } catch (err) {
        console.error('Error cargando dashboard:', err);
      }
    })();
  }, []);

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hola, bienvenido {user?.nombre || 'back'} 👋
      </Typography>

      <Grid container spacing={3}>
        {/* KPI: Ventas semanales (Facturas tipo Venta) */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Ventas semanales"
            percent={resumen?.ventasSemanales.porcentaje ?? 0}
            total={resumen?.ventasSemanales.total ?? 0}
            icon={<img alt="Ventas" src="/assets/icons/glass/ic-glass-bag.svg" />}
            chart={{ categories: [], series: [] }}
          />
        </Grid>

        {/* KPI: Nuevos usuarios (semanal) */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Nuevos usuarios"
            percent={resumen?.nuevosUsuarios.porcentaje ?? 0}
            total={resumen?.nuevosUsuarios.total ?? 0}
            color="secondary"
            icon={<img alt="Usuarios" src="/assets/icons/glass/ic-glass-users.svg" />}
            chart={{ categories: [], series: [] }}
          />
        </Grid>

        {/* KPI: Compras semanales (Facturas tipo Compra) */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Compras semanales"
            percent={resumen?.comprasSemanales.porcentaje ?? 0}
            total={resumen?.comprasSemanales.total ?? 0}
            color="warning"
            icon={<img alt="Compras" src="/assets/icons/glass/ic-glass-buy.svg" />}
            chart={{ categories: [], series: [] }}
          />
        </Grid>

        {/* KPI: Pedidos pendientes (acumulado) */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Pendientes de entrega"
            percent={resumen?.pedidosPendientesEntrega.porcentaje ?? 0}
            total={resumen?.pedidosPendientesEntrega.total ?? 0}
            color="error"
            icon={<img alt="Pendientes" src="/assets/icons/glass/ic-glass-message.svg" />}
            chart={{ categories: [], series: [] }}
          />
        </Grid>

        {/* Pie: Stock por categoría */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentVisits
            title="Stock por categoría"
            chart={{
              series: stockCat.map((it) => ({ label: it.etiqueta, value: it.valor })),
            }}
          />
        </Grid>

        {/* Líneas: Ventas (Pedidos) vs Compras (Facturas) por mes */}
        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsWebsiteVisits
            title="Ventas vs Compras"
            subheader={`Año ${new Date().getFullYear()}`}
            chart={{
              categories: mensual?.categorias ?? [],
              series: [
                { name: 'Ventas (Pedidos)', data: mensual?.seriesVentas ?? [] },
                { name: 'Compras (Facturas)', data: mensual?.seriesCompras ?? [] },
              ],
            }}
          />
        </Grid>

        {/* Barras: Top categorías por ventas */}
        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsConversionRates
            title="Top categorías por ventas"
            subheader="Monto (Q)"
            chart={{
              categories: topCats.map((t) => t.etiqueta),
              series: [{ name: 'Ventas', data: topCats.map((t) => t.valor) }],
            }}
          />
        </Grid>

        {/* Radar: Usuarios por rol */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentSubject
            title="Usuarios por rol"
            chart={{
              categories: usuariosRol.map((r) => r.etiqueta),
              series: [{ name: 'Usuarios', data: usuariosRol.map((r) => r.valor) }],
            }}
          />
        </Grid>

        {/* Alertas de stock bajo */}
<Grid size={{ xs: 12, md: 12, lg: 6 }}>
  <div className="rounded-2xl border border-divider px-3 py-2">
    <Typography variant="h6" sx={{ mb: 1.5 }}>
      Alertas de stock bajo
    </Typography>

    {lowStock.length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        Todo en orden. No hay productos por debajo del mínimo.
      </Typography>
    ) : (
      <div style={{ display: 'grid', gap: 8 }}>
        {lowStock.slice(0, 8).map((it) => {
          const deficit = Math.max(0, (it.stock_minimo ?? 0) - (it.cantidad ?? 0));
          return (
            <div
              key={`${it.id_inventario}-${it.id_producto}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 12,
                background: 'rgba(244, 67, 54, 0.06)',
                border: '1px solid rgba(244, 67, 54, 0.2)',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  {it.nombre}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {it.categoria ?? 'Sin categoría'}
                </Typography>
              </div>

              <div style={{ textAlign: 'right' }}>
                <Typography variant="body2">
                  Stock: <strong>{it.cantidad}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Mín.: {it.stock_minimo} {deficit > 0 ? ` • Falta ${deficit}` : ''}
                </Typography>
              </div>
            </div>
          );
        })}

        {lowStock.length > 8 && (
          <Typography variant="caption" color="text.secondary">
            y {lowStock.length - 8} más…
          </Typography>
        )}
      </div>
    )}
  </div>
</Grid>

        {/* Opcionales del template */}
        <Grid size={{ xs: 12 }}>
          <AnalyticsOrderTimeline
            title="Pedidos recientes"
            list={timeline.map((t) => ({
              id: String(t.id),
              title: t.titulo,
              time: t.fecha,
              type: t.tipo,
            }))}
          />
        </Grid>

        {/* Sección de Reportes PDF */}
        <Grid size={{ xs: 12 }}>
          <div className="rounded-2xl border border-divider px-6 py-4">
            <Typography variant="h6" sx={{ mb: 3 }}>
              Generar Reportes PDF
            </Typography>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerarResumenPdf}
                sx={{ minWidth: 200 }}
              >
                📊 Reporte Resumen
              </Button>
              
              <Button
                variant="contained"
                color="secondary"
                onClick={handleGenerarVentasMensualesPdf}
                sx={{ minWidth: 200 }}
              >
                📈 Ventas Mensuales
              </Button>
              
              <Button
                variant="contained"
                color="info"
                onClick={handleGenerarStockPorCategoriaPdf}
                sx={{ minWidth: 200 }}
              >
                📦 Stock por Categoría
              </Button>
              
              <Button
                variant="contained"
                color="warning"
                onClick={handleGenerarTopCategoriasPdf}
                sx={{ minWidth: 200 }}
              >
                🏆 Top Categorías
              </Button>
              
              <Button
                variant="contained"
                color="info"
                onClick={handleGenerarUsuariosPorRolPdf}
                sx={{ minWidth: 200 }}
              >
                👥 Usuarios por Rol
              </Button>
              
              <Button
                variant="contained"
                color="error"
                onClick={handleGenerarStockBajoPdf}
                sx={{ minWidth: 200 }}
              >
                ⚠️ Alertas de Stock
              </Button>
              
              <Button
                variant="contained"
                color="success"
                onClick={handleGenerarTimelinePedidosPdf}
                sx={{ minWidth: 200 }}
              >
                📋 Timeline Pedidos
              </Button>
            </div>
          </div>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
