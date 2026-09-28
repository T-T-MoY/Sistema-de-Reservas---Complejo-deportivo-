/**
 * ============================================================================
 * ARCHIVO: ReservaList.tsx
 * COMPONENTE: Lista de reservas con modo + filtros + modales.
 * ============================================================================
 */

import { useEffect, useMemo, useState } from 'react';
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

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [modalModificarOpen, setModalModificarOpen] = useState(false);
  const [modalCancelarOpen, setModalCancelarOpen] = useState(false);
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [modalVerificarOpen, setModalVerificarOpen] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null);
  const [cancelando, setCancelando] = useState(false);

  const cargarReservas = async () => {
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
  };

  useEffect(() => {
    cargarReservas();
  }, [filtro]);

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

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('');
  };

  const hayFiltrosActivos = busqueda.trim() !== '' || filtroEstado !== '';

  const filtradas = useMemo(() => {
    // 1. Filtrar los resultados
    let resultado = reservas.filter((r) => {
      if (busqueda.trim()) {
        const term = busqueda.toLowerCase();
        const nombreCliente = `${r.cliente_nombre || r.nombre || ''} ${
          r.apellido_paterno || r.paterno || ''
        }`.toLowerCase();
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

    // 2. Ordenar alfabéticamente
    resultado.sort((a, b) => {
      const nombreA = `${a.cliente_nombre || a.nombre || ''} ${a.apellido_paterno || a.paterno || ''}`.trim().toLowerCase();
      const nombreB = `${b.cliente_nombre || b.nombre || ''} ${b.apellido_paterno || b.paterno || ''}`.trim().toLowerCase();
      
      // Si no hay nombre de cliente, usamos el nombre de la cancha como respaldo
      const compareA = nombreA || (a.cancha_nombre || '').toLowerCase();
      const compareB = nombreB || (b.cancha_nombre || '').toLowerCase();

      return compareA.localeCompare(compareB);
    });

    return resultado;
  }, [reservas, busqueda, filtroEstado]);

  const reservasAMostrar = isPreview ? filtradas.slice(0, PREVIEW_LIMIT) : filtradas;

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

      {/* Barra de Búsqueda y Filtros */}
      {!isPreview && (
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            {/* Buscador mejorado con focus-within */}
            <div className="flex items-center gap-3 flex-1 px-4 py-2.5 rounded-xl border border-claro-borde dark:border-oscuro-borde bg-white dark:bg-oscuro-tarjeta shadow-sm transition-all focus-within:ring-2 focus-within:ring-claro-primario/30 dark:focus-within:ring-oscuro-primario/30 focus-within:border-claro-primario dark:focus-within:border-oscuro-primario">
              <svg
                className="w-5 h-5 text-claro-texto2/70 dark:text-oscuro-texto2/70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Buscar por cliente, cancha o correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full text-claro-texto dark:text-oscuro-texto placeholder:text-claro-texto2/60 dark:placeholder:text-oscuro-texto2/60"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="p-1 rounded-full text-claro-texto2/70 dark:text-oscuro-texto2/70 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-claro-texto dark:hover:text-oscuro-texto transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Select de Estado */}
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-claro-borde dark:border-oscuro-borde bg-white dark:bg-oscuro-tarjeta shadow-sm text-sm text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/30 focus:border-claro-primario transition-all min-w-[180px] cursor-pointer"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="pendiente_pago">Pendiente de Pago</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
            </select>

            {/* Botón Limpiar */}
            {hayFiltrosActivos && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="px-4 py-2.5 text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 bg-claro-fondo dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde rounded-xl hover:text-claro-primario dark:hover:text-oscuro-primario hover:bg-white dark:hover:bg-oscuro-tarjeta transition-all whitespace-nowrap shadow-sm"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {hayFiltrosActivos && (
            <p className="text-xs text-claro-texto2 dark:text-oscuro-texto2 px-1">
              Mostrando{' '}
              <span className="font-semibold text-claro-primario dark:text-oscuro-primario">
                {filtradas.length}
              </span>{' '}
              de {reservas.length} reservas
            </p>
          )}
        </div>
      )}

      {/* Contenedor Principal (Tabla/Lista) */}
      <div className="bg-white dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-2xl shadow-sm overflow-hidden">
        {cargando ? (
          <div className="px-6 py-12 text-center text-claro-texto2 dark:text-oscuro-texto2 flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-claro-primario" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Cargando reservas...</span>
          </div>
        ) : error ? (
          <div className="px-6 py-8 text-center text-red-500 font-medium">{error}</div>
        ) : reservasAMostrar.length === 0 ? (
          <div className="px-6 py-12 text-center text-claro-texto2 dark:text-oscuro-texto2">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {hayFiltrosActivos
              ? 'No se encontraron reservas con esos filtros.'
              : filtro === 'mias'
              ? 'No tenés reservas todavía. ¡Hacé tu primera reserva!'
              : 'No hay reservas registradas.'}
          </div>
        ) : (
          <>
            {/* Vista Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-claro-fondo/80 dark:bg-oscuro-fondo/80 backdrop-blur-sm border-b border-claro-borde dark:border-oscuro-borde">
                    {filtro === 'todas' && <th className="px-6 py-4 text-xs font-bold text-claro-texto2 dark:text-oscuro-texto2 uppercase tracking-wider">Cliente</th>}
                    <th className="px-6 py-4 text-xs font-bold text-claro-texto2 dark:text-oscuro-texto2 uppercase tracking-wider">Cancha</th>
                    <th className="px-6 py-4 text-xs font-bold text-claro-texto2 dark:text-oscuro-texto2 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-xs font-bold text-claro-texto2 dark:text-oscuro-texto2 uppercase tracking-wider">Horario</th>
                    <th className="px-6 py-4 text-xs font-bold text-claro-texto2 dark:text-oscuro-texto2 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-xs font-bold text-claro-texto2 dark:text-oscuro-texto2 uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-claro-borde dark:divide-oscuro-borde">
                  {reservasAMostrar.map((r) => {
                    const estado = normalizarEstado(r.estado);
                    const puedeCancelar = estado !== 'cancelada' && estado !== 'finalizada';
                    const puedePagar =
                      filtro === 'mias' &&
                      estado !== 'cancelada' &&
                      estado !== 'confirmada' &&
                      estado !== 'pagada';
                    const puedeModificar =
                      esAdmin && estado !== 'cancelada' && estado !== 'finalizada';
                    const puedeVerificar = esAdminOEmpleado && esVerificable(r);

                    const nombreCliente = `${r.cliente_nombre || r.nombre || ''} ${
                      r.apellido_paterno || r.paterno || ''
                    }`.trim();

                    return (
                      <tr
                        key={r.id_reserva}
                        className="hover:bg-gray-50 dark:hover:bg-oscuro-fondo/50 transition-colors"
                      >
                        {filtro === 'todas' && (
                          <td className="px-6 py-4 text-sm font-medium text-claro-texto dark:text-oscuro-texto">
                            {nombreCliente || '—'}
                          </td>
                        )}
                        <td className="px-6 py-4 text-sm text-claro-texto dark:text-oscuro-texto">
                          {r.cancha_nombre}
                        </td>
                        <td className="px-6 py-4 text-sm text-claro-texto2 dark:text-oscuro-texto2">
                          {formatFecha(r.fecha_reserva)}
                        </td>
                        <td className="px-6 py-4 text-sm text-claro-texto2 dark:text-oscuro-texto2">
                          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-medium">
                            {formatHora(r.hora_inicio)} - {formatHora(r.hora_fin)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <ReservaBadge estado={r.estado} />
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                          {puedeVerificar && (
                            <button
                              onClick={() => handleVerificarPago(r)}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover rounded-lg transition-colors"
                            >
                              Verificar Pago
                            </button>
                          )}
                          {puedeModificar && (
                            <button
                              onClick={() => handleAbrirModificar(r)}
                              className="px-3 py-1.5 text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 bg-white dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde rounded-lg hover:text-claro-primario dark:hover:text-oscuro-primario hover:border-claro-primario/30 transition-all"
                            >
                              Modificar
                            </button>
                          )}
                          {puedeCancelar && (
                            <button
                              onClick={() => handleAbrirCancelar(r)}
                              className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 transition-all"
                            >
                              Cancelar
                            </button>
                          )}
                          {puedePagar && (
                            <button
                              onClick={() => handlePagar(r)}
                              className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 rounded-lg transition-colors shadow-sm"
                            >
                              Pagar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Vista Móvil */}
            <div className="md:hidden divide-y divide-claro-borde dark:divide-oscuro-borde">
              {reservasAMostrar.map((r) => (
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