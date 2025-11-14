import type {
  Resumen,
  TimelineItem,
  LowStockItem,
  EtiquetaValor,
  VentasMensuales,
} from 'src/services/reportes';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateResumenPdf(data: Resumen) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Resumen Semanal', pageWidth / 2, 50, { align: 'center' });

  // Fecha
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${new Date().toLocaleDateString('es-GT')}`, pageWidth / 2, 70, {
    align: 'center',
  });

  // Datos en tabla
  const tableData = [
    [
      'Ventas Semanales',
      `Q${data.ventasSemanales.total.toFixed(2)}`,
      `${data.ventasSemanales.porcentaje?.toFixed(2) ?? 0}%`,
    ],
    [
      'Nuevos Usuarios',
      data.nuevosUsuarios.total.toString(),
      `${data.nuevosUsuarios.porcentaje?.toFixed(2) ?? 0}%`,
    ],
    [
      'Compras Semanales',
      `Q${data.comprasSemanales.total.toFixed(2)}`,
      `${data.comprasSemanales.porcentaje?.toFixed(2) ?? 0}%`,
    ],
    [
      'Pedidos Pendientes',
      data.pedidosPendientesEntrega.total.toString(),
      `${data.pedidosPendientesEntrega.porcentaje?.toFixed(2) ?? 0}%`,
    ],
  ];

  autoTable(doc, {
    startY: 90,
    head: [['Indicador', 'Total', 'Variación %']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'left' },
    },
  });

  // Guardar PDF
  doc.save(`reporte-resumen-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateVentasMensualesPdf(data: VentasMensuales) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Ventas Mensuales', pageWidth / 2, 50, { align: 'center' });

  // Subtítulo
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Año ${new Date().getFullYear()}`, pageWidth / 2, 70, { align: 'center' });

  // Fecha
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-GT')}`, pageWidth / 2, 85, {
    align: 'center',
  });

  // Preparar datos para la tabla
  const tableData = data.categorias.map((mes, index) => [
    mes,
    `Q${data.seriesVentas[index].toFixed(2)}`,
    `Q${data.seriesCompras[index].toFixed(2)}`,
  ]);

  // Calcular totales
  const totalVentas = data.seriesVentas.reduce((sum, val) => sum + val, 0);
  const totalCompras = data.seriesCompras.reduce((sum, val) => sum + val, 0);

  // Agregar fila de totales
  tableData.push(['TOTAL', `Q${totalVentas.toFixed(2)}`, `Q${totalCompras.toFixed(2)}`]);

  autoTable(doc, {
    startY: 100,
    head: [['Mes', 'Ventas (Pedidos)', 'Compras (Facturas)']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      halign: 'right',
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (cellData: any) => {
      // Resaltar la fila de totales
      if (cellData.row.index === tableData.length - 1) {
        cellData.cell.styles.fillColor = [236, 240, 241];
        cellData.cell.styles.fontStyle = 'bold';
        cellData.cell.styles.textColor = [0, 0, 0];
      }
    },
  });

  // Guardar PDF
  doc.save(`reporte-ventas-mensuales-${new Date().getFullYear()}.pdf`);
}

