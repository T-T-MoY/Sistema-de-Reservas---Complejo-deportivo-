/**
 * ============================================================================
 * ARCHIVO: ReservaBadge.tsx
 * COMPONENTE: Badge de estado de reserva.
 * Normaliza el estado (mayúsculas/minúsculas) y aplica colores del sistema.
 * ============================================================================
 */

import type { EstadoReserva } from './reserva.types';

interface Props {
  estado: string;
}

const normalizarEstado = (estado: string): string => {
  const raw = (estado || '').toString().trim().toLowerCase().replace(/\s+/g, '_');
  if (raw === 'pendiente_pago' || raw === 'pendiente-pago') return 'pendiente_pago';
  if (raw === 'confirmada') return 'confirmada';
  if (raw === 'cancelada') return 'cancelada';
  if (raw === 'pagada') return 'pagada';
  if (raw === 'finalizada') return 'finalizada';
  if (raw === 'pendiente') return 'pendiente';
  return raw;
};

const LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  pendiente_pago: 'Pendiente de Pago',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  pagada: 'Pagada',
  finalizada: 'Finalizada',
};

export const ReservaBadge = ({ estado }: Props) => {
  const key = normalizarEstado(estado);
  const label = LABELS[key] || estado;

  const clases: Record<string, string> = {
    pendiente:
      'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
    pendiente_pago:
      'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
    confirmada:
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    pagada:
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    cancelada:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    finalizada:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${
        clases[key] || 'bg-gray-100 text-gray-700 border-gray-200'
      }`}
    >
      {label}
    </span>
  );
};

export default ReservaBadge;