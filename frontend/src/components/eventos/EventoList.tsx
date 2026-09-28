/**
 * ============================================================================
 * ARCHIVO: EventoList.tsx
 * COMPONENTE: Lista de eventos con modo + filtros + modales.
 *
 * MODOS:
 * - "catalogo" → cliente ve eventos disponibles e se inscribe
 * - "admin"    → admin/empleado gestiona eventos (CRUD completo)
 * - "preview"  → vitrina (3 eventos, sin acciones)
 * ============================================================================
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { eventoApi } from './evento.api';
import { EventoCard } from './EventoCard';
import EventoModal from './EventoModal';
import api from '../../services/api';
import type {
  Evento,
  EventoFormData,
  EventoListProps,
  ServicioSeleccionado,
} from './evento.types';

const PREVIEW_LIMIT = 3;

interface CanchaSimple {
  id_cancha: number;
  nombre: string;
  precio_hora?: number;
}

export const EventoList = ({
  modo = 'catalogo',
  title,
  subtitle,
}: EventoListProps) => {
  const isPreview = modo === 'preview';
  const { usuario } = useAuth();

  const isAdmin = Boolean(
    usuario && (usuario.rol === 'Admin' || usuario.rol === 'Administrador')
  );
  const isEmpleado = Boolean(
    usuario && (usuario.rol === 'Empleado' || usuario.rol === 'empleado')
  );
  const isAdminOEmpleado = isAdmin || isEmpleado;
  const isCliente = Boolean(
    usuario && usuario.rol?.toLowerCase() === 'cliente'
  );

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [canchas, setCanchas] = useState<CanchaSimple[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState<{
    tipo: 'exito' | 'error';
    texto: string;
  } | null>(null);

  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroCancha, setFiltroCancha] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [eventoEnEdicion, setEventoEnEdicion] = useState<Evento | null>(null);
  const [modoReprogramar, setModoReprogramar] = useState(false);

  // =====================================================
  // FETCH
  // =====================================================
  const cargarEventos = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const filtros: any = {};
      if (filtroTipo) filtros.tipo = filtroTipo;
      if (filtroFecha) filtros.fecha = filtroFecha;
      if (filtroCancha) filtros.id_cancha = filtroCancha;

      if (modo === 'catalogo') filtros.disponibles = true;

      const data = await eventoApi.getAll(filtros);
      setEventos(data);
    } catch (err) {
      console.error('Error al cargar eventos:', err);
      setError('No se pudieron cargar los eventos.');
    } finally {
      setCargando(false);
    }
  }, [filtroTipo, filtroFecha, filtroCancha, modo]);

  const cargarCanchas = useCallback(async () => {
    try {
      const res = await api.get('/canchas');
      const lista = res.data?.data || res.data || [];
      setCanchas(Array.isArray(lista) ? lista : []);
    } catch (err) {
      console.error('Error al cargar canchas:', err);
    }
  }, []);

  useEffect(() => {
    cargarCanchas();
  }, [cargarCanchas]);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  // =====================================================
  // ACCIONES
  // =====================================================
  const handleInscribir = async (idEvento: number) => {
    if (!isCliente) {
      setMensaje({
        tipo: 'error',
        texto: 'Solo los clientes pueden inscribirse a eventos.',
      });
      return;
    }
    try {
      await eventoApi.inscribir(idEvento);
      setMensaje({ tipo: 'exito', texto: '¡Inscripción exitosa al evento!' });
      cargarEventos();
      setTimeout(() => setMensaje(null), 4000);
    } catch (err: any) {
      setMensaje({
        tipo: 'error',
        texto: err.response?.data?.message || 'Error al inscribirse.',
      });
    }
  };

  const abrirModalCrear = () => {
    setEventoEnEdicion(null);
    setModoReprogramar(false);
    setModalOpen(true);
  };

  const abrirModalEditar = (evento: Evento) => {
    setEventoEnEdicion(evento);
    setModoReprogramar(false);
    setModalOpen(true);
  };

  const abrirModalReprogramar = (evento: Evento) => {
    setEventoEnEdicion(evento);
    setModoReprogramar(true);
    setModalOpen(true);
  };

  const handleGuardar = async (
    formData: EventoFormData,
    servicios: ServicioSeleccionado[]
  ) => {
    try {
      if (modoReprogramar && eventoEnEdicion) {
        await eventoApi.reprogramar(eventoEnEdicion.id_evento, formData, servicios);
        setMensaje({ tipo: 'exito', texto: 'Evento reprogramado exitosamente.' });
      } else if (eventoEnEdicion) {
        await eventoApi.update(eventoEnEdicion.id_evento, formData, servicios);
        setMensaje({ tipo: 'exito', texto: 'Evento actualizado exitosamente.' });
      } else {
        await eventoApi.create(formData, servicios);
        setMensaje({ tipo: 'exito', texto: 'Evento creado exitosamente.' });
      }
      setModalOpen(false);
      setEventoEnEdicion(null);
      setModoReprogramar(false);
      cargarEventos();
      setTimeout(() => setMensaje(null), 4000);
    } catch (err: any) {
      throw err;
    }
  };

  const handleCancelarEvento = async (evento: Evento) => {
    const motivo = window.prompt('Motivo de la cancelación:');
    if (!motivo) return;
    try {
      const res = await eventoApi.cancelar(evento.id_evento, motivo);
      const afectados = res?.data?.afectados || [];
      const texto =
        afectados.length > 0
          ? `Evento cancelado. Clientes a notificar: ${afectados.length}`
          : 'Evento cancelado exitosamente.';
      setMensaje({ tipo: 'exito', texto });
      cargarEventos();
      setTimeout(() => setMensaje(null), 4000);
    } catch (err: any) {
      setMensaje({
        tipo: 'error',
        texto: err.response?.data?.message || 'Error al cancelar el evento.',
      });
    }
  };

  const limpiarFiltros = () => {
    setFiltroTipo('');
    setFiltroFecha('');
    setFiltroCancha('');
  };

  const hayFiltrosActivos =
    filtroTipo !== '' || filtroFecha !== '' || filtroCancha !== '';

  const eventosOrdenados = useMemo(() => {
    return [...eventos].sort((a, b) => {
      const aProgramado = a.estado === 'programado' ? 0 : 1;
      const bProgramado = b.estado === 'programado' ? 0 : 1;
      if (aProgramado !== bProgramado) return aProgramado - bProgramado;
      return (
        new Date(a.fecha_evento).getTime() - new Date(b.fecha_evento).getTime()
      );
    });
  }, [eventos]);

  const eventosAMostrar = isPreview
    ? eventosOrdenados.slice(0, PREVIEW_LIMIT)
    : eventosOrdenados;

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="space-y-6">
      {/* Cabecera */}
      {!isPreview && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto">
              {title ||
                (modo === 'admin'
                  ? 'Gestión de Eventos'
                  : 'Eventos Disponibles')}
            </h2>
            <p className="text-claro-texto2 dark:text-oscuro-texto2 mt-1">
              {subtitle ||
                (modo === 'admin'
                  ? 'Programa, edita y administra los eventos del complejo.'
                  : 'Inscríbete en los próximos eventos deportivos y sociales.')}
            </p>
          </div>

          {modo === 'admin' && isAdminOEmpleado && (
            <button
              onClick={abrirModalCrear}
              className="px-5 py-2.5 bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nuevo Evento
            </button>
          )}
        </div>
      )}

      {/* Banner informativo */}
      {modo === 'catalogo' && !isPreview && (
        <div className="bg-claro-tinte dark:bg-oscuro-tinte border border-claro-primario/20 dark:border-oscuro-primario/20 rounded-2xl p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 mt-0.5 shrink-0 text-claro-primario dark:text-oscuro-primario"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2">
            <span className="font-semibold text-claro-texto dark:text-oscuro-texto">
              ¿Cómo funciona esta sección?{' '}
            </span>
            Aquí puedes ver los eventos programados por el complejo, revisar cupos
            y costo, e inscribirte con un solo clic.
          </p>
        </div>
      )}

      {/* Mensaje */}
      {mensaje && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${
            mensaje.tipo === 'exito'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {mensaje.texto}
          <button
            onClick={() => setMensaje(null)}
            className="float-right font-bold"
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}

      {/* Filtros */}
      {!isPreview && (
        <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-4 rounded-2xl border border-claro-borde dark:border-oscuro-borde flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
              Tipo de Evento
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:ring-2 focus:ring-claro-primario dark:focus:ring-oscuro-primario outline-none"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="torneo">Torneo</option>
              <option value="exhibicion">Exhibición</option>
              <option value="recreativo">Recreativo</option>
              <option value="social">Actividad Social</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
              Fecha
            </label>
            <input
              type="date"
              className="w-full px-4 py-2.5 rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:ring-2 focus:ring-claro-primario dark:focus:ring-oscuro-primario outline-none"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
              Cancha / Espacio
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:ring-2 focus:ring-claro-primario dark:focus:ring-oscuro-primario outline-none"
              value={filtroCancha}
              onChange={(e) => setFiltroCancha(e.target.value)}
            >
              <option value="">Todas</option>
              {canchas.map((c) => (
                <option key={c.id_cancha} value={c.id_cancha}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          {hayFiltrosActivos && (
            <div className="flex items-end">
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2.5 text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 bg-claro-fondo dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde rounded-xl hover:text-claro-primario dark:hover:text-oscuro-primario transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lista */}
      {cargando ? (
        <div className="text-center py-10 text-claro-texto2 dark:text-oscuro-texto2">
          Cargando eventos...
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500 font-medium">{error}</div>
      ) : eventosAMostrar.length === 0 ? (
        <div className="text-center py-10 bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl border border-claro-borde dark:border-oscuro-borde">
          <div className="text-5xl mb-3">🏆</div>
          <p className="text-lg font-medium text-claro-texto dark:text-oscuro-texto">
            No se encontraron eventos
          </p>
          <p className="text-claro-texto2 dark:text-oscuro-texto2">
            {hayFiltrosActivos
              ? 'Intenta ajustar los filtros de búsqueda.'
              : 'Aún no hay eventos registrados.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventosAMostrar.map((evento) => (
            <EventoCard
              key={evento.id_evento}
              evento={evento}
              modo={modo}
              isAdmin={isAdmin}
              isCliente={isCliente}
              onInscribir={handleInscribir}
              onEditar={abrirModalEditar}
              onCancelar={handleCancelarEvento}
              onReprogramar={abrirModalReprogramar}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modo === 'admin' && isAdminOEmpleado && (
        <EventoModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEventoEnEdicion(null);
            setModoReprogramar(false);
          }}
          onSave={handleGuardar}
          evento={eventoEnEdicion}
          canchas={canchas}
          modoReprogramar={modoReprogramar}
        />
      )}
    </div>
  );
};

export default EventoList;