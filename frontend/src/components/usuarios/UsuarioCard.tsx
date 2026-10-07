/**
 * ============================================================================
 * ARCHIVO: UsuarioCard.tsx
 * Tarjeta individual de usuario. Funciona en desktop y móvil.
 * ============================================================================
 */

import type { Usuario } from './usuario.types';
import {
  obtenerId,
  getNombreCompleto,
  getIniciales,
  getEstado,
  esActivo,
} from './usuario.types';

interface UsuarioCardProps {
  usuario: Usuario;
  onEdit: (usuario: Usuario) => void;
  onDelete: (id: number) => void;
}

export const UsuarioCard = ({ usuario, onEdit, onDelete }: UsuarioCardProps) => {
  const estado = getEstado(usuario);
  const activo = esActivo(usuario);
  const id = obtenerId(usuario);

  return (
    <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-2xl p-5 hover:shadow-lg transition-shadow">
      {/* Cabecera: avatar + nombre + correo */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-claro-tinte dark:bg-oscuro-tinte text-claro-primario dark:text-oscuro-primario flex items-center justify-center font-bold text-sm shrink-0">
          {getIniciales(usuario)}
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className="font-semibold text-claro-texto dark:text-oscuro-texto truncate"
            title={getNombreCompleto(usuario)}
          >
            {getNombreCompleto(usuario)}
          </h3>
          <p
            className="text-xs text-claro-texto2 dark:text-oscuro-texto2 truncate"
            title={usuario.correo}
          >
            {usuario.correo || 'sin correo'}
          </p>
        </div>
      </div>

      {/* Rol + Estado */}
      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
        <div className="min-w-0">
          <p className="text-claro-texto2 dark:text-oscuro-texto2 uppercase tracking-wide mb-1">
            Rol
          </p>
          <p
            className="font-medium text-claro-texto dark:text-oscuro-texto truncate"
            title={usuario.rol}
          >
            {usuario.rol || '—'}
          </p>
        </div>
        <div>
          <p className="text-claro-texto2 dark:text-oscuro-texto2 uppercase tracking-wide mb-1">
            Estado
          </p>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
              activo
                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                activo ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
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
          onClick={() => id !== undefined && onDelete(Number(id))}
          className="flex-1 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-claro-fondo dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default UsuarioCard;