export function generateStockPorCategoriaPdf(data: EtiquetaValor[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Stock por Categoría', pageWidth / 2, 50, { align: 'center' });

  // Fecha
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${new Date().toLocaleDateString('es-GT')}`, pageWidth / 2, 70, {
    align: 'center',
  });

  // Preparar datos para la tabla
  const tableData = data.map((item, index) => [
    (index + 1).toString(),
    item.etiqueta.trim(),
    item.valor.toLocaleString('es-GT'),
  ]);

  // Calcular total
  const totalStock = data.reduce((sum, item) => sum + item.valor, 0);

  // Agregar fila de total
  tableData.push(['', 'TOTAL', totalStock.toLocaleString('es-GT')]);

  autoTable(doc, {
    startY: 90,
    head: [['#', 'Categoría', 'Stock']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [155, 89, 182],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      halign: 'left',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 40 },
      1: { halign: 'left', cellWidth: 320 },
      2: { halign: 'right', cellWidth: 120 },
    },
    didParseCell: (cellData: any) => {
      // Resaltar la fila de total
      if (cellData.row.index === tableData.length - 1) {
        cellData.cell.styles.fillColor = [236, 240, 241];
        cellData.cell.styles.fontStyle = 'bold';
        cellData.cell.styles.textColor = [0, 0, 0];
      }
    },
  });

  // Guardar PDF
  doc.save(`reporte-stock-por-categoria-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateTopCategoriasPdf(data: EtiquetaValor[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Top Categorías por Ventas', pageWidth / 2, 50, { align: 'center' });

  // Fecha
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${new Date().toLocaleDateString('es-GT')}`, pageWidth / 2, 70, {
    align: 'center',
  });

  // Preparar datos para la tabla
  const tableData = data.map((item, index) => [
    (index + 1).toString(),
    item.etiqueta.trim(),
    `Q${item.valor.toFixed(2)}`,
  ]);

  // Calcular total
  const totalVentas = data.reduce((sum, item) => sum + item.valor, 0);

  // Agregar fila de total
  tableData.push(['', 'TOTAL', `Q${totalVentas.toFixed(2)}`]);

  autoTable(doc, {
    startY: 90,
    head: [['#', 'Categoría', 'Monto (Q)']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [230, 126, 34],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      halign: 'left',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 40 },
      1: { halign: 'left', cellWidth: 320 },
      2: { halign: 'right', cellWidth: 120 },
    },
    didParseCell: (cellData: any) => {
      // Resaltar la fila de total
      if (cellData.row.index === tableData.length - 1) {
        cellData.cell.styles.fillColor = [236, 240, 241];
        cellData.cell.styles.fontStyle = 'bold';
        cellData.cell.styles.textColor = [0, 0, 0];
      }
    },
  });

  // Guardar PDF
  doc.save(`reporte-top-categorias-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateTimelinePedidosPdf(data: TimelineItem[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Timeline de Pedidos Recientes', pageWidth / 2, 50, { align: 'center' });

  // Fecha
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${new Date().toLocaleDateString('es-GT')}`, pageWidth / 2, 70, {
    align: 'center',
  });

  // Preparar datos para la tabla
  const tableData = data.map((item) => {
    // Extraer el monto del título (ej: "Pedido #27 — Q15.75")
    const montoMatch = item.titulo.match(/Q([\d,.]+)/);
    const monto = montoMatch ? `Q${montoMatch[1]}` : '';
    
    // Extraer el número de pedido
    const pedidoMatch = item.titulo.match(/#(\d+)/);
    const numeroPedido = pedidoMatch ? `#${pedidoMatch[1]}` : '';

    // Formatear fecha
    const fecha = new Date(item.fecha);
    const fechaFormateada = fecha.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const horaFormateada = fecha.toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return [numeroPedido, monto, fechaFormateada, horaFormateada, item.tipo];
  });

  autoTable(doc, {
    startY: 90,
    head: [['Pedido', 'Monto', 'Fecha', 'Hora', 'Estado']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [52, 73, 94],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 80 },
      1: { halign: 'right', cellWidth: 100 },
      2: { halign: 'center', cellWidth: 100 },
      3: { halign: 'center', cellWidth: 80 },
      4: { halign: 'center', cellWidth: 100 },
    },
    didParseCell: (cellData: any) => {
      // Colorear el estado según el tipo
      if (cellData.column.index === 4) {
        const estado = cellData.cell.raw?.toLowerCase();
        if (estado === 'enviado') {
          cellData.cell.styles.textColor = [39, 174, 96];
          cellData.cell.styles.fontStyle = 'bold';
        } else if (estado === 'pendiente') {
          cellData.cell.styles.textColor = [243, 156, 18];
          cellData.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Guardar PDF
  doc.save(`reporte-timeline-pedidos-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateUsuariosPorRolPdf(data: EtiquetaValor[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Usuarios por Rol', pageWidth / 2, 50, { align: 'center' });

  // Fecha
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${new Date().toLocaleDateString('es-GT')}`, pageWidth / 2, 70, {
    align: 'center',
  });

  // Preparar datos para la tabla
  const tableData = data.map((item, index) => {
    // Calcular porcentaje
    const total = data.reduce((sum, i) => sum + i.valor, 0);
    const porcentaje = total > 0 ? ((item.valor / total) * 100).toFixed(1) : '0.0';
    
    return [
      (index + 1).toString(),
      item.etiqueta.trim(),
      item.valor.toString(),
      `${porcentaje}%`,
    ];
  });

  // Calcular total
  const totalUsuarios = data.reduce((sum, item) => sum + item.valor, 0);

  // Agregar fila de total
  tableData.push(['', 'TOTAL', totalUsuarios.toString(), '100%']);

  autoTable(doc, {
    startY: 90,
    head: [['#', 'Rol', 'Usuarios', 'Porcentaje']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [142, 68, 173],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 40 },
      1: { halign: 'left', cellWidth: 240 },
      2: { halign: 'center', cellWidth: 100 },
      3: { halign: 'center', cellWidth: 100 },
    },
    didParseCell: (cellData: any) => {
      // Resaltar la fila de total
      if (cellData.row.index === tableData.length - 1) {
        cellData.cell.styles.fillColor = [236, 240, 241];
        cellData.cell.styles.fontStyle = 'bold';
        cellData.cell.styles.textColor = [0, 0, 0];
      }
    },
  });

  // Guardar PDF
  doc.save(`reporte-usuarios-por-rol-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateStockBajoPdf(data: LowStockItem[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Alertas de Stock Bajo', pageWidth / 2, 50, { align: 'center' });

  // Subtítulo
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(231, 76, 60);
  doc.text(
    `⚠️ ${data.length} productos requieren atención inmediata`,
    pageWidth / 2,
    70,
    { align: 'center' }
  );
  doc.setTextColor(0, 0, 0);

  // Fecha
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-GT')}`, pageWidth / 2, 85, {
    align: 'center',
  });

  // Preparar datos para la tabla
  const tableData = data.map((item) => {
    const deficit = Math.max(0, item.stock_minimo - item.cantidad);
    const porcentaje = item.stock_minimo > 0
      ? ((item.cantidad / item.stock_minimo) * 100).toFixed(0)
      : '0';

    return [
      item.nombre.trim(),
      item.categoria?.trim() || 'Sin categoría',
      item.cantidad.toString(),
      item.stock_minimo.toString(),
      deficit.toString(),
      `${porcentaje}%`,
    ];
  });

  autoTable(doc, {
    startY: 100,
    head: [['Producto', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Faltante', '% Stock']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [231, 76, 60],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 200 },
      1: { halign: 'left', cellWidth: 150 },
      2: { halign: 'center', cellWidth: 80 },
      3: { halign: 'center', cellWidth: 80 },
      4: { halign: 'center', cellWidth: 80 },
      5: { halign: 'center', cellWidth: 80 },
    },
    didParseCell: (cellData: any) => {
      // Colorear según nivel de stock
      if (cellData.column.index === 5) {
        const porcentaje = parseInt(cellData.cell.raw?.toString().replace('%', '') || '0', 10);
        if (porcentaje === 0) {
          cellData.cell.styles.fillColor = [231, 76, 60];
          cellData.cell.styles.textColor = [255, 255, 255];
          cellData.cell.styles.fontStyle = 'bold';
        } else if (porcentaje < 50) {
          cellData.cell.styles.fillColor = [241, 196, 15];
          cellData.cell.styles.textColor = [0, 0, 0];
          cellData.cell.styles.fontStyle = 'bold';
        }
      }
      // Resaltar stock actual en rojo si es 0
      if (cellData.column.index === 2) {
        const stock = parseInt(cellData.cell.raw?.toString() || '0', 10);
        if (stock === 0) {
          cellData.cell.styles.textColor = [231, 76, 60];
          cellData.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Guardar PDF
  doc.save(`reporte-stock-bajo-${new Date().toISOString().split('T')[0]}.pdf`);
}
