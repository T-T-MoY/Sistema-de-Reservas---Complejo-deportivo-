/**
 * ============================================================================
 * ARCHIVO: EventoBadge.tsx
 * COMPONENTE: Badge de estado de evento o inscripción.
 * ============================================================================
 */

interface Props {
  estado: string;
  tipo?: 'evento' | 'inscripcion';
}

const normalizar = (estado: string): string =>
  (estado || '').toString().trim().toLowerCase();

const LABELS_EVENTO: Record<string, string> = {
  programado: 'Programado',
  cancelado: 'Cancelado',
  finalizado: 'Finalizado',
};

const LABELS_INSCRIPCION: Record<string, string> = {
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  pendiente: 'Pendiente',
};

export const EventoBadge = ({ estado, tipo = 'evento' }: Props) => {
  const key = normalizar(estado);
  const label =
    tipo === 'inscripcion'
      ? LABELS_INSCRIPCION[key] || estado
      : LABELS_EVENTO[key] || estado;

  const clases: Record<string, string> = {
    // Eventos
    programado:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    cancelado:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    finalizado:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',

    // Inscripciones
    confirmada:
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    cancelada:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    pendiente:
      'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
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

export default EventoBadge;