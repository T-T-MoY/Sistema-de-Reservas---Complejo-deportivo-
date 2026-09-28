/**
 * ============================================================================
 * ARCHIVO: UsuarioList.tsx
 * COMPONENTE: Lista de usuarios con soporte de modos.
 *
 * MODOS:
 * - "app"     → Panel de admin completo (tabla desktop + cards móvil, CRUD).
 * - "preview" → Vitrina: muestra 3 usuarios sin acciones (para dashboard).
 *
 * FILTROS (solo modo app):
 * - Búsqueda por nombre, apellidos y correo.
 * - Filtro por rol (Cliente / Empleado / Admin).
 * - Filtro por estado (Activo / Inactivo) — case-insensitive.
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usuarioApi } from './usuario.api';
import { UsuarioCard } from './UsuarioCard';
import UsuarioModal from './UsuarioModal';
import type { Usuario, UsuarioListProps } from './usuario.types';

const PREVIEW_LIMIT = 3;

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

/**
 * Normaliza el estado del usuario a "Activo" o "Inactivo" (con mayúscula).
 * El backend a veces devuelve "activo" en minúscula, por eso no se puede
 * comparar directo con === 'Activo'.
 */
const getEstado = (u: Usuario): string => {
  const raw = (u.estado || u.estado_cuenta || 'Activo').toString().trim();
  const lower = raw.toLowerCase();
  if (lower === 'activo') return 'Activo';
  if (lower === 'inactivo') return 'Inactivo';
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
};

// =====================================================
// COMPONENTE
// =====================================================
export const UsuarioList = ({
  modo = 'app',
  title = 'Usuarios',
  subtitle = 'Resumen general de las cuentas registradas.',
}: UsuarioListProps) => {
  const { token } = useAuth();
  const isPreview = modo === 'preview';

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Filtros
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroRol, setFiltroRol] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');

  // Modal
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [usuarioIdEditar, setUsuarioIdEditar] = useState<number | null>(null);

  // =====================================================
  // FETCH
  // =====================================================
  const fetchUsuarios = async (): Promise<void> => {
    try {
      setCargando(true);
      const data = await usuarioApi.getAll();
      setUsuarios(data);
      setError('');
    } catch (err) {
      setError('Error al cargar los usuarios. Verifica tu conexión al servidor.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsuarios();
  }, [token]);

  // =====================================================
  // ACCIONES
  // =====================================================
  const abrirModalNuevo = (): void => {
    setUsuarioIdEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (usuario: Usuario): void => {
    setUsuarioIdEditar(usuario.id);
    setModalAbierto(true);
  };

  const handleGuardarUsuario = (): void => {
    fetchUsuarios();
  };

  const handleEliminar = async (id: number): Promise<void> => {
    if (window.confirm('¿Estás seguro de eliminar este usuario de forma permanente?')) {
      try {
        await usuarioApi.delete(id);
        fetchUsuarios();
      } catch (err: any) {
        alert('Error al eliminar: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const limpiarFiltros = (): void => {
    setBusqueda('');
    setFiltroRol('');
    setFiltroEstado('');
  };

  const hayFiltrosActivos =
    busqueda.trim() !== '' || filtroRol !== '' || filtroEstado !== '';

  // =====================================================
  // FILTRADO COMBINADO + LÍMITE PREVIEW
  // =====================================================
  const filtrados = usuarios.filter((u) => {
    // 1. Buscador de texto
    if (busqueda.trim()) {
      const term = busqueda.toLowerCase();
      const coincideTexto =
        (u.nombre || '').toLowerCase().includes(term) ||
        (u.apellidos || '').toLowerCase().includes(term) ||
        (u.paterno || '').toLowerCase().includes(term) ||
        (u.materno || '').toLowerCase().includes(term) ||
        (u.correo || '').toLowerCase().includes(term);
      if (!coincideTexto) return false;
    }

    // 2. Filtro por rol
    if (filtroRol) {
      const rolUsuario = (u.rol || '').toLowerCase();
      const rolFiltro = filtroRol.toLowerCase();
      const coincideRol =
        rolUsuario === rolFiltro ||
        (rolFiltro === 'admin' && rolUsuario === 'administrador') ||
        (rolFiltro === 'administrador' && rolUsuario === 'admin');
      if (!coincideRol) return false;
    }

    // 3. Filtro por estado (comparación contra valor normalizado)
    if (filtroEstado) {
      const estadoUsuario = getEstado(u);
      if (estadoUsuario !== filtroEstado) return false;
    }

    return true;
  });

  const usuariosAMostrar = isPreview ? filtrados.slice(0, PREVIEW_LIMIT) : filtrados;

  // =====================================================
  // ESTADÍSTICAS (solo modo app)
  // =====================================================
  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter((u) => getEstado(u) === 'Activo').length;
  const usuariosSuspendidos = usuarios.filter((u) => getEstado(u) === 'Inactivo').length;
  const admins = usuarios.filter((u) => u.rol === 'Admin' || u.rol === 'Administrador').length;

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto">{title}</h1>
          <p className="text-claro-texto2 dark:text-oscuro-texto2 text-sm mt-1">{subtitle}</p>
        </div>
        {!isPreview && (
          <button
            onClick={abrirModalNuevo}
            className="px-5 py-2.5 bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:text-oscuro-fondo dark:hover:bg-oscuro-hover text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo usuario
          </button>
        )}
      </div>

      {/* Estadísticas */}
      {!isPreview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm">
            <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">Total registrados</p>
            <h3 className="text-3xl font-bold text-claro-texto dark:text-oscuro-texto mt-2">{totalUsuarios}</h3>
          </div>
          <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm">
            <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">Activos</p>
            <h3 className="text-3xl font-bold text-claro-texto dark:text-oscuro-texto mt-2">{usuariosActivos}</h3>
          </div>
          <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm">
            <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">Roles de Admin</p>
            <h3 className="text-3xl font-bold text-claro-texto dark:text-oscuro-texto mt-2">{admins}</h3>
          </div>
          <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm">
            <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">Suspendidos</p>
            <h3 className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{usuariosSuspendidos}</h3>
          </div>
        </div>
      )}

      {/* Barra de filtros */}
      {!isPreview && (
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex items-center gap-2 flex-1 px-3.5 py-2 rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta">
              <svg className="w-[18px] h-[18px] text-claro-texto2/70 dark:text-oscuro-texto2/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full text-claro-texto dark:text-oscuro-texto placeholder:text-claro-texto2/60 dark:placeholder:text-oscuro-texto2/60"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="text-lg leading-none text-claro-texto2/70 dark:text-oscuro-texto2/70 hover:text-claro-texto dark:hover:text-oscuro-texto"
                  aria-label="Limpiar búsqueda"
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta text-sm text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario"
            >
              <option value="">Todos los roles</option>
              <option value="Cliente">Cliente</option>
              <option value="Empleado">Empleado</option>
              <option value="Admin">Administrador</option>
            </select>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta text-sm text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario"
            >
              <option value="">Todos los estados</option>
              <option value="Activo">Solo activos</option>
              <option value="Inactivo">Solo inactivos</option>
            </select>

            {hayFiltrosActivos && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="px-4 py-2.5 text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 bg-claro-fondo dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde rounded-xl hover:text-claro-primario dark:hover:text-oscuro-primario transition-colors whitespace-nowrap"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {hayFiltrosActivos && (
            <p className="text-xs text-claro-texto2 dark:text-oscuro-texto2">
              Mostrando <span className="font-semibold text-claro-primario dark:text-oscuro-primario">{filtrados.length}</span> de {usuarios.length} usuarios
            </p>
          )}
        </div>
      )}

      {/* Contenedor principal */}
      <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-2xl shadow-sm overflow-hidden">
        {!isPreview && (
          <div className="px-6 py-4 border-b border-claro-borde dark:border-oscuro-borde bg-claro-fondo/50 dark:bg-oscuro-fondo/50">
            <h2 className="font-semibold text-claro-texto dark:text-oscuro-texto">Administrar usuarios</h2>
          </div>
        )}

        {cargando ? (
          <div className="px-6 py-8 text-center text-claro-texto2 dark:text-oscuro-texto2">
            Cargando usuarios...
          </div>
        ) : error ? (
          <div className="px-6 py-8 text-center text-red-500 font-medium">{error}</div>
        ) : usuariosAMostrar.length === 0 ? (
          <div className="px-6 py-8 text-center text-claro-texto2 dark:text-oscuro-texto2">
            {hayFiltrosActivos
              ? 'No se encontraron usuarios con esos filtros.'
              : 'No hay usuarios registrados.'}
          </div>
        ) : isPreview ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usuariosAMostrar.map((user) => (
              <UsuarioCard
                key={user.id}
                usuario={user}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-semibold text-claro-texto2 dark:text-oscuro-texto2 border-b border-claro-borde dark:border-oscuro-borde">
                    <th className="px-6 py-4">USUARIO</th>
                    <th className="px-6 py-4">CORREO ELECTRÓNICO</th>
                    <th className="px-6 py-4">ROL</th>
                    <th className="px-6 py-4">ESTADO</th>
                    <th className="px-6 py-4 text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-claro-borde dark:divide-oscuro-borde">
                  {usuariosAMostrar.map((user) => {
                    const estado = getEstado(user);
                    const isActivo = estado === 'Activo';
                    return (
                      <tr key={user.id} className="hover:bg-claro-fondo dark:hover:bg-oscuro-fondo/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-claro-tinte dark:bg-oscuro-tinte text-claro-primario dark:text-oscuro-primario flex items-center justify-center font-bold text-sm">
                              {getIniciales(user)}
                            </div>
                            <span className="font-medium text-claro-texto dark:text-oscuro-texto">
                              {getNombreCompleto(user)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-claro-texto2 dark:text-oscuro-texto2">{user.correo}</td>
                        <td className="px-6 py-4 text-sm text-claro-texto2 dark:text-oscuro-texto2">{user.rol}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                              isActivo
                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                            }`}
                          >
                            {estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => abrirModalEditar(user)}
                            className="px-3 py-1.5 text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 bg-white dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde rounded-lg hover:text-claro-primario dark:hover:text-oscuro-primario transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(user.id)}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Móvil */}
            <div className="md:hidden divide-y divide-claro-borde dark:divide-oscuro-borde">
              {usuariosAMostrar.map((user) => {
                const estado = getEstado(user);
                const isActivo = estado === 'Activo';
                return (
                  <div key={user.id} className="p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-claro-tinte dark:bg-oscuro-tinte text-claro-primario dark:text-oscuro-primario flex items-center justify-center font-bold text-sm shrink-0">
                        {getIniciales(user)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-claro-texto dark:text-oscuro-texto truncate">
                          {getNombreCompleto(user)}
                        </h3>
                        <p className="text-xs text-claro-texto2 dark:text-oscuro-texto2 truncate">{user.correo}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-claro-texto2 dark:text-oscuro-texto2 uppercase tracking-wide mb-1">Rol</p>
                        <p className="font-medium text-claro-texto dark:text-oscuro-texto">{user.rol}</p>
                      </div>
                      <div>
                        <p className="text-claro-texto2 dark:text-oscuro-texto2 uppercase tracking-wide mb-1">Estado</p>
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

                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirModalEditar(user)}
                        className="flex-1 py-2 text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 bg-claro-fondo dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde rounded-lg hover:text-claro-primario dark:hover:text-oscuro-primario transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(user.id)}
                        className="flex-1 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-claro-fondo dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {!isPreview && (
        <UsuarioModal
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          onSave={handleGuardarUsuario}
          usuarioId={usuarioIdEditar}
        />
      )}
    </div>
  );
};

export default UsuarioList;