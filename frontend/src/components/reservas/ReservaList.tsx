/**
 * ============================================================================
 * ARCHIVO: ReservaList.tsx
 * COMPONENTE: Lista de reservas con modo + filtros + paginación + modales.
 *
 * INCLUYE:
 * - Buscador, filtro por estado.
 * - Botón "Limpiar filtros" siempre visible (atenuado cuando está inactivo).
 * - Contador de filtros activos con badge.
 * - Paginación numerada con elipsis.
 * - Tabla adaptativa con colgroup + table-fixed.
 * - Numeración de filas.
 * - Botones de acción alineados y con colores del sistema (dark-mode safe).
 * - Fondo correcto en dark mode (usa tokens del sistema, no bg-white).
 * ============================================================================
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reservaApi } from './reserva.api';
import { ReservaBadge } from './ReservaBadge';
import { ReservaCard } from './ReservaCard';
import ModalReserva from './ModalReserva';
import ModalModificarReserva from './ModalModificarReserva';
import ModalCancelarReserva from './ModalCancelarReserva';
import ModalPago from '../pagos/ModalPago';
import ModalVerificarPago from '../pagos/ModalVerificarPago';
import { obtenerAdicionalesReserva } from '../../utils/reservaExtras';
import type { Reserva, ReservaListProps } from './reserva.types';

const PREVIEW_LIMIT = 3;

// =====================================================
// HELPERS
// =====================================================
const formatFecha = (fecha: string): string => {
  try {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return fecha;
  }
};

const formatHora = (hora: string): string => (hora ? hora.slice(0, 5) : '');

const normalizarEstado = (estado: string): string =>
  (estado || '').toString().trim().toLowerCase().replace(/\s+/g, '_');

const esVerificable = (reserva: Reserva): boolean => {
  const estado = normalizarEstado(reserva.estado);
  return estado === 'pendiente' || estado === 'pendiente_pago';
};

const getNombreCliente = (r: Reserva): string =>
  `${r.cliente_nombre || r.nombre || ''} ${
    r.apellido_paterno || r.paterno || ''
  }`.trim();

// =====================================================
// COMPONENTE
// =====================================================
export const ReservaList = ({
  modo = 'app',
  filtro,
  title,
  subtitle,
}: ReservaListProps) => {
  const isPreview = modo === 'preview';
  const { usuario } = useAuth();

  const esAdmin = Boolean(
    usuario && (usuario.rol === 'Admin' || usuario.rol === 'Administrador')
  );
  const esEmpleado = Boolean(
    usuario && (usuario.rol === 'Empleado' || usuario.rol === 'empleado')
  );
  const esAdminOEmpleado = esAdmin || esEmpleado;

  // Estados
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  // Modales
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [modalModificarOpen, setModalModificarOpen] = useState(false);
  const [modalCancelarOpen, setModalCancelarOpen] = useState(false);
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [modalVerificarOpen, setModalVerificarOpen] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null);
  const [cancelando, setCancelando] = useState(false);

  // =====================================================
  // CARGA DE DATOS
  // =====================================================
  const cargarReservas = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const data =
        filtro === 'mias'
          ? await reservaApi.getMias()
          : await reservaApi.getTodas();
      setReservas(data);
    } catch (err) {
      console.error('Error al cargar reservas:', err);
      setError('No se pudieron cargar las reservas.');
    } finally {
      setCargando(false);
    }
  }, [filtro]);

  useEffect(() => {
    cargarReservas();
  }, [cargarReservas]);

  // Resetear página al cambiar filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroEstado, porPagina]);

  // =====================================================
  // HANDLERS DE MODALES
  // =====================================================
  const handlePagar = (reserva: Reserva) => {
    setReservaSeleccionada({
      ...reserva,
      detallesIniciales: obtenerAdicionalesReserva(reserva.id_reserva),
    } as Reserva);
    setModalPagoOpen(true);
  };

  const handleVerificarPago = (reserva: Reserva) => {
    setReservaSeleccionada(reserva);
    setModalVerificarOpen(true);
  };

  const handleAbrirModificar = (reserva: Reserva) => {
    setReservaSeleccionada(reserva);
    setModalModificarOpen(true);
  };

  const handleAbrirCancelar = (reserva: Reserva) => {
    setReservaSeleccionada(reserva);
    setModalCancelarOpen(true);
  };

  const handleConfirmarCancelar = async (motivo: string) => {
    if (!reservaSeleccionada) return;
    setCancelando(true);
    try {
      await reservaApi.cancelar(reservaSeleccionada.id_reserva, motivo);
      setModalCancelarOpen(false);
      setReservaSeleccionada(null);
      await cargarReservas();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cancelar la reserva');
    } finally {
      setCancelando(false);
    }
  };

  // =====================================================
  // FILTROS
  // =====================================================
  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('');
    setPaginaActual(1);
  };

  const hayFiltrosActivos = busqueda.trim() !== '' || filtroEstado !== '';

  const filtrosActivos = [
    busqueda.trim() !== '',
    filtroEstado !== '',
  ].filter(Boolean).length;

  const filtradas = useMemo(() => {
    let resultado = reservas.filter((r) => {
      if (busqueda.trim()) {
        const term = busqueda.toLowerCase();
        const nombreCliente = getNombreCliente(r).toLowerCase();
        const coincide =
          nombreCliente.includes(term) ||
          (r.cancha_nombre || '').toLowerCase().includes(term) ||
          (r.correo || '').toLowerCase().includes(term);
        if (!coincide) return false;
      }
      if (filtroEstado) {
        const estado = normalizarEstado(r.estado);
        if (estado !== filtroEstado) return false;
      }
      return true;
    });

    resultado.sort((a, b) => {
      const nombreA = getNombreCliente(a).toLowerCase();
      const nombreB = getNombreCliente(b).toLowerCase();
      const compareA = nombreA || (a.cancha_nombre || '').toLowerCase();
      const compareB = nombreB || (b.cancha_nombre || '').toLowerCase();
      return compareA.localeCompare(compareB);
    });

    return resultado;
  }, [reservas, busqueda, filtroEstado]);

  // =====================================================
  // PAGINACIÓN
  // =====================================================
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / porPagina));

  useEffect(() => {
    if (paginaActual > totalPaginas) setPaginaActual(totalPaginas);
  }, [paginaActual, totalPaginas]);

  const reservasPaginadas = useMemo(() => {
    if (isPreview) return filtradas.slice(0, PREVIEW_LIMIT);
    const inicio = (paginaActual - 1) * porPagina;
    return filtradas.slice(inicio, inicio + porPagina);
  }, [filtradas, paginaActual, porPagina, isPreview]);

  const indiceInicio =
    filtradas.length === 0 ? 0 : (paginaActual - 1) * porPagina + 1;
  const indiceFin = Math.min(paginaActual * porPagina, filtradas.length);

  const numerosPagina = useMemo(() => {
    const paginas: (number | '...')[] = [];
    const maxVisible = 5;

    if (totalPaginas <= maxVisible + 2) {
      for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
    } else {
      paginas.push(1);
      let inicio = Math.max(2, paginaActual - 1);
      let fin = Math.min(totalPaginas - 1, paginaActual + 1);

      if (paginaActual <= 3) {
        inicio = 2;
        fin = 4;
      }
      if (paginaActual >= totalPaginas - 2) {
        inicio = totalPaginas - 3;
        fin = totalPaginas - 1;
      }

      if (inicio > 2) paginas.push('...');
      for (let i = inicio; i <= fin; i++) paginas.push(i);
      if (fin < totalPaginas - 1) paginas.push('...');
      paginas.push(totalPaginas);
    }

    return paginas;
  }, [totalPaginas, paginaActual]);

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="space-y-6">
      {/* Cabecera */}
      {!isPreview && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto tracking-tight">
              {title || (filtro === 'mias' ? 'Mis Reservas' : 'Gestión de Reservas')}
            </h1>
            <p className="text-claro-texto2 dark:text-oscuro-texto2 text-sm mt-1.5">
              {subtitle ||
                (filtro === 'mias'
                  ? 'Consultá tus reservas, pagá o cancelá.'
                  : 'Supervisá, verificá pagos, modificá y cancelá reservas.')}
            </p>
          </div>

          {filtro === 'todas' && esAdminOEmpleado && (
            <button
              onClick={() => setModalNuevoOpen(true)}
              className="px-5 py-2.5 bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo font-medium rounded-xl shadow-md shadow-claro-primario/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Reserva Presencial
            </button>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* CONTENEDOR PRINCIPAL                          */}
      {/* ============================================ */}
      <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-2xl shadow-sm overflow-hidden transition-colors">
        {!isPreview && (
          <div className="px-6 py-4 border-b border-claro-borde dark:border-oscuro-borde bg-claro-fondo/50 dark:bg-oscuro-fondo/50">
            <h2 className="font-semibold text-claro-texto dark:text-oscuro-texto">
              Listado de reservas
            </h2>
          </div>
        )}

        {/* ============================================ */}
        {/* BARRA DE BÚSQUEDA Y FILTROS                    */}
        {/* ============================================ */}
        {!isPreview && (
          <div className="px-4 sm:px-6 py-4 border-b border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
              {/* Buscador */}
              <div className="relative lg:col-span-6 min-w-0">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-claro-texto2 dark:text-oscuro-texto2 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por cliente, cancha o correo..."
                  className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto placeholder-claro-texto2 dark:placeholder-oscuro-texto2 focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40 transition-colors"
                />
              </div>

              {/* Filtro Estado */}
              <div className="lg:col-span-2 min-w-0">
                <label className="block text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1.5">
                  Estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40 transition-colors"
                >
                  <option value="">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="pendiente_pago">Pendiente de Pago</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="pagada">Pagada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="finalizada">Finalizada</option>
                </select>
              </div>

              {/* Por página */}
              <div className="lg:col-span-1 min-w-0">
                <label className="block text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1.5">
                  Mostrar
                </label>
                <select
                  value={porPagina}
                  onChange={(e) => setPorPagina(Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40 transition-colors"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Botón Limpiar filtros */}
              <div className="lg:col-span-3 min-w-0">
                <label className="hidden lg:block text-xs font-medium text-transparent mb-1.5 select-none">
                  &nbsp;
                </label>
                <button
                  onClick={limpiarFiltros}
                  disabled={!hayFiltrosActivos}
                  className={`w-full px-3 py-2.5 text-sm font-medium rounded-xl border transition-colors duration-200 whitespace-nowrap flex items-center justify-center gap-2
                    ${
                      hayFiltrosActivos
                        ? 'bg-claro-fondo dark:bg-oscuro-fondo border-claro-borde dark:border-oscuro-borde text-claro-texto2 dark:text-oscuro-texto2 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 cursor-pointer'
                        : 'bg-claro-fondo/40 dark:bg-oscuro-fondo/40 border-claro-borde/40 dark:border-oscuro-borde/40 text-claro-texto2/40 dark:text-oscuro-texto2/40 cursor-not-allowed'
                    }`}
                >
                  Limpiar filtros
                  {filtrosActivos > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-claro-primario dark:bg-oscuro-primario text-white text-[10px] font-bold">
                      {filtrosActivos}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="mt-3 text-xs text-claro-texto2 dark:text-oscuro-texto2">
              Mostrando{' '}
              <span className="font-semibold text-claro-texto dark:text-oscuro-texto">
                {indiceInicio}-{indiceFin}
              </span>{' '}
              de{' '}
              <span className="font-semibold text-claro-texto dark:text-oscuro-texto">
                {filtradas.length}
              </span>{' '}
              reservas
              {hayFiltrosActivos && (
                <span className="ml-1">(filtradas de {reservas.length} en total)</span>
              )}
            </div>
          </div>
        )}

        {/* Estados de carga / error / vacío */}
        {cargando ? (
          <div className="px-6 py-12 text-center text-claro-texto2 dark:text-oscuro-texto2 flex flex-col items-center gap-3">
            <svg
              className="animate-spin h-8 w-8 text-claro-primario"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Cargando reservas...</span>
          </div>
        ) : error ? (
          <div className="px-6 py-8 text-center text-red-500 font-medium">{error}</div>
        ) : reservasPaginadas.length === 0 ? (
          <div className="px-6 py-12 text-center text-claro-texto2 dark:text-oscuro-texto2">
            <svg
              className="w-12 h-12 mx-auto mb-3 opacity-40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {hayFiltrosActivos
              ? 'No se encontraron reservas con esos filtros.'
              : filtro === 'mias'
              ? 'No tenés reservas todavía. ¡Hacé tu primera reserva!'
              : 'No hay reservas registradas.'}
          </div>
        ) : isPreview ? (
          /* ============ MODO PREVIEW ============ */
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reservasPaginadas.map((r) => (
              <ReservaCard
                key={r.id_reserva}
                reserva={r}
                isAdmin={false}
                onPagar={undefined}
                onCancelar={undefined}
                onModificar={undefined}
                onVerificarPago={undefined}
              />
            ))}
          </div>
        ) : (
          <>
            {/* ============================================ */}
            {/* VISTA DESKTOP: TABLA ADAPTATIVA                */}
            {/* ============================================ */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left table-fixed">
                <colgroup>
                  <col className="w-12" />
                  {filtro === 'todas' && <col className="w-[20%]" />}
                  <col className={filtro === 'todas' ? 'w-[18%]' : 'w-[24%]'} />
                  <col className="w-[12%]" />
                  <col className="w-[14%]" />
                  <col className="w-[14%]" />
                  <col className="w-[20%]" />
                </colgroup>
                <thead>
                  <tr className="text-xs font-semibold text-claro-texto2 dark:text-oscuro-texto2 border-b border-claro-borde dark:border-oscuro-borde">
                    <th className="px-3 py-3 text-center">#</th>
                    {filtro === 'todas' && <th className="px-3 py-3">CLIENTE</th>}
                    <th className="px-3 py-3">CANCHA</th>
                    <th className="px-3 py-3">FECHA</th>
                    <th className="px-3 py-3">HORARIO</th>
                    <th className="px-3 py-3">ESTADO</th>
                    <th className="px-3 py-3 text-center">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-claro-borde dark:divide-oscuro-borde">
                  {reservasPaginadas.map((r, idx) => {
                    const estado = normalizarEstado(r.estado);
                    const puedeCancelar =
                      estado !== 'cancelada' && estado !== 'finalizada';
                    const puedePagar =
                      filtro === 'mias' &&
                      estado !== 'cancelada' &&
                      estado !== 'confirmada' &&
                      estado !== 'pagada';
                    const puedeModificar =
                      esAdmin && estado !== 'cancelada' && estado !== 'finalizada';
                    const puedeVerificar = esAdminOEmpleado && esVerificable(r);

                    const nombreCliente = getNombreCliente(r);
                    const numeroFila = (paginaActual - 1) * porPagina + idx + 1;

                    return (
                      <tr
                        key={r.id_reserva}
                        className="hover:bg-claro-fondo dark:hover:bg-oscuro-fondo/50 transition-colors"
                      >
                        <td className="px-3 py-4 text-center text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">
                          {numeroFila}
                        </td>
                        {filtro === 'todas' && (
                          <td className="px-3 py-4 text-sm font-medium text-claro-texto dark:text-oscuro-texto min-w-0">
                            <span className="block truncate" title={nombreCliente}>
                              {nombreCliente || '—'}
                            </span>
                          </td>
                        )}
                        <td className="px-3 py-4 text-sm text-claro-texto dark:text-oscuro-texto min-w-0">
                          <span className="block truncate" title={r.cancha_nombre}>
                            {r.cancha_nombre}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-claro-texto2 dark:text-oscuro-texto2 whitespace-nowrap">
                          {formatFecha(r.fecha_reserva)}
                        </td>
                        <td className="px-3 py-4 text-sm text-claro-texto2 dark:text-oscuro-texto2 whitespace-nowrap">
                          <span className="bg-claro-fondo dark:bg-oscuro-fondo px-2 py-1 rounded text-xs font-medium border border-claro-borde dark:border-oscuro-borde">
                            {formatHora(r.hora_inicio)} - {formatHora(r.hora_fin)}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <ReservaBadge estado={r.estado} />
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex flex-col items-stretch gap-1.5 w-full max-w-[120px] mx-auto">
                            {puedeVerificar && (
                              <button
                                onClick={() => handleVerificarPago(r)}
                                className="w-full py-1.5 text-xs font-medium text-white bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:text-oscuro-fondo dark:hover:bg-oscuro-hover rounded-lg transition-colors"
                              >
                                Verificar Pago
                              </button>
                            )}
                            {puedeModificar && (
                              <button
                                onClick={() => handleAbrirModificar(r)}
                                className="w-full py-1.5 text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2 bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-lg hover:text-claro-primario dark:hover:text-oscuro-primario hover:border-claro-primario/40 dark:hover:border-oscuro-primario/40 transition-colors"
                              >
                                Modificar
                              </button>
                            )}
                            {puedeCancelar && (
                              <button
                                onClick={() => handleAbrirCancelar(r)}
                                className="w-full py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800 transition-colors"
                              >
                                Cancelar
                              </button>
                            )}
                            {puedePagar && (
                              <button
                                onClick={() => handlePagar(r)}
                                className="w-full py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 rounded-lg transition-colors shadow-sm"
                              >
                                Pagar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ============================================ */}
            {/* VISTA MÓVIL: CARDS                             */}
            {/* ============================================ */}
            <div className="md:hidden divide-y divide-claro-borde dark:divide-oscuro-borde">
              {reservasPaginadas.map((r) => (
                <ReservaCard
                  key={r.id_reserva}
                  reserva={r}
                  isAdmin={esAdminOEmpleado}
                  onPagar={filtro === 'mias' ? handlePagar : undefined}
                  onCancelar={handleAbrirCancelar}
                  onModificar={esAdmin ? handleAbrirModificar : undefined}
                  onVerificarPago={esAdminOEmpleado ? handleVerificarPago : undefined}
                />
              ))}
            </div>

            {/* ============================================ */}
            {/* PAGINACIÓN NUMERADA                            */}
            {/* ============================================ */}
            {totalPaginas > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-claro-borde dark:border-oscuro-borde bg-claro-fondo/50 dark:bg-oscuro-fondo/50">
                <div className="text-xs text-claro-texto2 dark:text-oscuro-texto2">
                  Página{' '}
                  <span className="font-semibold text-claro-texto dark:text-oscuro-texto">
                    {paginaActual}
                  </span>{' '}
                  de{' '}
                  <span className="font-semibold text-claro-texto dark:text-oscuro-texto">
                    {totalPaginas}
                  </span>
                </div>

                <div className="flex items-center gap-1 flex-wrap justify-center">
                  <button
                    onClick={() => setPaginaActual(1)}
                    disabled={paginaActual === 1}
                    className="px-2.5 py-1.5 text-sm rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-primario dark:hover:text-oscuro-primario disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Primera página"
                  >
                    «
                  </button>
                  <button
                    onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                    disabled={paginaActual === 1}
                    className="px-2.5 py-1.5 text-sm rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-primario dark:hover:text-oscuro-primario disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Anterior"
                  >
                    ‹
                  </button>

                  {numerosPagina.map((n, i) =>
                    n === '...' ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="px-2 text-claro-texto2 dark:text-oscuro-texto2"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setPaginaActual(n)}
                        className={`min-w-[36px] px-2.5 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                          paginaActual === n
                            ? 'bg-claro-primario dark:bg-oscuro-primario text-white border-claro-primario dark:border-oscuro-primario shadow-sm'
                            : 'bg-claro-tarjeta dark:bg-oscuro-tarjeta border-claro-borde dark:border-oscuro-borde text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-primario dark:hover:text-oscuro-primario'
                        }`}
                      >
                        {n}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      setPaginaActual((p) => Math.min(totalPaginas, p + 1))
                    }
                    disabled={paginaActual === totalPaginas}
                    className="px-2.5 py-1.5 text-sm rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-primario dark:hover:text-oscuro-primario disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Siguiente"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => setPaginaActual(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                    className="px-2.5 py-1.5 text-sm rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-primario dark:hover:text-oscuro-primario disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Última página"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modales */}
      {filtro === 'todas' && esAdminOEmpleado && (
        <ModalReserva
          isOpen={modalNuevoOpen}
          onClose={() => setModalNuevoOpen(false)}
          onSave={cargarReservas}
          cancha={null}
        />
      )}

      {esAdmin && (
        <ModalModificarReserva
          isOpen={modalModificarOpen}
          onClose={() => {
            setModalModificarOpen(false);
            setReservaSeleccionada(null);
          }}
          onSave={cargarReservas}
          reserva={reservaSeleccionada}
        />
      )}

      <ModalCancelarReserva
        isOpen={modalCancelarOpen}
        onClose={() => {
          setModalCancelarOpen(false);
          setReservaSeleccionada(null);
        }}
        onConfirm={handleConfirmarCancelar}
        reserva={reservaSeleccionada}
        cargando={cancelando}
      />

      <ModalVerificarPago
        isOpen={modalVerificarOpen}
        idReserva={reservaSeleccionada?.id_reserva ?? null}
        onClose={() => {
          setModalVerificarOpen(false);
          setReservaSeleccionada(null);
        }}
        onComplete={cargarReservas}
      />

      <ModalPago
        isOpen={modalPagoOpen}
        reserva={reservaSeleccionada as any}
        onClose={() => {
          setModalPagoOpen(false);
          setReservaSeleccionada(null);
        }}
        onComplete={cargarReservas}
      />
    </div>
  );
};

export default ReservaList;