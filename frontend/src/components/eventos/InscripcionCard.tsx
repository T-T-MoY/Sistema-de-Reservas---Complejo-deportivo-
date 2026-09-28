/**
 * ============================================================================
 * ARCHIVO: InscripcionCard.tsx
 * COMPONENTE: Tarjeta de una inscripción del cliente a un evento.
 * ============================================================================
 */

import { EventoBadge } from './EventoBadge';
import type { Inscripcion } from './evento.types';

interface Props {
  inscripcion: Inscripcion;
  onCancelar?: (idEvento: number) => void;
  cancelando?: boolean;
}

const formatFecha = (fecha: string): string => {
  try {
    return new Date(fecha).toLocaleDateString('es-ES', {
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

export const InscripcionCard = ({
  inscripcion,
  onCancelar,
  cancelando = false,
}: Props) => {
  const fechaEvento = new Date(inscripcion.fecha_evento);
  const esFechaPasada = fechaEvento < new Date();
  const estaCancelada = inscripcion.estado_inscripcion !== 'confirmada';
  const eventoCancelado = inscripcion.estado_evento === 'cancelado';

  const puedeCancelar =
    !esFechaPasada && !estaCancelada && !eventoCancelado && !!onCancelar;

  return (
    <div
      className={`bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl border border-claro-borde dark:border-oscuro-borde overflow-hidden flex flex-col ${
        estaCancelada ? 'opacity-70' : ''
      }`}
    >
      {/* Cabecera */}
      <div
        className={`p-5 border-b border-claro-borde dark:border-oscuro-borde ${
          eventoCancelado
            ? 'bg-red-50 dark:bg-red-900/10'
            : 'bg-claro-tinte dark:bg-oscuro-tinte'
        }`}
      >
        <div className="flex justify-between items-start mb-2 gap-2">
          <span className="bg-white dark:bg-oscuro-fondo px-3 py-1 rounded-full text-xs font-bold text-claro-primario dark:text-oscuro-primario shadow-sm capitalize">
            {inscripcion.tipo_evento}
          </span>
          <EventoBadge
            estado={
              eventoCancelado
                ? 'cancelado'
                : estaCancelada
                ? 'cancelada'
                : 'confirmada'
            }
            tipo="inscripcion"
          />
        </div>
        <h3 className="text-lg font-bold text-claro-texto dark:text-oscuro-texto line-clamp-1">
          {inscripcion.nombre_evento}
        </h3>
      </div>

      {/* Cuerpo */}
      <div className="p-5 flex-1 flex flex-col space-y-3">
        <div className="flex items-center gap-3 text-claro-texto2 dark:text-oscuro-texto2 text-sm">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">{formatFecha(inscripcion.fecha_evento)}</span>
        </div>

        <div className="flex items-center gap-3 text-claro-texto2 dark:text-oscuro-texto2 text-sm">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">
            {formatHora(inscripcion.hora_inicio)} - {formatHora(inscripcion.hora_fin)}
          </span>
        </div>

        {inscripcion.cancha_nombre && (
          <div className="flex items-center gap-3 text-claro-texto2 dark:text-oscuro-texto2 text-sm">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium line-clamp-1">{inscripcion.cancha_nombre}</span>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-claro-borde dark:border-oscuro-borde text-xs text-claro-texto2 dark:text-oscuro-texto2">
          Inscrito el:{' '}
          {new Date(inscripcion.fecha_inscripcion).toLocaleString('es-ES')}
        </div>

        {puedeCancelar && (
          <button
            onClick={() => onCancelar?.(inscripcion.id_evento)}
            disabled={cancelando}
            className={`w-full py-2.5 rounded-xl font-bold transition-all text-sm border-2 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 ${
              cancelando ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {cancelando ? 'Cancelando...' : 'Cancelar Inscripción'}
          </button>
        )}
      </div>
    </div>
  );
};

export default InscripcionCard;