import { ReservaBadge } from './ReservaBadge';
import type { ReservaCardProps } from './reserva.types';

const formatFecha = (fecha: string): string => {
  try {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return fecha;
  }
};

const formatHora = (hora: string): string => (hora ? hora.slice(0, 5) : '');

const normalizarEstado = (estado: string): string =>
  (estado || '').toString().trim().toLowerCase().replace(/\s+/g, '_');

export const ReservaCard = ({
  reserva,
  isAdmin,
  onPagar,
  onCancelar,
  onModificar,
  onVerificarPago,
}: ReservaCardProps) => {
  const estado = normalizarEstado(reserva.estado);

  const puedeCancelar = estado !== 'cancelada' && estado !== 'finalizada';
  const puedePagar =
    !isAdmin &&
    estado !== 'cancelada' &&
    estado !== 'confirmada' &&
    estado !== 'pagada';
  const puedeModificar = isAdmin && estado !== 'cancelada' && estado !== 'finalizada';
  const puedeVerificar =
    isAdmin && (estado === 'pendiente' || estado === 'pendiente_pago');

  const nombreCliente = `${reserva.cliente_nombre || reserva.nombre || ''} ${
    reserva.apellido_paterno || reserva.paterno || ''
  }`.trim();

  return (
    <div className="p-4 sm:p-5 flex flex-col gap-4 hover:bg-claro-fondo/30 dark:hover:bg-oscuro-fondo/30 transition-colors">
      {/* Cabecera de la Tarjeta */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-claro-texto dark:text-oscuro-texto truncate">
            {reserva.cancha_nombre || 'Cancha'}
          </h3>
          {isAdmin && nombreCliente && (
            <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2 truncate mt-0.5">
              {nombreCliente}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <ReservaBadge estado={reserva.estado} />
        </div>
      </div>

      {/* Info de Fecha y Hora (Caja Resaltada) */}
      <div className="grid grid-cols-2 gap-3 bg-claro-fondo dark:bg-oscuro-fondo rounded-xl p-3 border border-claro-borde dark:border-oscuro-borde">
        <div>
          <p className="text-[11px] font-medium text-claro-texto2 dark:text-oscuro-texto2 uppercase tracking-wider mb-1">
            Fecha
          </p>
          <p className="text-sm font-medium text-claro-texto dark:text-oscuro-texto">
            {formatFecha(reserva.fecha_reserva)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium text-claro-texto2 dark:text-oscuro-texto2 uppercase tracking-wider mb-1">
            Horario
          </p>
          <p className="text-sm font-medium text-claro-texto dark:text-oscuro-texto">
            <span className="bg-white dark:bg-oscuro-tarjeta px-2 py-0.5 rounded border border-claro-borde dark:border-oscuro-borde">
              {formatHora(reserva.hora_inicio)} - {formatHora(reserva.hora_fin)}
            </span>
          </p>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-wrap gap-2 mt-1">
        {puedeVerificar && onVerificarPago && (
          <button
            onClick={() => onVerificarPago(reserva)}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2.5 px-3 text-sm font-medium rounded-xl bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Verificar Pago
          </button>
        )}
        
        {puedePagar && onPagar && (
          <button
            onClick={() => onPagar(reserva)}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2.5 px-3 text-sm font-medium rounded-xl bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Pagar
          </button>
        )}
        
        {puedeModificar && onModificar && (
          <button
            onClick={() => onModificar(reserva)}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 px-3 text-sm font-medium rounded-xl border border-claro-borde dark:border-oscuro-borde text-claro-texto dark:text-oscuro-texto hover:text-claro-primario dark:hover:text-oscuro-primario hover:bg-claro-fondo dark:hover:bg-oscuro-fondo transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Modificar
          </button>
        )}
        
        {puedeCancelar && onCancelar && (
          <button
            onClick={() => onCancelar(reserva)}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 px-3 text-sm font-medium rounded-xl border border-claro-borde dark:border-oscuro-borde text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};

export default ReservaCard;