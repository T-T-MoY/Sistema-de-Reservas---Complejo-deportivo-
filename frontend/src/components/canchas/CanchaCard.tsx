/**
 * ============================================================================
 * ARCHIVO: CanchaCard.tsx
 * COMPONENTE: Tarjeta visual de Cancha Deportiva
 * Estilos migrados a Tailwind (tokens claro-x & oscuro-x de tailwind.config.js).
 * Los colores de disciplina/estado son semánticos y no dependen de la paleta
 * de marca (se mantienen como colores Tailwind estándar: emerald, amber, etc).
 * ============================================================================
 */

import React from 'react';
import type { Cancha } from './cancha.types';

interface CanchaCardProps {
  cancha: Cancha;
  isAdmin?: boolean;
  onEdit: (cancha: Cancha) => void;
  onDelete: (id: number) => void;
  onSelectReserva?: (cancha: Cancha) => void;
}

// Iconos visuales y estilos por disciplina deportiva
const getDisciplinaBadge = (disciplina: string | null) => {
  const d = disciplina?.toLowerCase() || '';
  if (d.includes('futbol')) return { label: 'Fútbol', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', icon: '⚽' };
  if (d.includes('basquet')) return { label: 'Básquetbol', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', icon: '🏀' };
  if (d.includes('voley')) return { label: 'Voleibol', color: 'bg-sky-500/15 text-sky-600 dark:text-sky-400', icon: '🏐' };
  if (d.includes('tenis')) return { label: 'Tenis', color: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400', icon: '🎾' };
  if (d.includes('padel')) return { label: 'Pádel', color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400', icon: '🏸' };
  if (d.includes('futsal')) return { label: 'Futsal', color: 'bg-orange-500/15 text-orange-600 dark:text-orange-400', icon: '🥅' };
  if (d.includes('atletismo')) return { label: 'Atletismo', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400', icon: '🏃' };
  return { label: disciplina || 'General', color: 'bg-slate-500/15 text-slate-600 dark:text-slate-400', icon: '🏟️' };
};

export const CanchaCard: React.FC<CanchaCardProps> = ({
  cancha,
  isAdmin = false,
  onEdit,
  onDelete,
  onSelectReserva,
}) => {
  const discInfo = getDisciplinaBadge(cancha.disciplina);
  const isDisponible = cancha.estado?.toLowerCase() === 'disponible';

  return (
    <div className="flex flex-col justify-between rounded-2xl p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xl">{discInfo.icon}</span>
          <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg ${discInfo.color}`}>{discInfo.label}</span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
            isDisponible
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isDisponible ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {isDisponible ? 'Disponible' : 'Mantenimiento'}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-bold mb-1.5 text-claro-texto dark:text-oscuro-texto">{cancha.nombre}</h3>

        <p className="flex items-center gap-1.5 text-sm mb-5 text-claro-texto2 dark:text-oscuro-texto2">
          <svg className="w-4 h-4 text-claro-primario dark:text-oscuro-primario" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {cancha.ubicacion || 'Sector Principal'}
        </p>

        <div className="flex flex-wrap gap-3 rounded-xl px-4 py-3 mb-6 border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo">
          {cancha.capacidad && (
            <div className="flex flex-col">
              <span className="text-[0.7rem] uppercase text-claro-texto2/70 dark:text-oscuro-texto2/70">Capacidad</span>
              <span className="text-sm font-semibold text-claro-texto dark:text-oscuro-texto">{cancha.capacidad} pers.</span>
            </div>
          )}

          {cancha.largo && cancha.ancho && (
            <div className="flex flex-col">
              <span className="text-[0.7rem] uppercase text-claro-texto2/70 dark:text-oscuro-texto2/70">Dimensiones</span>
              <span className="text-sm font-semibold text-claro-texto dark:text-oscuro-texto">{cancha.largo}m × {cancha.ancho}m</span>
            </div>
          )}

          {cancha.hora_apertura && cancha.hora_cierre && (
            <div className="flex flex-col">
              <span className="text-[0.7rem] uppercase text-claro-texto2/70 dark:text-oscuro-texto2/70">Horario</span>
              <span className="text-sm font-semibold text-claro-texto dark:text-oscuro-texto">
                {cancha.hora_apertura.slice(0, 5)} - {cancha.hora_cierre.slice(0, 5)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-claro-borde dark:border-oscuro-borde">
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-semibold text-claro-texto2 dark:text-oscuro-texto2">Bs.</span>
          <span className="text-2xl font-extrabold text-claro-texto dark:text-oscuro-texto">{Number(cancha.precio_hora).toFixed(0)}</span>
          <span className="text-xs text-claro-texto2/70 dark:text-oscuro-texto2/70">/ hora</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Botones de Gestión Administrativa: SOLO si isAdmin es true */}
          {isAdmin && (
            <>
              <button
                type="button"
                title="Editar Cancha (Solo Administrador)"
                onClick={() => onEdit(cancha)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border transition-colors border-claro-borde dark:border-oscuro-borde text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-texto dark:hover:text-oscuro-texto hover:border-claro-primario dark:hover:border-oscuro-primario"
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              <button
                type="button"
                title="Eliminar Cancha (Solo Administrador)"
                onClick={() => onDelete(cancha.id_cancha)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border transition-colors border-claro-borde dark:border-oscuro-borde text-claro-texto2 dark:text-oscuro-texto2 hover:text-red-500 hover:border-red-400"
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}

          {/* Botón de Reserva para Clientes y Usuarios */}
          <button
            type="button"
            disabled={!isDisponible}
            onClick={() => onSelectReserva && onSelectReserva(cancha)}
            className="px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo"
          >
            {isDisponible ? 'Reservar' : 'No disp.'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default CanchaCard;
