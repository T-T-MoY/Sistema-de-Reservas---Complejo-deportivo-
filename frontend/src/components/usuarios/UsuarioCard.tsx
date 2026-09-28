/**
 * ============================================================================
 * ARCHIVO: UsuarioCard.tsx
 * Tarjeta individual de usuario. Funciona en desktop y móvil.
 * ============================================================================
 */

import type { Usuario } from './usuario.types';

interface UsuarioCardProps {
  usuario: Usuario;
  onEdit: (usuario: Usuario) => void;
  onDelete: (id: number) => void;
}

// =====================================================
// HELPERS
// =====================================================
const getNombreCompleto = (u: Usuario): string => {
  const nombre = u.nombre || '';
  const apellidos = u.apellidos || [u.paterno, u.materno].filter(Boolean).join(' ');
  return `${nombre} ${apellidos}`.trim() || 'Sin nombre';
};

const getIniciales = (u: Usuario): string => {
  const n = u.nombre?.charAt(0) || '';
  const a = (u.apellidos?.charAt(0) || u.paterno?.charAt(0)) || '';
  return (n + a).toUpperCase() || '?';
};

const getEstado = (u: Usuario): string => u.estado || u.estado_cuenta || 'Activo';

// =====================================================
// COMPONENTE
// =====================================================
export const UsuarioCard = ({ usuario, onEdit, onDelete }: UsuarioCardProps) => {
  const estado = getEstado(usuario);
  const isActivo = estado === 'Activo';

  return (
    <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-2xl p-5 hover:shadow-lg transition-shadow">
      {/* Cabecera: avatar + nombre + correo */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-claro-tinte dark:bg-oscuro-tinte text-claro-primario dark:text-oscuro-primario flex items-center justify-center font-bold text-sm shrink-0">
          {getIniciales(usuario)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-claro-texto dark:text-oscuro-texto truncate">
            {getNombreCompleto(usuario)}
          </h3>
          <p className="text-xs text-claro-texto2 dark:text-oscuro-texto2 truncate">
            {usuario.correo || 'sin correo'}
          </p>
        </div>
      </div>

      {/* Rol + Estado */}
      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
        <div>
          <p className="text-claro-texto2 dark:text-oscuro-texto2 uppercase tracking-wide mb-1">
            Rol
          </p>
          <p className="font-medium text-claro-texto dark:text-oscuro-texto">
            {usuario.rol || '—'}
          </p>
        </div>
        <div>
          <p className="text-claro-texto2 dark:text-oscuro-texto2 uppercase tracking-wide mb-1">
            Estado
          </p>
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${
              isActivo
                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
            }`}
          >
            {estado}
          </span>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(usuario)}
          className="flex-1 py-2 text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 bg-claro-fondo dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde rounded-lg hover:text-claro-primario dark:hover:text-oscuro-primario transition-colors"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(usuario.id)}
          className="flex-1 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-claro-fondo dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default UsuarioCard;