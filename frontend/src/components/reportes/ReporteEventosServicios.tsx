/**
 * ============================================================================
 * ARCHIVO: ReporteEventosServicios.tsx
 * COMPONENTE: Reporte de eventos + ingresos por servicios + tabla + export.
 * Estilos con tokens del sistema (claro-* / oscuro-*).
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ResponsivePie } from '@nivo/pie';
import { reporteApi } from './reporte.api';
import type {
  EventoServicioItem,
  ServicioIngreso,
} from './reporte.types';

interface Props {
  fechaInicio?: string;
  fechaFin?: string;
}

export const ReporteEventosServicios: React.FC<Props> = ({
  fechaInicio,
  fechaFin,
}) => {
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const [todosEventos, setTodosEventos] = useState<EventoServicioItem[]>([]);
  const [ingresosServicios, setIngresosServicios] = useState<ServicioIngreso[]>([]);
  const [cargando, setCargando] = useState(false);

  const obtenerReporteData = async () => {
    try {
      setCargando(true);

      const fInicio = fechaInicio || '2025-01-01';
      const fFin = fechaFin || '2026-12-31';

      const data = await reporteApi.eventosServicios({
        fechaInicio: fInicio,
        fechaFin: fFin,
      });

      setTodosEventos(data.eventos || []);
      setIngresosServicios(data.ingresosServicios || []);
    } catch (error: any) {
      console.error(
        'ERROR REPORTE EVENTOS/SERVICIOS:',
        error.response?.status,
        error.response?.data
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerReporteData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaInicio, fechaFin]);

  const tiposDisponibles = Array.from(
    new Set(todosEventos.map((e) => e.tipo_evento).filter(Boolean))
  );

  const eventosFiltrados = todosEventos.filter((evento) => {
    const cumpleEstado =
      filtroEstado === 'todos' ||
      evento.estado?.toLowerCase() === filtroEstado.toLowerCase();

    const cumpleTipo =
      filtroTipo === 'todos' ||
      evento.tipo_evento?.toLowerCase() === filtroTipo.toLowerCase();

    const cumpleBusqueda =
      !busqueda ||
      evento.nombre_evento?.toLowerCase().includes(busqueda.toLowerCase()) ||
      evento.servicios?.toLowerCase().includes(busqueda.toLowerCase()) ||
      evento.canchas?.toLowerCase().includes(busqueda.toLowerCase());

    return cumpleEstado && cumpleTipo && cumpleBusqueda;
  });

  // KPIs
  const totalEventos = eventosFiltrados.length;
  const programados = eventosFiltrados.filter(
    (e) => e.estado?.toLowerCase() === 'programado'
  ).length;
  const finalizados = eventosFiltrados.filter(
    (e) => e.estado?.toLowerCase() === 'finalizado'
  ).length;
  const cancelados = eventosFiltrados.filter(
    (e) => e.estado?.toLowerCase() === 'cancelado'
  ).length;
  const totalIngresos = ingresosServicios.reduce((acc, curr) => acc + curr.value, 0);

  const exportarExcel = () => {
    const datosExcel = eventosFiltrados.map((item) => ({
      ID: item.id_evento,
      Evento: item.nombre_evento,
      Tipo: item.tipo_evento || 'General',
      Fecha: item.fecha_evento,
      Horario: `${item.hora_inicio} - ${item.hora_fin}`,
      Canchas: item.canchas || 'N/A',
      Servicios: item.servicios || 'Ninguno',
      Capacidad: item.cupo_maximo ? `${item.cupo_maximo} pers.` : 'N/A',
      Estado: item.estado,
    }));

    const hoja = XLSX.utils.json_to_sheet(datosExcel);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Eventos y Servicios');
    XLSX.writeFile(libro, 'reporte-eventos-servicios.xlsx');
  };

  const exportarPDF = async () => {
    const elemento = document.getElementById('reporte-eventos-pdf');
    if (!elemento) return;

    const canvas = await html2canvas(elemento, { scale: 2 });
    const imagen = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const ancho = 190;
    const alto = (canvas.height * ancho) / canvas.width;

    pdf.text('Reporte de Eventos y Servicios', 10, 10);
    pdf.addImage(imagen, 'PNG', 10, 15, ancho, alto);
    pdf.save('reporte-eventos-servicios.pdf');
  };

  return (
    <div
      className="space-y-6 bg-claro-fondo dark:bg-oscuro-fondo p-6 rounded-2xl text-claro-texto dark:text-oscuro-texto"
      id="reporte-eventos-pdf"
    >
      <h2 className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto">
        Reporte de Eventos y Servicios
      </h2>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-4 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm">
          <p className="text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2">
            Total de eventos
          </p>
          <h3 className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto mt-1">
            {totalEventos}
          </h3>
        </div>

        <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-4 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm">
          <p className="text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2">
            Programados
          </p>
          <h3 className="text-2xl font-bold text-claro-primario dark:text-oscuro-primario mt-1">
            {programados}
          </h3>
        </div>

        <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-4 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm">
          <p className="text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2">
            Finalizados
          </p>
          <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {finalizados}
          </h3>
        </div>

        <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-4 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm">
          <p className="text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2">
            Cancelados
          </p>
          <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {cancelados}
          </h3>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
        <h3 className="text-lg font-bold text-claro-texto dark:text-oscuro-texto mb-4">
          Filtros
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40"
            >
              <option value="todos">Todos los estados</option>
              <option value="programado">Programado</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
              Tipo de Evento
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40"
            >
              <option value="todos">Todos los tipos</option>
              {tiposDisponibles.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre, servicios o cancha..."
              className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto placeholder-claro-texto2 dark:placeholder-oscuro-texto2 focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={obtenerReporteData}
            disabled={cargando}
            className="px-5 py-2 rounded-lg bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo font-medium transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {cargando ? 'Actualizando...' : 'Aplicar filtros'}
          </button>
        </div>
      </div>

      {/* DONA DE INGRESOS */}
      <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-base font-bold text-claro-texto dark:text-oscuro-texto">
              Ingresos por Servicios
            </h3>
            <p className="text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2">
              Monto recaudado por tipo de servicio contratado
            </p>
          </div>
          <div className="bg-claro-tinte dark:bg-oscuro-tinte px-3 py-1.5 rounded-xl">
            <span className="text-xs text-claro-primario dark:text-oscuro-primario font-bold">
              Total: Bs. {totalIngresos.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="h-72 w-full max-w-lg mx-auto relative">
          {ingresosServicios.length > 0 ? (
            <ResponsivePie
              data={ingresosServicios}
              colors={['#1C3034', '#D97706', '#2563EB', '#DC2626', '#4B5563']}
              margin={{ top: 30, right: 90, bottom: 30, left: 90 }}
              innerRadius={0.65}
              padAngle={2}
              cornerRadius={5}
              activeOuterRadiusOffset={6}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              enableArcLinkLabels={true}
              arcLinkLabel={(d) => `${d.id}`}
              arcLinkLabelsTextColor="currentColor"
              arcLabelsSkipAngle={10}
              arcLabelsTextColor="#ffffff"
              valueFormat={(value) => `${value} Bs.`}
              theme={{
                text: { fontSize: 11, fill: 'currentColor' },
                tooltip: {
                  container: {
                    background: '#1f2937',
                    color: '#ffffff',
                    fontSize: '12px',
                    borderRadius: '8px',
                  },
                },
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2 font-medium">
                Sin registros de ingresos por servicios
              </p>
            </div>
          )}
        </div>
      </div>

      {/* BOTONES EXPORT */}
      <div className="flex gap-3">
        <button
          onClick={exportarExcel}
          disabled={eventosFiltrados.length === 0}
          className="px-4 py-2 rounded-lg bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Exportar Excel
        </button>

        <button
          onClick={exportarPDF}
          disabled={eventosFiltrados.length === 0}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Exportar PDF
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-claro-texto dark:text-oscuro-texto">
              Lista de Eventos
            </h3>
            <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2">
              Total: {eventosFiltrados.length} eventos encontrados
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-claro-borde dark:border-oscuro-borde">
                <th className="text-left py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 font-semibold">
                  Evento
                </th>
                <th className="text-left py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 font-semibold">
                  Tipo
                </th>
                <th className="text-left py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 font-semibold">
                  Fecha
                </th>
                <th className="text-left py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 font-semibold">
                  Horario
                </th>
                <th className="text-left py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 font-semibold">
                  Canchas
                </th>
                <th className="text-left py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 font-semibold">
                  Servicios
                </th>
                <th className="text-left py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 font-semibold">
                  Cupo
                </th>
                <th className="text-left py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 font-semibold">
                  Estado
                </th>
              </tr>
            </thead>

            <tbody>
              {eventosFiltrados.length > 0 ? (
                eventosFiltrados.map((item) => (
                  <tr
                    key={item.id_evento}
                    className="border-b border-claro-borde dark:border-oscuro-borde hover:bg-claro-fondo dark:hover:bg-oscuro-fondo/50 transition-colors"
                  >
                    <td className="py-3 px-3 text-claro-texto dark:text-oscuro-texto font-semibold">
                      {item.nombre_evento}
                    </td>
                    <td className="py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 capitalize">
                      {item.tipo_evento || '—'}
                    </td>
                    <td className="py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2">
                      {item.fecha_evento}
                    </td>
                    <td className="py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2">
                      {item.hora_inicio} - {item.hora_fin}
                    </td>
                    <td className="py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2">
                      {item.canchas || '—'}
                    </td>
                    <td className="py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2">
                      {item.servicios || '—'}
                    </td>
                    <td className="py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2">
                      {item.cupo_maximo ? `${item.cupo_maximo} pers.` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={
                          item.estado?.toLowerCase() === 'programado'
                            ? 'inline-flex px-2.5 py-1 rounded-full bg-claro-tinte dark:bg-oscuro-tinte text-claro-primario dark:text-oscuro-primario font-medium text-xs'
                            : item.estado?.toLowerCase() === 'finalizado'
                            ? 'inline-flex px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium text-xs'
                            : 'inline-flex px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-medium text-xs'
                        }
                      >
                        {item.estado}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-6 text-claro-texto2 dark:text-oscuro-texto2"
                  >
                    No se encontraron eventos con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReporteEventosServicios;