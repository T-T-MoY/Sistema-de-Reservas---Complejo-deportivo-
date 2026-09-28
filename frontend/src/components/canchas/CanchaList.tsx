/**
 * ============================================================================
 * ARCHIVO: CanchaList.tsx
 * COMPONENTE: Catálogo interactivo de Canchas Deportivas
 *
 * MODOS:
 * - "app"     → Comportamiento completo (CRUD admin, reservas, modales).
 * - "preview" → Vitrina pública: muestra 3 canchas, oculta CRUD,
 *               y ofrece CTA para ir a la app o iniciar sesión.
 *
 * CONTROL DE PERMISOS:
 * - Cualquier usuario/visitante: ver catálogo, consultar disponibilidad.
 * - Administradores: crear (+ Nueva Cancha), editar y eliminar.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CanchaCard } from './CanchaCard';
import { CanchaModal } from './CanchaModal';
import { canchaApi } from './cancha.api';
import type { Cancha, CanchaFormData, DisciplinaOption } from './cancha.types';

// =====================================================
// TIPOS Y CONSTANTES
// =====================================================
export type CanchaListModo = 'app' | 'preview';

const DISCIPLINAS: DisciplinaOption[] = [
  { id: 'todas', label: 'Todas', icon: '⚡' },
  { id: 'futbol', label: 'Fútbol', icon: '⚽' },
  { id: 'futsal', label: 'Futsal', icon: '🥅' },
  { id: 'padel', label: 'Pádel', icon: '🏸' },
  { id: 'tenis', label: 'Tenis', icon: '🎾' },
  { id: 'basquet', label: 'Básquet', icon: '🏀' },
  { id: 'voley', label: 'Voleibol', icon: '🏐' },
];

const PREVIEW_LIMIT = 3;

interface CanchaListProps {
  modo?: CanchaListModo;
  title?: string;
  subtitle?: string;
}

// =====================================================
// COMPONENTE
// =====================================================
export const CanchaList: React.FC<CanchaListProps> = ({
  modo = 'app',
  title = 'Nuestras Canchas y Escenarios Deportivos',
  subtitle = 'Instalaciones de alto rendimiento con iluminación LED, césped sintético y piso flotante reglamentario.',
}) => {
  const navigate = useNavigate();
  const { usuario, isAuthenticated } = useAuth();

  const isPreview = modo === 'preview';

  // En preview NUNCA se comporta como admin (no se ven botones de CRUD)
  const isAdmin = !isPreview && Boolean(
    usuario && (usuario.rol === 'Admin' || usuario.rol === 'Administrador')
  );

  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [activeDisciplina, setActiveDisciplina] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canchaToEdit, setCanchaToEdit] = useState<Cancha | null>(null);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  // =====================================================
  // FETCH
  // =====================================================
  const cargarCanchas = async (disciplina = activeDisciplina) => {
    setIsLoading(true);
    try {
      const res = await canchaApi.getAll(disciplina);
      setCanchas(res.data);
      setIsBackendOnline(res.isLive);
    } catch (err: any) {
      console.error('Error al cargar canchas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarCanchas(activeDisciplina);
  }, [activeDisciplina]);

  const showNotification = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // =====================================================
  // ACCIONES CRUD (solo modo app + admin)
  // =====================================================
  const handleSaveCancha = async (formData: CanchaFormData, editingId?: number) => {
    if (!isAdmin) {
      showNotification('Acción restringida: Solo administradores pueden gestionar canchas', 'error');
      return;
    }

    if (editingId) {
      if (isBackendOnline) {
        await canchaApi.update(editingId, formData);
        showNotification('Cancha actualizada exitosamente');
        await cargarCanchas();
      } else {
        setCanchas(prev => prev.map(c => c.id_cancha === editingId ? {
          ...c,
          ...formData,
          precio_hora: Number(formData.precio_hora),
          capacidad: formData.capacidad ? Number(formData.capacidad) : null,
          largo: formData.largo ? Number(formData.largo) : null,
          ancho: formData.ancho ? Number(formData.ancho) : null,
        } : c));
        showNotification('Cancha actualizada (Modo Demo)');
      }
    } else {
      if (isBackendOnline) {
        await canchaApi.create(formData);
        showNotification('Cancha creada exitosamente');
        await cargarCanchas();
      } else {
        const newId = Math.max(0, ...canchas.map(c => c.id_cancha)) + 1;
        const newCancha: Cancha = {
          id_cancha: newId,
          nombre: formData.nombre,
          disciplina: formData.disciplina,
          precio_hora: Number(formData.precio_hora),
          capacidad: formData.capacidad ? Number(formData.capacidad) : null,
          estado: formData.estado,
          ubicacion: formData.ubicacion,
          largo: formData.largo ? Number(formData.largo) : null,
          ancho: formData.ancho ? Number(formData.ancho) : null,
          hora_apertura: formData.hora_apertura,
          hora_cierre: formData.hora_cierre,
        };
        setCanchas(prev => [newCancha, ...prev]);
        showNotification('Nueva cancha registrada (Modo Demo)');
      }
    }
  };

  const handleDeleteCancha = async (id: number) => {
    if (!isAdmin) {
      showNotification('Acción restringida: Solo administradores pueden eliminar canchas', 'error');
      return;
    }

    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar la cancha #${id}?`);
    if (!confirmDelete) return;

    try {
      if (isBackendOnline) {
        await canchaApi.delete(id);
        showNotification(`Cancha #${id} eliminada exitosamente`);
        await cargarCanchas();
      } else {
        setCanchas(prev => prev.filter(c => c.id_cancha !== id));
        showNotification(`Cancha #${id} eliminada (Modo Demo)`);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error al eliminar la cancha', 'error');
    }
  };

  const handleOpenCreateModal = () => {
    if (!isAdmin) {
      showNotification('Debes ser Administrador para agregar canchas', 'error');
      return;
    }
    setCanchaToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cancha: Cancha) => {
    if (!isAdmin) {
      showNotification('Debes ser Administrador para editar canchas', 'error');
      return;
    }
    setCanchaToEdit(cancha);
    setIsModalOpen(true);
  };

  // =====================================================
  // RESERVAR (con lógica distinta según sesión y modo)
  // =====================================================
  const handleSelectReserva = (cancha: Cancha) => {
    if (!isAuthenticated) {
      showNotification(
        `Para reservar "${cancha.nombre}" debes iniciar sesión con tu cuenta.`,
        'info'
      );
      setTimeout(() => {
        navigate('/login', { state: { from: '/canchas' } });
      }, 1800);
      return;
    }

    // Logueado: navega a disponibilidad de la cancha
    navigate(`/canchas/${cancha.id_cancha}/reservar`);
  };

  // =====================================================
  // FILTRADO + LÍMITE DE PREVIEW
  // =====================================================
  const filteredCanchas = canchas.filter(c => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(term) ||
      (c.ubicacion && c.ubicacion.toLowerCase().includes(term)) ||
      (c.disciplina && c.disciplina.toLowerCase().includes(term))
    );
  });

  const canchasAMostrar = isPreview
    ? filteredCanchas.slice(0, PREVIEW_LIMIT)
    : filteredCanchas;

  const hayMas = isPreview && filteredCanchas.length > PREVIEW_LIMIT;

  const notificationClass = notification?.type === 'success'
    ? 'border-emerald-500 bg-emerald-500/90 text-white'
    : notification?.type === 'error'
      ? 'border-red-500 bg-red-500/90 text-white'
      : 'border-sky-500 bg-sky-500/90 text-white';

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <section id="canchas" className="relative max-w-[1240px] mx-auto px-6 py-20">

      {/* Notificación Toast */}
      {notification && (
        <div className={`fixed bottom-8 right-8 z-[110] px-6 py-3.5 rounded-xl font-semibold text-sm shadow-lg border animate-slide-up ${notificationClass}`}>
          {notification.type === 'success' ? '✓ ' : notification.type === 'error' ? '⚠️ ' : 'ℹ️ '}
          {notification.msg}
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-wrap justify-between items-end gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs mb-3 px-3 py-1 rounded-full border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta text-claro-texto2 dark:text-oscuro-texto2">
            <span className={`w-2 h-2 rounded-full ${isBackendOnline ? 'bg-emerald-500 shadow-[0_0_6px_theme(colors.emerald.500)]' : 'bg-amber-500'}`} />
            {isBackendOnline ? 'Conectado a PostgreSQL (Backend API)' : 'Modo Demostración Frontend'}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-1.5 text-claro-texto dark:text-oscuro-texto">{title}</h2>
          <p className="text-base max-w-[620px] text-claro-texto2 dark:text-oscuro-texto2">{subtitle}</p>
        </div>

        <div>
          {/* En modo preview, no hay botón "Nueva Cancha" */}
          {!isPreview && isAdmin ? (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-colors bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Cancha
            </button>
          ) : !isPreview ? (
            <span className="text-xs px-3 py-1 rounded-full border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta text-claro-texto2 dark:text-oscuro-texto2">
              {isAuthenticated ? `Sesión: ${usuario?.nombre} (${usuario?.rol})` : 'Modo Explorador / Reservas'}
            </span>
          ) : null}
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda (solo modo app) */}
      {!isPreview && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {DISCIPLINAS.map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => setActiveDisciplina(d.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeDisciplina === d.id
                    ? 'bg-claro-primario dark:bg-oscuro-primario text-white dark:text-oscuro-fondo font-bold'
                    : 'border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-texto dark:hover:text-oscuro-texto'
                }`}
              >
                <span>{d.icon}</span>
                {d.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 min-w-[260px] px-3.5 py-2 rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta">
            <svg className="w-[18px] h-[18px] text-claro-texto2/70 dark:text-oscuro-texto2/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre o sector..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-claro-texto dark:text-oscuro-texto placeholder:text-claro-texto2/60 dark:placeholder:text-oscuro-texto2/60"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-lg leading-none text-claro-texto2/70 dark:text-oscuro-texto2/70 hover:text-claro-texto dark:hover:text-oscuro-texto"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid de Canchas */}
      {isLoading ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta">
          <div className="w-10 h-10 mx-auto mb-4 rounded-full border-[3px] border-claro-primario/20 dark:border-oscuro-primario/20 border-t-claro-primario dark:border-t-oscuro-primario animate-spin" />
          <p className="text-claro-texto2 dark:text-oscuro-texto2">Cargando canchas del complejo deportivo...</p>
        </div>
      ) : canchasAMostrar.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta">
          <div className="text-4xl mb-3">🏟️</div>
          <h3 className="text-lg font-bold mb-1 text-claro-texto dark:text-oscuro-texto">No se encontraron canchas</h3>
          <p className="text-claro-texto2 dark:text-oscuro-texto2">No hay canchas registradas para esta disciplina o término de búsqueda.</p>
          {!isPreview && isAdmin && (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="mt-5 px-5 py-2.5 rounded-xl font-medium border transition-colors border-claro-borde dark:border-oscuro-borde text-claro-texto dark:text-oscuro-texto hover:bg-claro-tinte dark:hover:bg-oscuro-tinte"
            >
              Crear primera cancha
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(340px,1fr))]">
            {canchasAMostrar.map(cancha => (
              <CanchaCard
                key={cancha.id_cancha}
                cancha={cancha}
                isAdmin={isAdmin}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteCancha}
                onSelectReserva={handleSelectReserva}
              />
            ))}
          </div>

          {/* CTA "Ver todas" (solo preview) */}
          {isPreview && (
            <div className="text-center mt-12">
              {isAuthenticated ? (
                <Link
                  to="/canchas"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold shadow-md transition-all hover:-translate-y-0.5 bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo"
                >
                  {hayMas ? `Ver todas las canchas (${filteredCanchas.length})` : 'Ver todas y reservar'}
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
              ) : (
                <Link
                  to="/login"
                  state={{ from: '/canchas' }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold shadow-md transition-all hover:-translate-y-0.5 bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo"
                >
                  Iniciar sesión para reservar
                </Link>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal Crear / Editar Cancha (solo modo app + admin) */}
      {!isPreview && isAdmin && (
        <CanchaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSaveCancha}
          canchaToEdit={canchaToEdit}
        />
      )}
    </section>
  );
};

export default CanchaList;