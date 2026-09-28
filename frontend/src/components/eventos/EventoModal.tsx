/**
 * ============================================================================
 * ARCHIVO: EventoModal.tsx
 * COMPONENTE: Modal para crear, editar o reprogramar un evento.
 * Incluye selección de servicios adicionales y cálculo de costos en vivo.
 * ============================================================================
 */

import { useEffect, useMemo, useState, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { eventoApi } from './evento.api';
import type {
  Evento,
  EventoFormData,
  ServicioSeleccionado,
} from './evento.types';

interface ServicioCatalogo {
  id_servicio: number;
  nombre: string;
  precio_referencia: number;
  tipo_servicio?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    formData: EventoFormData,
    servicios: ServicioSeleccionado[]
  ) => Promise<void>;
  evento: Evento | null;
  canchas: Array<{ id_cancha: number; nombre: string; precio_hora?: number }>;
  modoReprogramar?: boolean;
}

const FORM_VACIO: EventoFormData = {
  nombre_evento: '',
  descripcion: '',
  fecha_evento: '',
  hora_inicio: '',
  hora_fin: '',
  cupo_maximo: 0,
  tipo_evento: 'torneo',
  id_cancha: '',
};

export const EventoModal = ({
  isOpen,
  onClose,
  onSave,
  evento,
  canchas,
  modoReprogramar = false,
}: Props) => {
  const [formData, setFormData] = useState<EventoFormData>(FORM_VACIO);
  const [serviciosCatalogo, setServiciosCatalogo] = useState<ServicioCatalogo[]>([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<ServicioSeleccionado[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const modoEdicion = Boolean(evento);

  // Bloqueo scroll body
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Cargar servicios
  useEffect(() => {
    if (!isOpen) return;
    const cargarServicios = async () => {
      try {
        const lista = await eventoApi.getServicios();
        setServiciosCatalogo(
          lista.map((s: any) => ({
            id_servicio: s.id_servicio,
            nombre: s.nombre,
            precio_referencia: parseFloat(s.precio_referencia || 0),
            tipo_servicio: s.tipo_servicio,
          }))
        );
      } catch (err) {
        console.error('Error al cargar servicios:', err);
      }
    };
    cargarServicios();
  }, [isOpen]);

  // Precargar datos
  useEffect(() => {
    if (!isOpen) return;
    if (evento) {
      setFormData({
        nombre_evento: evento.nombre_evento || '',
        descripcion: evento.descripcion || '',
        fecha_evento: modoReprogramar
          ? ''
          : evento.fecha_evento
          ? evento.fecha_evento.substring(0, 10)
          : '',
        hora_inicio: modoReprogramar ? '' : (evento.hora_inicio || '').substring(0, 5),
        hora_fin: modoReprogramar ? '' : (evento.hora_fin || '').substring(0, 5),
        cupo_maximo: evento.cupo_maximo || 0,
        tipo_evento: evento.tipo_evento || 'torneo',
        id_cancha: evento.cancha_asignada?.id_cancha
          ? String(evento.cancha_asignada.id_cancha)
          : '',
      });
      setServiciosSeleccionados(
        (evento.servicios_adicionales || []).map((s: any) => ({
          id_servicio: s.id_servicio,
          costo_contratado: parseFloat(s.costo_contratado || 0),
        }))
      );
    } else {
      setFormData(FORM_VACIO);
      setServiciosSeleccionados([]);
    }
    setError('');
  }, [isOpen, evento, modoReprogramar]);

  // =====================================================
  // ⚠️ TODOS los hooks van ANTES del return null
  // =====================================================
  const previewCostos = useMemo(() => {
    let costoCancha = 0;
    if (formData.id_cancha && formData.hora_inicio && formData.hora_fin) {
      const cancha = canchas.find(
        (c) => c.id_cancha.toString() === formData.id_cancha.toString()
      );
      if (cancha && cancha.precio_hora) {
        const start = new Date(`1970-01-01T${formData.hora_inicio}Z`);
        const end = new Date(`1970-01-01T${formData.hora_fin}Z`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        if (hours > 0) costoCancha = hours * Number(cancha.precio_hora);
      }
    }
    const costoServicios = serviciosSeleccionados.reduce(
      (acc, curr) => acc + Number(curr.costo_contratado || 0),
      0
    );
    return { costoCancha, costoServicios, total: costoCancha + costoServicios };
  }, [formData, serviciosSeleccionados, canchas]);

  // =====================================================
  // Return temprano DESPUÉS de todos los hooks
  // =====================================================
  if (!isOpen) return null;

  // =====================================================
  // Handlers (no son hooks, pueden ir acá)
  // =====================================================
  const toggleServicio = (id_servicio: number, precio_referencia: number) => {
    const existe = serviciosSeleccionados.find(
      (s) => s.id_servicio === id_servicio
    );
    if (existe) {
      setServiciosSeleccionados(
        serviciosSeleccionados.filter((s) => s.id_servicio !== id_servicio)
      );
    } else {
      setServiciosSeleccionados([
        ...serviciosSeleccionados,
        { id_servicio, costo_contratado: Number(precio_referencia) || 0 },
      ]);
    }
  };

  const updateCostoServicio = (id_servicio: number, costo: number) => {
    setServiciosSeleccionados(
      serviciosSeleccionados.map((s) =>
        s.id_servicio === id_servicio ? { ...s, costo_contratado: costo } : s
      )
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (
      !formData.nombre_evento ||
      !formData.fecha_evento ||
      !formData.hora_inicio ||
      !formData.hora_fin ||
      !formData.id_cancha ||
      !formData.cupo_maximo
    ) {
      setError('Complete todos los campos obligatorios.');
      return;
    }
    if (formData.hora_inicio >= formData.hora_fin) {
      setError('La hora de fin debe ser posterior a la de inicio.');
      return;
    }

    setCargando(true);
    try {
      await onSave(formData, serviciosSeleccionados);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Error al guardar el evento'
      );
    } finally {
      setCargando(false);
    }
  };

  const titulo = modoReprogramar
    ? 'Reprogramar Evento'
    : modoEdicion
    ? 'Editar Evento'
    : 'Registrar Nuevo Evento';

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl shadow-2xl overflow-hidden border border-claro-borde dark:border-oscuro-borde flex flex-col">

        {/* Cabecera */}
        <div className="px-6 py-5 border-b border-claro-borde dark:border-oscuro-borde bg-claro-tinte dark:bg-oscuro-tinte shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-claro-primario dark:text-oscuro-primario">
                Eventos
              </p>
              <h2 className="mt-1 text-xl font-semibold text-claro-texto dark:text-oscuro-texto">
                {titulo}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-claro-texto2 hover:text-claro-texto dark:text-oscuro-texto2 dark:hover:text-oscuro-texto transition-colors"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto flex-1 bg-claro-tarjeta dark:bg-oscuro-tarjeta"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Columna izquierda: datos del evento */}
            <div className="space-y-4">
              <h4 className="font-semibold text-claro-texto dark:text-oscuro-texto border-b pb-2 border-claro-borde dark:border-oscuro-borde">
                Datos del Evento
              </h4>

              <div>
                <label className="block text-sm font-medium text-claro-texto dark:text-oscuro-texto mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto"
                  value={formData.nombre_evento}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre_evento: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-claro-texto dark:text-oscuro-texto mb-1">
                  Tipo *
                </label>
                <select
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto"
                  value={formData.tipo_evento}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo_evento: e.target.value })
                  }
                >
                  <option value="torneo">Torneo</option>
                  <option value="exhibicion">Exhibición</option>
                  <option value="recreativo">Recreativo</option>
                  <option value="social">Actividad Social</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-claro-texto dark:text-oscuro-texto mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto"
                    value={formData.fecha_evento}
                    onChange={(e) =>
                      setFormData({ ...formData, fecha_evento: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-claro-texto dark:text-oscuro-texto mb-1">
                    Aforo *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto"
                    value={formData.cupo_maximo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cupo_maximo:
                          e.target.value === '' ? 0 : parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-claro-texto dark:text-oscuro-texto mb-1">
                    Hora Inicio *
                  </label>
                  <input
                    type="time"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto"
                    value={formData.hora_inicio}
                    onChange={(e) =>
                      setFormData({ ...formData, hora_inicio: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-claro-texto dark:text-oscuro-texto mb-1">
                    Hora Fin *
                  </label>
                  <input
                    type="time"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto"
                    value={formData.hora_fin}
                    onChange={(e) =>
                      setFormData({ ...formData, hora_fin: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-claro-texto dark:text-oscuro-texto mb-1">
                  Cancha / Espacio *
                </label>
                <select
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto"
                  value={formData.id_cancha}
                  onChange={(e) =>
                    setFormData({ ...formData, id_cancha: e.target.value })
                  }
                >
                  <option value="">Seleccione una cancha</option>
                  {canchas.map((c) => (
                    <option key={c.id_cancha} value={c.id_cancha}>
                      {c.nombre}
                      {c.precio_hora ? ` (Bs. ${c.precio_hora}/hr)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-claro-texto dark:text-oscuro-texto mb-1">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto resize-none"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Columna derecha: servicios + costos */}
            <div className="space-y-4">
              <h4 className="font-semibold text-claro-texto dark:text-oscuro-texto border-b pb-2 border-claro-borde dark:border-oscuro-borde">
                Servicios Adicionales
              </h4>

              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                {serviciosCatalogo.length === 0 ? (
                  <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2">
                    Cargando servicios...
                  </p>
                ) : (
                  serviciosCatalogo.map((serv) => {
                    const sel = serviciosSeleccionados.find(
                      (s) => s.id_servicio === serv.id_servicio
                    );
                    return (
                      <div
                        key={serv.id_servicio}
                        className="flex items-center justify-between p-3 border border-claro-borde dark:border-oscuro-borde rounded-xl bg-claro-fondo dark:bg-oscuro-fondo"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-claro-primario"
                            checked={!!sel}
                            onChange={() =>
                              toggleServicio(
                                serv.id_servicio,
                                serv.precio_referencia
                              )
                            }
                          />
                          <span className="text-sm font-medium text-claro-texto dark:text-oscuro-texto">
                            {serv.nombre}
                          </span>
                        </div>
                        {sel && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-claro-texto2 dark:text-oscuro-texto2">
                              Bs.
                            </span>
                            <input
                              type="number"
                              min={0}
                              step="0.5"
                              className="w-20 px-2 py-1 text-sm rounded border border-claro-borde dark:border-oscuro-borde bg-white dark:bg-oscuro-tarjeta text-claro-texto dark:text-oscuro-texto"
                              value={sel.costo_contratado}
                              onChange={(e) =>
                                updateCostoServicio(
                                  serv.id_servicio,
                                  e.target.value === ''
                                    ? 0
                                    : parseFloat(e.target.value)
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Resumen */}
              <div className="mt-6 bg-claro-tinte dark:bg-oscuro-tinte p-4 rounded-xl border border-claro-borde dark:border-oscuro-borde">
                <h4 className="font-bold text-claro-texto dark:text-oscuro-texto mb-3">
                  Resumen de Costos
                </h4>
                <div className="flex justify-between text-sm mb-1 text-claro-texto2 dark:text-oscuro-texto2">
                  <span>Costo de Espacio:</span>
                  <span>Bs. {previewCostos.costoCancha.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-3 text-claro-texto2 dark:text-oscuro-texto2">
                  <span>Servicios Adicionales:</span>
                  <span>Bs. {previewCostos.costoServicios.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-claro-primario dark:text-oscuro-primario border-t border-claro-borde dark:border-oscuro-borde pt-2">
                  <span>Total a Cobrar:</span>
                  <span>Bs. {previewCostos.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium">
              {error}
            </div>
          )}
        </form>

        {/* Botones */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-claro-borde dark:border-oscuro-borde shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium rounded-lg text-claro-texto2 hover:bg-gray-100 dark:text-oscuro-texto2 dark:hover:bg-oscuro-fondo transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={cargando}
            className={`px-5 py-2 text-sm font-medium rounded-lg shadow-sm transition-all ${
              cargando
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo'
            }`}
          >
            {cargando
              ? 'Guardando...'
              : modoReprogramar
              ? 'Reprogramar Evento'
              : modoEdicion
              ? 'Guardar Cambios'
              : 'Crear Evento'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EventoModal;