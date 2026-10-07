/**
 * ============================================================================
 * ARCHIVO: HistorialInscripcionesCliente.tsx
 * COMPONENTE: Historial de inscripciones a eventos del cliente autenticado.
 * Incluye filtros (tipo, estado inscripción, estado evento) + export Excel/PDF.
 * Estilos con tokens del sistema (claro-* / oscuro-*).
 * ============================================================================
 */

import { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { reporteApi } from './reporte.api';
import type { InscripcionHistorial } from './reporte.types';

export const HistorialInscripcionesCliente = () => {
  const [inscripciones, setInscripciones] = useState<InscripcionHistorial[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Filtros
  const [tipoEventoFiltro, setTipoEventoFiltro] = useState<string>('');
  const [estadoInscripcionFiltro, setEstadoInscripcionFiltro] = useState<string>('');
  const [estadoEventoFiltro, setEstadoEventoFiltro] = useState<string>('');

  useEffect(() => {
    const obtenerInscripciones = async () => {
      try {
        setCargando(true);
        setError('');
        const data = await reporteApi.historialInscripcionesCliente();
        setInscripciones(data);
      } catch (err) {
        console.error('Error al obtener historial de inscripciones:', err);
        setError('No se pudo cargar el historial de inscripciones.');
      } finally {
        setCargando(false);
      }
    };
    obtenerInscripciones();
  }, []);

  const formatearFechaHora = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatearEstado = (estado: string) => {
    return estado.charAt(0).toUpperCase() + estado.slice(1);
  };

  // Opciones únicas para filtros
  const tiposEvento = useMemo(() => {
    return [
      ...new Set(
        inscripciones
          .map((i) => i.tipo_evento)
          .filter(Boolean) as string[]
      ),
    ].sort();
  }, [inscripciones]);

  const estadosInscripcion = useMemo(() => {
    return [
      ...new Set(inscripciones.map((i) => i.estado_inscripcion)),
    ]
      .filter(Boolean)
      .sort();
  }, [inscripciones]);

  const estadosEvento = useMemo(() => {
    return [
      ...new Set(inscripciones.map((i) => i.estado_evento)),
    ]
      .filter(Boolean)
      .sort();
  }, [inscripciones]);

  // Aplicar filtros
  const inscripcionesFiltradas = useMemo(() => {
    return inscripciones.filter((inscripcion) => {
      const cumpleTipo =
        !tipoEventoFiltro || inscripcion.tipo_evento === tipoEventoFiltro;

      const cumpleEstadoInscripcion =
        !estadoInscripcionFiltro ||
        inscripcion.estado_inscripcion === estadoInscripcionFiltro;

      const cumpleEstadoEvento =
        !estadoEventoFiltro || inscripcion.estado_evento === estadoEventoFiltro;

      return cumpleTipo && cumpleEstadoInscripcion && cumpleEstadoEvento;
    });
  }, [
    inscripciones,
    tipoEventoFiltro,
    estadoInscripcionFiltro,
    estadoEventoFiltro,
  ]);

  const hayFiltrosActivos =
    tipoEventoFiltro !== '' ||
    estadoInscripcionFiltro !== '' ||
    estadoEventoFiltro !== '';

  const limpiarFiltros = () => {
    setTipoEventoFiltro('');
    setEstadoInscripcionFiltro('');
    setEstadoEventoFiltro('');
  };

  // ============================================================
  // EXPORTAR EXCEL
  // ============================================================
  const exportarExcel = () => {
    const datos = inscripcionesFiltradas.map((i) => ({
      Evento: i.nombre_evento,
      'Hora inicio': i.hora_inicio,
      'Hora fin': i.hora_fin,
      'Tipo de evento': i.tipo_evento || '—',
      'Fecha de inscripción': formatearFechaHora(i.fecha_inscripcion),
      'Estado inscripción': formatearEstado(i.estado_inscripcion),
      'Estado evento': formatearEstado(i.estado_evento),
    }));

    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Mis Inscripciones');
    XLSX.writeFile(libro, 'historial-inscripciones.xlsx');
  };

  // ============================================================
  // EXPORTAR PDF
  // ============================================================
  const exportarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFontSize(18);
    doc.text('Historial de Inscripciones', 14, 18);

    doc.setFontSize(10);
    doc.text(`Total de inscripciones: ${inscripcionesFiltradas.length}`, 14, 26);

    let y = 36;
    doc.setFontSize(9);

    doc.text('Evento', 14, y);
    doc.text('Horario', 105, y);
    doc.text('Tipo', 140, y);
    doc.text('Fecha inscripción', 175, y);
    doc.text('Estado inscripción', 215, y);
    doc.text('Estado evento', 255, y);

    y += 7;

    inscripcionesFiltradas.forEach((i) => {
      if (y > 190) {
        doc.addPage();
        y = 20;
        doc.setFontSize(9);
        doc.text('Evento', 14, y);
        doc.text('Horario', 105, y);
        doc.text('Tipo', 140, y);
        doc.text('Fecha inscripción', 175, y);
        doc.text('Estado inscripción', 215, y);
        doc.text('Estado evento', 255, y);
        y += 7;
      }

      doc.text(i.nombre_evento.substring(0, 30), 14, y);
      doc.text(`${i.hora_inicio} - ${i.hora_fin}`, 105, y);
      doc.text((i.tipo_evento || '—').substring(0, 18), 140, y);
      doc.text(formatearFechaHora(i.fecha_inscripcion), 175, y);
      doc.text(formatearEstado(i.estado_inscripcion), 215, y);
      doc.text(formatearEstado(i.estado_evento), 255, y);

      y += 7;
    });

    doc.save('historial-inscripciones.pdf');
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-claro-texto2 dark:text-oscuro-texto2">
          Cargando historial de inscripciones...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl p-4 text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto">
          Historial de Inscripciones
        </h2>
        <p className="text-claro-texto2 dark:text-oscuro-texto2 mt-1">
          Consulta y filtra tus inscripciones a eventos.
        </p>
      </div>

      {/* ============================================ */}
      {/* FILTROS                                       */}
      {/* ============================================ */}
      <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-2xl shadow-sm p-5">
        <h3 className="text-lg font-semibold text-claro-texto dark:text-oscuro-texto mb-4">
          🔎 Filtrar inscripciones
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tipo de evento */}
          <div>
            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
              Tipo de evento
            </label>
            <select
              value={tipoEventoFiltro}
              onChange={(e) => setTipoEventoFiltro(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40"
            >
              <option value="">Todos los tipos</option>
              {tiposEvento.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Estado inscripción */}
          <div>
            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
              Estado de inscripción
            </label>
            <select
              value={estadoInscripcionFiltro}
              onChange={(e) => setEstadoInscripcionFiltro(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40"
            >
              <option value="">Todos los estados</option>
              {estadosInscripcion.map((estado) => (
                <option key={estado} value={estado}>
                  {formatearEstado(estado)}
                </option>
              ))}
            </select>
          </div>

          {/* Estado evento */}
          <div>
            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
              Estado del evento
            </label>
            <select
              value={estadoEventoFiltro}
              onChange={(e) => setEstadoEventoFiltro(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40"
            >
              <option value="">Todos los estados</option>
              {estadosEvento.map((estado) => (
                <option key={estado} value={estado}>
                  {formatearEstado(estado)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 mt-5">
          <button
            onClick={limpiarFiltros}
            disabled={!hayFiltrosActivos}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              hayFiltrosActivos
                ? 'bg-claro-fondo dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde text-claro-texto dark:text-oscuro-texto hover:text-claro-primario dark:hover:text-oscuro-primario hover:border-claro-primario/40 dark:hover:border-oscuro-primario/40 cursor-pointer'
                : 'bg-claro-fondo/40 dark:bg-oscuro-fondo/40 border border-claro-borde/40 dark:border-oscuro-borde/40 text-claro-texto2/40 dark:text-oscuro-texto2/40 cursor-not-allowed'
            }`}
          >
            ↄ Limpiar filtros
          </button>

          <button
            onClick={exportarPDF}
            disabled={inscripcionesFiltradas.length === 0}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            📄 PDF
          </button>

          <button
            onClick={exportarExcel}
            disabled={inscripcionesFiltradas.length === 0}
            className="px-4 py-2 bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-oscuro-fondo rounded-lg text-sm font-medium transition-colors"
          >
            📊 Excel
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* RESULTADOS                                    */}
      {/* ============================================ */}
      {inscripcionesFiltradas.length === 0 ? (
        <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-2xl shadow-sm p-10 text-center">
          <p className="text-claro-texto2 dark:text-oscuro-texto2">
            {hayFiltrosActivos
              ? 'No se encontraron inscripciones con los filtros seleccionados.'
              : 'No tenés inscripciones registradas todavía.'}
          </p>
        </div>
      ) : (
        <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-claro-borde dark:border-oscuro-borde">
            <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2">
              Mostrando{' '}
              <span className="font-semibold text-claro-texto dark:text-oscuro-texto">
                {inscripcionesFiltradas.length}
              </span>{' '}
              de{' '}
              <span className="font-semibold text-claro-texto dark:text-oscuro-texto">
                {inscripciones.length}
              </span>{' '}
              inscripciones.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-claro-borde dark:border-oscuro-borde">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-claro-texto2 dark:text-oscuro-texto2">
                    Evento
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-claro-texto2 dark:text-oscuro-texto2">
                    Horario
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-claro-texto2 dark:text-oscuro-texto2">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-claro-texto2 dark:text-oscuro-texto2">
                    Fecha inscripción
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-claro-texto2 dark:text-oscuro-texto2">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-claro-texto2 dark:text-oscuro-texto2">
                    Evento
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-claro-borde dark:divide-oscuro-borde">
                {inscripcionesFiltradas.map((inscripcion) => (
                  <tr
                    key={inscripcion.id_inscripcion}
                    className="hover:bg-claro-fondo dark:hover:bg-oscuro-fondo/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-claro-texto dark:text-oscuro-texto">
                          {inscripcion.nombre_evento}
                        </p>
                        {inscripcion.descripcion && (
                          <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2">
                            {inscripcion.descripcion}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-claro-texto2 dark:text-oscuro-texto2">
                      {inscripcion.hora_inicio} - {inscripcion.hora_fin}
                    </td>

                    <td className="px-4 py-3 text-claro-texto2 dark:text-oscuro-texto2">
                      {inscripcion.tipo_evento || '—'}
                    </td>

                    <td className="px-4 py-3 text-claro-texto2 dark:text-oscuro-texto2">
                      {formatearFechaHora(inscripcion.fecha_inscripcion)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          inscripcion.estado_inscripcion.toLowerCase() === 'confirmada'
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            : inscripcion.estado_inscripcion.toLowerCase() === 'cancelada'
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                            : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                        }`}
                      >
                        {formatearEstado(inscripcion.estado_inscripcion)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-claro-tinte dark:bg-oscuro-tinte text-claro-primario dark:text-oscuro-primario">
                        {formatearEstado(inscripcion.estado_evento)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialInscripcionesCliente;