/**
 * ============================================================================
 * ARCHIVO: DetallesPagosTabla.tsx
 * COMPONENTE: Tabla de detalles de pagos con filtros (estado, método) + export.
 * Usado en la tab "Finanzas" del ReporteTabs.
 * Estilos con tokens del sistema (claro-* / oscuro-*).
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { reporteApi } from './reporte.api';
import type { DetallePagoItem } from './reporte.types';

interface Props {
  fechaInicio: string;
  fechaFin: string;
}

export const DetallesPagosTabla: React.FC<Props> = ({ fechaInicio, fechaFin }) => {
  const [pagos, setPagos] = useState<DetallePagoItem[]>([]);
  const [cargando, setCargando] = useState(false);

  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroMetodo, setFiltroMetodo] = useState('todos');

  useEffect(() => {
    const obtenerDetallesPagos = async () => {
      if (!fechaInicio || !fechaFin) return;
      setCargando(true);

      try {
        const data = await reporteApi.detallesPagos({ fechaInicio, fechaFin });
        setPagos(data);
      } catch (error) {
        console.error('Error al obtener los detalles de pagos:', error);
      } finally {
        setCargando(false);
      }
    };

    obtenerDetallesPagos();
  }, [fechaInicio, fechaFin]);

  const pagosFiltrados = pagos.filter((pago) => {
    const cumpleEstado =
      filtroEstado === 'todos' ||
      pago.estado?.toLowerCase() === filtroEstado.toLowerCase();
    const cumpleMetodo =
      filtroMetodo === 'todos' ||
      pago.metodo?.toLowerCase() === filtroMetodo.toLowerCase();

    return cumpleEstado && cumpleMetodo;
  });

  const hayFiltrosActivos =
    filtroEstado !== 'todos' || filtroMetodo !== 'todos';

  const limpiarFiltros = () => {
    setFiltroEstado('todos');
    setFiltroMetodo('todos');
  };

  // ============================================================
  // EXPORTAR EXCEL
  // ============================================================
  const exportarExcel = () => {
    if (pagosFiltrados.length === 0) return;

    const dataExcel = pagosFiltrados.map((item) => ({
      Fecha: item.fecha,
      Concepto: item.concepto,
      'Monto (Bs.)': Number(item.monto).toFixed(2),
      'Método de Pago': item.metodo,
      Estado: item.estado,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Detalle_Pagos');
    XLSX.writeFile(workbook, 'Reporte_Pagos.xlsx');
  };

  // ============================================================
  // EXPORTAR PDF
  // ============================================================
  const exportarPDF = async () => {
    const elemento = document.getElementById('tabla-pagos-pdf');
    if (!elemento) return;

    const canvas = await html2canvas(elemento, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save('Reporte_Pagos.pdf');
  };

  // ============================================================
  // BADGE DE ESTADO
  // ============================================================
  const getBadgeClass = (estado: string) => {
    const est = estado?.toLowerCase();
    if (est === 'pagado') {
      return 'inline-flex px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium text-xs';
    }
    if (est === 'reembolsado') {
      return 'inline-flex px-2.5 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 font-medium text-xs';
    }
    return 'inline-flex px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-medium text-xs';
  };

  return (
    <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors space-y-4">
      {/* ============================================ */}
      {/* BARRA DE FILTROS + EXPORT                     */}
      {/* ============================================ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Filtro Estado */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-claro-texto2 dark:text-oscuro-texto2">
              Estado:
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto text-xs rounded-xl border border-claro-borde dark:border-oscuro-borde px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40 transition-colors"
            >
              <option value="todos">Todos los estados</option>
              <option value="pagado">Pagado</option>
              <option value="reembolsado">Reembolsado</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>

          {/* Filtro Método */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-claro-texto2 dark:text-oscuro-texto2">
              Método:
            </label>
            <select
              value={filtroMetodo}
              onChange={(e) => setFiltroMetodo(e.target.value)}
              className="bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto text-xs rounded-xl border border-claro-borde dark:border-oscuro-borde px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40 transition-colors"
            >
              <option value="todos">Todos los métodos</option>
              <option value="qr">QR</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="presencial">Presencial</option>
            </select>
          </div>

          {/* Botón limpiar filtros (siempre visible, atenuado si no aplica) */}
          <button
            onClick={limpiarFiltros}
            disabled={!hayFiltrosActivos}
            className={`text-xs font-semibold rounded-xl px-3 py-1.5 border transition-colors ${
              hayFiltrosActivos
                ? 'bg-claro-fondo dark:bg-oscuro-fondo border-claro-borde dark:border-oscuro-borde text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-primario dark:hover:text-oscuro-primario cursor-pointer'
                : 'bg-claro-fondo/40 dark:bg-oscuro-fondo/40 border-claro-borde/40 dark:border-oscuro-borde/40 text-claro-texto2/40 dark:text-oscuro-texto2/40 cursor-not-allowed'
            }`}
          >
            Limpiar filtros
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportarExcel}
            disabled={pagosFiltrados.length === 0}
            className="px-3.5 py-1.5 bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-oscuro-fondo font-medium rounded-xl text-xs transition-colors shadow-sm"
          >
            Exportar Excel
          </button>

          <button
            onClick={exportarPDF}
            disabled={pagosFiltrados.length === 0}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl text-xs transition-colors shadow-sm"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* TABLA                                         */}
      {/* ============================================ */}
      <div id="tabla-pagos-pdf" className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-claro-borde dark:border-oscuro-borde">
              <th className="text-left py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 font-semibold">
                Fecha
              </th>
              <th className="text-left py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 font-semibold">
                Concepto
              </th>
              <th className="text-left py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 font-semibold">
                Monto
              </th>
              <th className="text-left py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 font-semibold">
                Método
              </th>
              <th className="text-left py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 font-semibold">
                Estado
              </th>
            </tr>
          </thead>

          <tbody>
            {cargando ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-6 text-claro-texto2 dark:text-oscuro-texto2"
                >
                  Cargando detalles de pagos...
                </td>
              </tr>
            ) : pagosFiltrados.length > 0 ? (
              pagosFiltrados.map((pago, index) => (
                <tr
                  key={index}
                  className="border-b border-claro-borde dark:border-oscuro-borde hover:bg-claro-fondo dark:hover:bg-oscuro-fondo/50 transition-colors"
                >
                  <td className="py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2">
                    {pago.fecha}
                  </td>

                  <td className="py-3 px-3 text-claro-texto dark:text-oscuro-texto font-semibold">
                    {pago.concepto || '—'}
                  </td>

                  <td className="py-3 px-3 text-claro-texto dark:text-oscuro-texto font-medium">
                    {pago.monto} Bs.
                  </td>

                  <td className="py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 capitalize">
                    {pago.metodo || '—'}
                  </td>

                  <td className="py-3 px-3">
                    <span className={getBadgeClass(pago.estado)}>{pago.estado}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-6 text-claro-texto2 dark:text-oscuro-texto2"
                >
                  No se encontraron pagos con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DetallesPagosTabla;