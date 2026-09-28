/**
 * ============================================================================
 * ARCHIVO: EventoCard.tsx
 * COMPONENTE: Tarjeta individual de evento (grid de catálogo y admin).
 * ============================================================================
 */

import { EventoBadge } from './EventoBadge';
import type { EventoCardProps } from './evento.types';

const formatFecha = (fecha: string): string => {
  try {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return fecha;
  }
};

const formatHora = (hora: string): string => (hora ? hora.slice(0, 5) : '');

export const EventoCard = ({
  evento,
  modo,
  isAdmin = false,
  isCliente = false,
  onInscribir,
  onEditar,
  onCancelar,
  onReprogramar,
}: EventoCardProps) => {
  const fechaEvento = new Date(evento.fecha_evento);
  const esFechaPasada = fechaEvento < new Date();
  const sinCupo = (evento.cupos_restantes ?? 0) <= 0;
  const estaCancelado = evento.estado === 'cancelado';
  const estaFinalizado = evento.estado === 'finalizado';

  const puedeInscribir =
    modo === 'catalogo' && isCliente && !estaCancelado && !esFechaPasada && !sinCupo;

  const puedeEditar = modo === 'admin' && isAdmin && evento.estado === 'programado';
  const puedeCancelar = modo === 'admin' && isAdmin && evento.estado === 'programado';
  const puedeReprogramar = modo === 'admin' && isAdmin && estaCancelado;

  return (
    <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl border border-claro-borde dark:border-oscuro-borde overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">

      {/* Cabecera con tipo + título */}
      <div className="h-32 bg-claro-tinte dark:bg-oscuro-tinte p-6 flex flex-col justify-end relative">
        <span className="absolute top-4 right-4 bg-white dark:bg-oscuro-fondo px-3 py-1 rounded-full text-xs font-bold text-claro-primario dark:text-oscuro-primario shadow-sm capitalize">
          {evento.tipo_evento}
        </span>
        {modo === 'admin' && (
          <span className="absolute top-4 left-4">
            <EventoBadge estado={evento.estado} tipo="evento" />
          </span>
        )}
        <h3 className="text-xl font-bold text-claro-texto dark:text-oscuro-texto line-clamp-1">
          {evento.nombre_evento}
        </h3>
      </div>

      {/* Cuerpo */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="space-y-3 mb-6 flex-1">

          {/* Fecha */}
          <div className="flex items-center gap-3 text-claro-texto2 dark:text-oscuro-texto2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium capitalize">{formatFecha(evento.fecha_evento)}</span>
          </div>

          {/* Horario */}
          <div className="flex items-center gap-3 text-claro-texto2 dark:text-oscuro-texto2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">
              {formatHora(evento.hora_inicio)} - {formatHora(evento.hora_fin)}
            </span>
          </div>

          {/* Cancha */}
          <div className="flex items-center gap-3 text-claro-texto2 dark:text-oscuro-texto2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium line-clamp-1">
              {evento.cancha_asignada?.nombre}
              {evento.cancha_asignada?.ubicacion ? ` · ${evento.cancha_asignada.ubicacion}` : ''}
            </span>
          </div>

          {/* Cupos */}
          <div className="flex items-center gap-3 text-claro-texto2 dark:text-oscuro-texto2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-sm font-medium">
              Cupos: {evento.cupos_restantes ?? 0} / {evento.cupo_maximo}
            </span>
          </div>

          {/* Costo */}
          {typeof evento.costo_total === 'number' && evento.costo_total > 0 && (
            <div className="flex items-center gap-3 text-claro-texto2 dark:text-oscuro-texto2">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">
                Costo: Bs. {evento.costo_total.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Acciones según modo */}
        {modo === 'catalogo' && isCliente && (
          <button
            onClick={() => onInscribir?.(evento.id_evento)}
            disabled={!puedeInscribir}
            className={`w-full py-3 rounded-xl font-bold transition-all text-sm ${
              puedeInscribir
                ? 'bg-claro-primario text-white hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover shadow-md hover:shadow-lg'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {estaCancelado
              ? 'Evento Cancelado'
              : estaFinalizado
              ? 'Evento Finalizado'
              : esFechaPasada
              ? 'Evento Finalizado'
              : sinCupo
              ? 'Agotado'
              : 'Inscribirse Ahora'}
          </button>
        )}

        {modo === 'admin' && isAdmin && (
          <div className="flex flex-wrap gap-2">
            {puedeEditar && (
              <button
                onClick={() => onEditar?.(evento)}
                className="flex-1 min-w-[100px] py-2 text-sm font-medium rounded-lg border border-claro-borde dark:border-oscuro-borde text-claro-texto dark:text-oscuro-texto hover:bg-claro-tinte dark:hover:bg-oscuro-tinte transition-colors"
              >
                Editar
              </button>
            )}
            {puedeCancelar && (
              <button
                onClick={() => onCancelar?.(evento)}
                className="flex-1 min-w-[100px] py-2 text-sm font-medium rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Cancelar
              </button>
            )}
            {puedeReprogramar && (
              <button
                onClick={() => onReprogramar?.(evento)}
                className="flex-1 min-w-[100px] py-2 text-sm font-medium rounded-lg bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo transition-colors"
              >
                Reprogramar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventoCard;