/**
 * ============================================================================
 * ARCHIVO: UsuarioList.tsx
 * COMPONENTE: Lista de usuarios con soporte de modos.
 *
 * MODOS:
 * - "app"     → Panel de admin completo (tabla desktop + cards móvil, CRUD).
 * - "preview" → Vitrina: muestra 3 usuarios sin acciones (para dashboard).
 *
 * INCLUYE:
 * - Buscador, filtros por rol y estado (case-insensitive).
 * - Botón "Limpiar filtros" siempre visible (atenuado cuando está inactivo).
 * - Contador de filtros activos con badge.
 * - Paginación numerada con elipsis.
 * - Tabla adaptativa con truncado para nombres/correos largos.
 * - Botones de acción verticales, mismo tamaño, centrados.
 * - Mensajes de error mejorados en eliminación (401/403/404/409/500).
 * ============================================================================
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usuarioApi } from './usuario.api';
import { UsuarioCard } from './UsuarioCard';
import UsuarioModal from './UsuarioModal';
import type { Usuario, UsuarioListProps } from './usuario.types';
import {
  obtenerId,
  getNombreCompleto,
  getIniciales,
  getEstado,
  esActivo,
} from './usuario.types';

const PREVIEW_LIMIT = 3;

export const UsuarioList = ({
  modo = 'app',
  title = 'Usuarios',
  subtitle = 'Resumen general de las cuentas registradas.',
}: UsuarioListProps) => {
  const { token } = useAuth();
  const isPreview = modo === 'preview';

  // =====================================================
  // ESTADOS PRINCIPALES
  // =====================================================
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [eliminandoId, setEliminandoId] = useState<number | string | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroRol, setFiltroRol] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');

  // Paginación
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [porPagina, setPorPagina] = useState<number>(10);

  // Modal
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [usuarioIdEditar, setUsuarioIdEditar] = useState<number | null>(null);

  // =====================================================
  // FETCH
  // =====================================================
  const fetchUsuarios = useCallback(async (): Promise<void> => {
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
  }, []);

  useEffect(() => {
    if (token) fetchUsuarios();
  }, [token, fetchUsuarios]);

  // Resetear página al cambiar filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroRol, filtroEstado, porPagina]);

  // =====================================================
  // ACCIONES
  // =====================================================
  const abrirModalNuevo = (): void => {
    setUsuarioIdEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (usuario: Usuario): void => {
    const id = obtenerId(usuario);
    if (id === undefined || id === null) {
      alert('No se pudo identificar el usuario a editar.');
      return;
    }
    setUsuarioIdEditar(Number(id));
    setModalAbierto(true);
  };

  const handleGuardarUsuario = (): void => {
    fetchUsuarios();
  };

  const handleEliminar = async (user: Usuario): Promise<void> => {
    const id = obtenerId(user);
    if (id === undefined || id === null || id === '') {
      alert('No se pudo identificar el usuario a eliminar (ID inválido).');
      return;
    }

    const nombre = getNombreCompleto(user);
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar a "${nombre}" de forma permanente?\n\n` +
        `⚠️ Si el usuario tiene pedidos, reservas o historial asociado, la eliminación podría fallar.\n` +
        `En ese caso, considera cambiar su estado a "Inactivo" en lugar de borrarlo.`
    );
    if (!confirmar) return;

    setEliminandoId(id);

    try {
      await usuarioApi.delete(id);
      await fetchUsuarios();
    } catch (err: any) {
      console.error('Error al eliminar usuario:', {
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
      });

      const status = err.response?.status;
      let mensaje =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Error desconocido';

      if (status === 401 || status === 403) {
        mensaje =
          'No tienes permisos para eliminar usuarios o tu sesión expiró. ' +
          'Vuelve a iniciar sesión e inténtalo de nuevo.';
      } else if (status === 404) {
        mensaje = 'El usuario no existe o ya fue eliminado previamente.';
      } else if (status === 409 || status === 500) {
        mensaje =
          'No se puede eliminar este usuario porque tiene información asociada en el sistema ' +
          '(pedidos, reservas, historial, etc.).\n\n' +
          'Sugerencia: cambia su estado a "Inactivo" en lugar de eliminarlo.';
      }

      alert(`No se pudo eliminar (${status ?? 'sin conexión'}):\n\n${mensaje}`);
    } finally {
      setEliminandoId(null);
    }
  };

  const limpiarFiltros = (): void => {
    setBusqueda('');
    setFiltroRol('');
    setFiltroEstado('');
    setPaginaActual(1);
  };

  const hayFiltrosActivos =
    busqueda.trim() !== '' || filtroRol !== '' || filtroEstado !== '';

  const filtrosActivos = [
    busqueda.trim() !== '',
    filtroRol !== '',
    filtroEstado !== '',
  ].filter(Boolean).length;

  // =====================================================
  // LISTAS ÚNICAS PARA FILTROS
  // =====================================================
  const rolesDisponibles = useMemo(() => {
    const set = new Set<string>();
    usuarios.forEach((u) => {
      if (u.rol) set.add(String(u.rol));
    });
    return Array.from(set).sort();
  }, [usuarios]);

  const estadosDisponibles = useMemo(() => {
    const set = new Set<string>();
    usuarios.forEach((u) => {
      const est = getEstado(u);
      if (est) set.add(est);
    });
    return Array.from(set).sort();
  }, [usuarios]);

  // =====================================================
  // FILTRADO COMBINADO
  // =====================================================
  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();

    return usuarios.filter((u) => {
      // 1. Buscador
      if (term) {
        const coincide =
          (u.nombre || '').toLowerCase().includes(term) ||
          (u.apellidos || '').toLowerCase().includes(term) ||
          (u.paterno || '').toLowerCase().includes(term) ||
          (u.materno || '').toLowerCase().includes(term) ||
          (u.correo || '').toLowerCase().includes(term);
        if (!coincide) return false;
      }

      // 2. Filtro rol
      if (filtroRol) {
        const rolUsuario = (u.rol || '').toLowerCase();
        const rolFiltro = filtroRol.toLowerCase();
        const coincide =
          rolUsuario === rolFiltro ||
          (rolFiltro === 'admin' && rolUsuario === 'administrador') ||
          (rolFiltro === 'administrador' && rolUsuario === 'admin');
        if (!coincide) return false;
      }

      // 3. Filtro estado (case-insensitive)
      if (filtroEstado) {
        if (getEstado(u).toLowerCase() !== filtroEstado.toLowerCase()) return false;
      }

      return true;
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado]);

  // =====================================================
  // PAGINACIÓN
  // =====================================================
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));

  useEffect(() => {
    if (paginaActual > totalPaginas) setPaginaActual(totalPaginas);
  }, [paginaActual, totalPaginas]);

  const usuariosPaginados = useMemo(() => {
    if (isPreview) return filtrados.slice(0, PREVIEW_LIMIT);
    const inicio = (paginaActual - 1) * porPagina;
    return filtrados.slice(inicio, inicio + porPagina);
  }, [filtrados, paginaActual, porPagina, isPreview]);

  const indiceInicio =
    filtrados.length === 0 ? 0 : (paginaActual - 1) * porPagina + 1;
  const indiceFin = Math.min(paginaActual * porPagina, filtrados.length);

  const numerosPagina = useMemo(() => {
    const paginas: (number | '...')[] = [];
    const maxVisible = 5;

    if (totalPaginas <= maxVisible + 2) {
      for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
    } else {
      paginas.push(1);
      let inicio = Math.max(2, paginaActual - 1);
      let fin = Math.min(totalPaginas - 1, paginaActual + 1);

      if (paginaActual <= 3) {
        inicio = 2;
        fin = 4;
      }
      if (paginaActual >= totalPaginas - 2) {
        inicio = totalPaginas - 3;
        fin = totalPaginas - 1;
      }

      if (inicio > 2) paginas.push('...');
      for (let i = inicio; i <= fin; i++) paginas.push(i);
      if (fin < totalPaginas - 1) paginas.push('...');
      paginas.push(totalPaginas);
    }

    return paginas;
  }, [totalPaginas, paginaActual]);

  // =====================================================
  // ESTADÍSTICAS (solo modo app)
  // =====================================================
  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter((u) => esActivo(u)).length;
  const usuariosSuspendidos = usuarios.filter((u) => {
    const est = getEstado(u).toLowerCase();
    return est === 'inactivo' || est === 'suspendido' || est === 'bloqueado';
  }).length;
  const admins = usuarios.filter((u) => {
    const rol = (u.rol || '').toLowerCase();
    return rol === 'admin' || rol === 'administrador';
  }).length;

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto">
            {title}
          </h1>
          <p className="text-claro-texto2 dark:text-oscuro-texto2 text-sm mt-1">
            {subtitle}
          </p>
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
            <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">
              Total registrados
            </p>
            <h3 className="text-3xl font-bold text-claro-texto dark:text-oscuro-texto mt-2">
              {totalUsuarios}
            </h3>
          </div>
          <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm">
            <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">
              Activos
            </p>
            <h3 className="text-3xl font-bold text-claro-texto dark:text-oscuro-texto mt-2">
              {usuariosActivos}
            </h3>
          </div>
          <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm">
            <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">
              Roles de Admin
            </p>
            <h3 className="text-3xl font-bold text-claro-texto dark:text-oscuro-texto mt-2">
              {admins}
            </h3>
          </div>
          <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm">
            <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">
              Suspendidos
            </p>
            <h3 className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
              {usuariosSuspendidos}
            </h3>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* CONTENEDOR PRINCIPAL                          */}
      {/* ============================================ */}
      <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-2xl shadow-sm overflow-hidden">
        {!isPreview && (
          <div className="px-6 py-4 border-b border-claro-borde dark:border-oscuro-borde bg-claro-fondo/50 dark:bg-oscuro-fondo/50">
            <h2 className="font-semibold text-claro-texto dark:text-oscuro-texto">
              Administrar usuarios
            </h2>
          </div>
        )}

        {/* ============================================ */}
        {/* BARRA DE BÚSQUEDA Y FILTROS                    */}
        {/* ============================================ */}
        {!isPreview && (
          <div className="px-4 sm:px-6 py-4 border-b border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
              {/* Buscador */}
              <div className="relative lg:col-span-5 min-w-0">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-claro-texto2 dark:text-oscuro-texto2 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, apellidos o correo..."
                  className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto placeholder-claro-texto2 dark:placeholder-oscuro-texto2 focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40 transition-colors"
                />
              </div>

              {/* Filtro Rol */}
              <div className="lg:col-span-2 min-w-0">
                <label className="block text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1.5">
                  Rol
                </label>
                <select
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40 transition-colors"
                >
                  <option value="">Todos</option>
                  {rolesDisponibles.map((rol) => (
                    <option key={rol} value={rol}>
                      {rol}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Estado */}
              <div className="lg:col-span-2 min-w-0">
                <label className="block text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1.5">
                  Estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40 transition-colors"
                >
                  <option value="">Todos</option>
                  {estadosDisponibles.map((est) => (
                    <option key={est} value={est}>
                      {est}
                    </option>
                  ))}
                </select>
              </div>

              {/* Por página */}
              <div className="lg:col-span-1 min-w-0">
                <label className="block text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1.5">
                  Mostrar
                </label>
                <select
                  value={porPagina}
                  onChange={(e) => setPorPagina(Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40 transition-colors"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Botón Limpiar filtros */}
              <div className="lg:col-span-2 min-w-0">
                <label className="hidden lg:block text-xs font-medium text-transparent mb-1.5 select-none">
                  &nbsp;
                </label>
                <button
                  onClick={limpiarFiltros}
                  disabled={!hayFiltrosActivos}
                  className={`w-full px-3 py-2.5 text-sm font-medium rounded-xl border transition-colors duration-200 whitespace-nowrap flex items-center justify-center gap-2
                    ${
                      hayFiltrosActivos
                        ? 'bg-claro-fondo dark:bg-oscuro-fondo border-claro-borde dark:border-oscuro-borde text-claro-texto2 dark:text-oscuro-texto2 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 cursor-pointer'
                        : 'bg-claro-fondo/40 dark:bg-oscuro-fondo/40 border-claro-borde/40 dark:border-oscuro-borde/40 text-claro-texto2/40 dark:text-oscuro-texto2/40 cursor-not-allowed'
                    }`}
                >
                  Limpiar filtros
                  {filtrosActivos > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-claro-primario dark:bg-oscuro-primario text-white text-[10px] font-bold">
                      {filtrosActivos}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="mt-3 text-xs text-claro-texto2 dark:text-oscuro-texto2">
              Mostrando{' '}
              <span className="font-semibold text-claro-texto dark:text-oscuro-texto">
                {indiceInicio}-{indiceFin}
              </span>{' '}
              de{' '}
              <span className="font-semibold text-claro-texto dark:text-oscuro-texto">
                {filtrados.length}
              </span>{' '}
              usuarios
              {hayFiltrosActivos && (
                <span className="ml-1">(filtrados de {totalUsuarios} en total)</span>
              )}
            </div>
          </div>
        )}

        {/* Estado de carga/error */}
        {cargando ? (
          <div className="px-6 py-8 text-center text-claro-texto2 dark:text-oscuro-texto2">
            Cargando usuarios...
          </div>
        ) : error ? (
          <div className="px-6 py-8 text-center text-red-500 font-medium">{error}</div>
        ) : usuariosPaginados.length === 0 ? (
          <div className="px-6 py-8 text-center text-claro-texto2 dark:text-oscuro-texto2">
            {hayFiltrosActivos
              ? 'No se encontraron usuarios que coincidan con los filtros.'
              : 'No hay usuarios registrados.'}
          </div>
        ) : isPreview ? (
          /* ============ MODO PREVIEW (vitrina) ============ */
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usuariosPaginados.map((user) => (
              <UsuarioCard
                key={obtenerId(user) ?? user.id}
                usuario={user}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        ) : (
          <>
            {/* ============================================ */}
            {/* VISTA DESKTOP: TABLA ADAPTATIVA                */}
            {/* ============================================ */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left table-fixed">
                <colgroup>
                  <col className="w-12" />
                  <col className="w-[22%]" />
                  <col className="w-[24%]" />
                  <col className="w-[12%]" />
                  <col className="w-[13%]" />
                  <col className="w-[17%]" />
                </colgroup>
                <thead>
                  <tr className="text-xs font-semibold text-claro-texto2 dark:text-oscuro-texto2 border-b border-claro-borde dark:border-oscuro-borde">
                    <th className="px-3 py-3 text-center">#</th>
                    <th className="px-3 py-3">USUARIO</th>
                    <th className="px-3 py-3">CORREO ELECTRÓNICO</th>
                    <th className="px-3 py-3">ROL</th>
                    <th className="px-3 py-3">ESTADO</th>
                    <th className="px-3 py-3 text-center">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-claro-borde dark:divide-oscuro-borde">
                  {usuariosPaginados.map((user, idx) => {
                    const id = obtenerId(user);
                    const estaEliminando = eliminandoId === id;
                    const numeroFila = (paginaActual - 1) * porPagina + idx + 1;
                    const nombreCompleto = getNombreCompleto(user);
                    const iniciales = getIniciales(user);
                    const activo = esActivo(user);

                    return (
                      <tr
                        key={id ?? `user-${numeroFila}`}
                        className="hover:bg-claro-fondo dark:hover:bg-oscuro-fondo/50 transition-colors"
                      >
                        <td className="px-3 py-4 text-center text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">
                          {numeroFila}
                        </td>

                        <td className="px-3 py-4 min-w-0">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 shrink-0 rounded-full bg-claro-tinte dark:bg-oscuro-tinte text-claro-primario dark:text-oscuro-primario flex items-center justify-center font-bold text-xs">
                              {iniciales}
                            </div>
                            <span
                              className="font-medium text-claro-texto dark:text-oscuro-texto truncate text-sm"
                              title={nombreCompleto}
                            >
                              {nombreCompleto}
                            </span>
                          </div>
                        </td>

                        <td className="px-3 py-4 text-sm text-claro-texto2 dark:text-oscuro-texto2 min-w-0">
                          <span className="block truncate" title={user.correo}>
                            {user.correo}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-sm text-claro-texto2 dark:text-oscuro-texto2 min-w-0">
                          <span className="block truncate" title={user.rol}>
                            {user.rol}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap ${
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
                            {getEstado(user)}
                          </span>
                        </td>

                        {/* ACCIONES — botones verticales, mismo ancho, centrados */}
                        <td className="px-3 py-3">
                          <div className="flex flex-col items-stretch gap-1.5 w-full max-w-[100px] mx-auto">
                            <button
                              onClick={() => abrirModalEditar(user)}
                              className="w-full py-1.5 text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2 bg-white dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde rounded-lg hover:text-claro-primario dark:hover:text-oscuro-primario hover:border-claro-primario/40 dark:hover:border-oscuro-primario/40 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleEliminar(user)}
                              disabled={estaEliminando}
                              className="w-full py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-white dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {estaEliminando ? 'Borrando…' : 'Eliminar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ============================================ */}
            {/* VISTA MÓVIL: CARDS                             */}
            {/* ============================================ */}
            <div className="md:hidden divide-y divide-claro-borde dark:divide-oscuro-borde">
              {usuariosPaginados.map((user, idx) => {
                const id = obtenerId(user);
                const estaEliminando = eliminandoId === id;
                const numeroFila = (paginaActual - 1) * porPagina + idx + 1;
                const nombreCompleto = getNombreCompleto(user);
                const iniciales = getIniciales(user);
                const activo = esActivo(user);

                return (
                  <div key={id ?? `user-m-${numeroFila}`} className="p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 shrink-0 rounded-full bg-claro-fondo dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde flex items-center justify-center text-xs font-semibold text-claro-texto2 dark:text-oscuro-texto2">
                        {numeroFila}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-claro-tinte dark:bg-oscuro-tinte text-claro-primario dark:text-oscuro-primario flex items-center justify-center font-bold text-sm shrink-0">
                        {iniciales}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className="font-semibold text-claro-texto dark:text-oscuro-texto truncate"
                          title={nombreCompleto}
                        >
                          {nombreCompleto}
                        </h3>
                        <p
                          className="text-xs text-claro-texto2 dark:text-oscuro-texto2 truncate"
                          title={user.correo}
                        >
                          {user.correo}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="text-claro-texto2 dark:text-oscuro-texto2 uppercase tracking-wide mb-1">
                          Rol
                        </p>
                        <p
                          className="font-medium text-claro-texto dark:text-oscuro-texto truncate"
                          title={user.rol}
                        >
                          {user.rol}
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
                          {getEstado(user)}
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
                        onClick={() => handleEliminar(user)}
                        disabled={estaEliminando}
                        className="flex-1 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-claro-fondo dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {estaEliminando ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ============================================ */}
            {/* PAGINACIÓN NUMERADA                            */}
            {/* ============================================ */}
            {totalPaginas > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-claro-borde dark:border-oscuro-borde bg-claro-fondo/50 dark:bg-oscuro-fondo/50">
                <div className="text-xs text-claro-texto2 dark:text-oscuro-texto2">
                  Página{' '}
                  <span className="font-semibold text-claro-texto dark:text-oscuro-texto">
                    {paginaActual}
                  </span>{' '}
                  de{' '}
                  <span className="font-semibold text-claro-texto dark:text-oscuro-texto">
                    {totalPaginas}
                  </span>
                </div>

                <div className="flex items-center gap-1 flex-wrap justify-center">
                  <button
                    onClick={() => setPaginaActual(1)}
                    disabled={paginaActual === 1}
                    className="px-2.5 py-1.5 text-sm rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-primario dark:hover:text-oscuro-primario disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Primera página"
                  >
                    «
                  </button>
                  <button
                    onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                    disabled={paginaActual === 1}
                    className="px-2.5 py-1.5 text-sm rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-primario dark:hover:text-oscuro-primario disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Anterior"
                  >
                    ‹
                  </button>

                  {numerosPagina.map((n, i) =>
                    n === '...' ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="px-2 text-claro-texto2 dark:text-oscuro-texto2"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setPaginaActual(n)}
                        className={`min-w-[36px] px-2.5 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                          paginaActual === n
                            ? 'bg-claro-primario dark:bg-oscuro-primario text-white border-claro-primario dark:border-oscuro-primario shadow-sm'
                            : 'bg-claro-tarjeta dark:bg-oscuro-tarjeta border-claro-borde dark:border-oscuro-borde text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-primario dark:hover:text-oscuro-primario'
                        }`}
                      >
                        {n}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      setPaginaActual((p) => Math.min(totalPaginas, p + 1))
                    }
                    disabled={paginaActual === totalPaginas}
                    className="px-2.5 py-1.5 text-sm rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-primario dark:hover:text-oscuro-primario disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Siguiente"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => setPaginaActual(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                    className="px-2.5 py-1.5 text-sm rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-primario dark:hover:text-oscuro-primario disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Última página"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
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