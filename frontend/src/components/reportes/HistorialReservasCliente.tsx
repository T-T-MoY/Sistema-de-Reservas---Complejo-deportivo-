/**
 * ============================================================================
 * ARCHIVO: HistorialReservasCliente.tsx
 * COMPONENTE: Historial de reservas del cliente autenticado.
 * Incluye filtros (cancha, disciplina, estado, pago) + export Excel/PDF.
 * Estilos con tokens del sistema (claro-* / oscuro-*).
 * ============================================================================
 */

import { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { reporteApi } from './reporte.api';
import type { ReservaHistorial } from './reporte.types';

export const HistorialReservasCliente = () => {
  const [reservas, setReservas] = useState<ReservaHistorial[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Filtros
  const [canchaFiltro, setCanchaFiltro] = useState<string>('');
  const [disciplinaFiltro, setDisciplinaFiltro] = useState<string>('');
  const [estadoFiltro, setEstadoFiltro] = useState<string>('');
  const [pagoFiltro, setPagoFiltro] = useState<string>('');

  useEffect(() => {
    const obtenerReservas = async () => {
      try {
        setCargando(true);
        setError('');
        const data = await reporteApi.historialReservasCliente();
        setReservas(data);
      } catch (err) {
        console.error('Error al obtener historial de reservas:', err);
        setError('No se pudo cargar el historial de reservas.');
      } finally {
        setCargando(false);
      }
    };
    obtenerReservas();
  }, []);

  const formatearEstado = (estado: string) => {
    return estado.charAt(0).toUpperCase() + estado.slice(1);
  };

  // Opciones únicas para filtros
  const canchas = useMemo(() => {
    return [...new Set(reservas.map((r) => r.cancha))].sort();
  }, [reservas]);

  const disciplinas = useMemo(() => {
    return [
      ...new Set(
        reservas.map((r) => r.disciplina).filter(Boolean) as string[]
      ),
    ].sort();
  }, [reservas]);

  const estados = useMemo(() => {
    return [...new Set(reservas.map((r) => r.estado_reserva))]
      .filter(Boolean)
      .sort();
  }, [reservas]);

  const estadosPago = useMemo(() => {
    return [
      ...new Set(
        reservas.map((r) => r.estado_pago).filter(Boolean) as string[]
      ),
    ].sort();
  }, [reservas]);

  // Aplicar filtros
  const reservasFiltradas = useMemo(() => {
    return reservas.filter((reserva) => {
      const cumpleCancha = !canchaFiltro || reserva.cancha === canchaFiltro;
      const cumpleDisciplina =
        !disciplinaFiltro || reserva.disciplina === disciplinaFiltro;
      const cumpleEstado =
        !estadoFiltro || reserva.estado_reserva === estadoFiltro;
      const cumplePago = !pagoFiltro || reserva.estado_pago === pagoFiltro;

      return cumpleCancha && cumpleDisciplina && cumpleEstado && cumplePago;
    });
  }, [reservas, canchaFiltro, disciplinaFiltro, estadoFiltro, pagoFiltro]);

  const hayFiltrosActivos =
    canchaFiltro !== '' ||
    disciplinaFiltro !== '' ||
    estadoFiltro !== '' ||
    pagoFiltro !== '';

  const limpiarFiltros = () => {
    setCanchaFiltro('');
    setDisciplinaFiltro('');
    setEstadoFiltro('');
    setPagoFiltro('');
  };

  // ============================================================
  // EXPORTAR EXCEL
  // ============================================================
  const exportarExcel = () => {
    const datos = reservasFiltradas.map((r) => ({
      Cancha: r.cancha,
      Disciplina: r.disciplina || '—',
      'Hora inicio': r.hora_inicio,
      'Hora fin': r.hora_fin,
      'Estado reserva': formatearEstado(r.estado_reserva),
      'Monto (Bs.)': r.monto !== null ? Number(r.monto).toFixed(2) : 'Sin pago',
      'Estado pago': r.estado_pago ? formatearEstado(r.estado_pago) : 'Sin pago',
    }));

    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Mis Reservas');
    XLSX.writeFile(libro, 'historial-reservas.xlsx');
  };

  // ============================================================
  // EXPORTAR PDF
  // ============================================================
  const exportarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFontSize(18);
    doc.text('Historial de Reservas', 14, 18);

    doc.setFontSize(10);
    doc.text(`Total de reservas: ${reservasFiltradas.length}`, 14, 26);

    let y = 36;
    doc.setFontSize(9);

    doc.text('Cancha', 42, y);
    doc.text('Disciplina', 82, y);
    doc.text('Horario', 120, y);
    doc.text('Estado', 160, y);
    doc.text('Pago', 200, y);
    doc.text('Estado pago', 235, y);

    y += 7;

    reservasFiltradas.forEach((reserva) => {
      if (y > 190) {
        doc.addPage();
        y = 20;
        doc.setFontSize(9);
        doc.text('Cancha', 42, y);
        doc.text('Disciplina', 82, y);
        doc.text('Horario', 120, y);
        doc.text('Estado', 160, y);
        doc.text('Pago', 200, y);
        doc.text('Estado pago', 235, y);
        y += 6;
      }

      doc.text(reserva.cancha.substring(0, 22), 42, y);
      doc.text((reserva.disciplina || '—').substring(0, 18), 82, y);
      doc.text(`${reserva.hora_inicio} - ${reserva.hora_fin}`, 120, y);
      doc.text(formatearEstado(reserva.estado_reserva), 160, y);
      doc.text(
        reserva.monto !== null ? `Bs. ${Number(reserva.monto).toFixed(2)}` : 'Sin pago',
        200,
        y
      );
      doc.text(
        reserva.estado_pago ? formatearEstado(reserva.estado_pago) : 'Sin pago',
        235,
        y
      );

      y += 6;
    });

    doc.save('historial-reservas.pdf');
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-claro-texto2 dark:text-oscuro-texto2">
          Cargando historial de reservas...
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
          Historial de Reservas
        </h2>
        <p className="text-claro-texto2 dark:text-oscuro-texto2 mt-1">
          Consulta y filtra tus reservas de canchas.
        </p>
      </div>

      {/* ============================================ */}
      {/* FILTROS                                       */}
      {/* ============================================ */}
      <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-2xl shadow-sm p-5">
        <h3 className="text-lg font-semibold text-claro-texto dark:text-oscuro-texto mb-4">
          🔎 Filtrar reservas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cancha */}
          <div>
            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
              Cancha
            </label>
            <select
              value={canchaFiltro}
              onChange={(e) => setCanchaFiltro(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40"
            >
              <option value="">Todas las canchas</option>
              {canchas.map((cancha) => (
                <option key={cancha} value={cancha}>
                  {cancha}
                </option>
              ))}
            </select>
          </div>

          {/* Disciplina */}
          <div>
            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
              Disciplina
            </label>
            <select
              value={disciplinaFiltro}
              onChange={(e) => setDisciplinaFiltro(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40"
            >
              <option value="">Todas las disciplinas</option>
              {disciplinas.map((disciplina) => (
                <option key={disciplina} value={disciplina}>
                  {disciplina}
                </option>
              ))}
            </select>
          </div>

          {/* Estado reserva */}
          <div>
            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
              Estado de reserva
            </label>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40"
            >
              <option value="">Todos los estados</option>
              {estados.map((estado) => (
                <option key={estado} value={estado}>
                  {formatearEstado(estado)}
                </option>
              ))}
            </select>
          </div>

          {/* Estado pago */}
          <div>
            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
              Estado de pago
            </label>
            <select
              value={pagoFiltro}
              onChange={(e) => setPagoFiltro(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40"
            >
              <option value="">Todos los pagos</option>
              {estadosPago.map((estado) => (
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
            disabled={reservasFiltradas.length === 0}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            📄 PDF
          </button>

          <button
            onClick={exportarExcel}
            disabled={reservasFiltradas.length === 0}
            className="px-4 py-2 bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-oscuro-fondo rounded-lg text-sm font-medium transition-colors"
          >
            📊 Excel
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* RESULTADOS                                    */}
      {/* ============================================ */}
      {reservasFiltradas.length === 0 ? (
        <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-2xl shadow-sm p-10 text-center">
          <p className="text-claro-texto2 dark:text-oscuro-texto2">
            {hayFiltrosActivos
              ? 'No se encontraron reservas con los filtros seleccionados.'
              : 'No tenés reservas registradas todavía.'}
          </p>
        </div>
      ) : (
        <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-claro-borde dark:border-oscuro-borde">
            <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2">
              Mostrando{' '}
              <span className="font-semibold text-claro-texto dark:text-oscuro-texto">
                {reservasFiltradas.length}
              </span>{' '}
              de{' '}
              <span className="font-semibold text-claro-texto dark:text-oscuro-texto">
                {reservas.length}
              </span>{' '}
              reservas.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-claro-borde dark:border-oscuro-borde">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-claro-texto2 dark:text-oscuro-texto2">
                    Cancha
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-claro-texto2 dark:text-oscuro-texto2">
                    Disciplina
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-claro-texto2 dark:text-oscuro-texto2">
                    Horario
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-claro-texto2 dark:text-oscuro-texto2">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-claro-texto2 dark:text-oscuro-texto2">
                    Pago
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-claro-borde dark:divide-oscuro-borde">
                {reservasFiltradas.map((reserva) => (
                  <tr
                    key={reserva.id_reserva}
                    className="hover:bg-claro-fondo dark:hover:bg-oscuro-fondo/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-claro-texto dark:text-oscuro-texto">
                      {reserva.cancha}
                    </td>

                    <td className="px-4 py-3 text-claro-texto2 dark:text-oscuro-texto2">
                      {reserva.disciplina || '—'}
                    </td>

                    <td className="px-4 py-3 text-claro-texto2 dark:text-oscuro-texto2">
                      {reserva.hora_inicio} - {reserva.hora_fin}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-claro-tinte dark:bg-oscuro-tinte text-claro-primario dark:text-oscuro-primario">
                        {formatearEstado(reserva.estado_reserva)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {reserva.monto !== null ? (
                        <div>
                          <p className="font-medium text-claro-texto dark:text-oscuro-texto">
                            Bs. {Number(reserva.monto).toFixed(2)}
                          </p>
                          <p className="text-xs text-claro-texto2 dark:text-oscuro-texto2">
                            {reserva.estado_pago
                              ? formatearEstado(reserva.estado_pago)
                              : 'Sin estado'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-claro-texto2 dark:text-oscuro-texto2">
                          Sin pago
                        </span>
                      )}
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

export default HistorialReservasCliente;