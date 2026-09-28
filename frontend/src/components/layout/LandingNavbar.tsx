/**
 * ============================================================================
 * ARCHIVO: LandingNavbar.tsx
 * COMPONENTE: Barra de navegación pública principal
 * - Visitante anónimo: Login / Registro / Ver Canchas
 * - Usuario logueado:  Panel + ThemeToggle + avatar con dropdown
 * Logo sincronizado con el del Navbar (sidebar) de la app autenticada.
 * ============================================================================
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFotoPerfil } from '../../hooks/useFotoPerfil';
import ThemeToggle from '../ThemeToggle';
import IconCanchas from '../../assets/icon_canchas.svg';

export const LandingNavbar = () => {
  const { usuario, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const fotoUrl = useFotoPerfil();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = usuario?.rol === 'Admin' || usuario?.rol === 'Administrador';
  const iniciales = usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Cerrar dropdown al click fuera
  useEffect(() => {
    const handleClickFuera = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  // =====================================================
  // ESTILOS COMPARTIDOS (mismos tokens que el Header)
  // =====================================================
  const linkOutline =
    'px-4 py-2 rounded-lg text-sm font-medium border transition-colors ' +
    'border-claro-borde dark:border-oscuro-borde ' +
    'text-claro-texto dark:text-oscuro-texto ' +
    'hover:bg-claro-tinte dark:hover:bg-oscuro-tinte';

  const linkPrimary =
    'px-4 py-2 rounded-lg text-sm font-semibold transition-colors ' +
    'bg-claro-primario hover:bg-claro-hover ' +
    'dark:bg-oscuro-primario dark:hover:bg-oscuro-hover ' +
    'text-white dark:text-oscuro-fondo';

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b border-claro-borde dark:border-oscuro-borde bg-claro-fondo/90 dark:bg-oscuro-fondo/90">
      <div className="max-w-[1240px] mx-auto h-[72px] px-6 flex items-center justify-between">

        {/* ============================================================
            LOGO — sincronizado con el del Navbar (sidebar)
            ============================================================ */}
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          title="Ir a la página principal / Home"
        >
          <IconCanchas className="w-9 h-9" />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-claro-texto dark:text-oscuro-texto tracking-tight leading-none">
              SportPlex
            </span>
            <span className="text-xs text-claro-texto2 dark:text-oscuro-texto2 mt-1">
              Complejo Deportivo
            </span>
          </div>
        </Link>

        {/* ============================================================
            NAV PÚBLICA (anclas de la landing)
            ============================================================ */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#canchas" className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-texto dark:hover:text-oscuro-texto transition-colors">Canchas</a>
          <a href="#como-funciona" className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-texto dark:hover:text-oscuro-texto transition-colors">Cómo Reservar</a>
          <a href="#servicios" className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-texto dark:hover:text-oscuro-texto transition-colors">Servicios</a>
          <a href="#contacto" className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-texto dark:hover:text-oscuro-texto transition-colors">Contacto</a>
        </nav>

        {/* ============================================================
            ZONA DERECHA (theme + sesión)
            ============================================================ */}
        <div className="flex items-center gap-2 md:gap-3">

          {/* ThemeToggle: visible SIEMPRE (logueado o no) */}
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <Link
                to={isAdmin ? '/usuarios' : '/dashboard'}
                className={`${linkOutline} hidden sm:inline-flex`}
              >
                {isAdmin ? 'Panel Admin' : 'Mi Panel'}
              </Link>

              <a href="#canchas" className={`${linkPrimary} hidden md:inline-flex`}>
                Reservar
              </a>

              {/* Dropdown de usuario (foto + nombre) */}
              <div className="relative ml-1" ref={menuRef}>
                <div
                  onClick={() => setMenuAbierto(!menuAbierto)}
                  className="flex items-center gap-2 cursor-pointer hover:bg-claro-tinte dark:hover:bg-oscuro-tinte p-1.5 rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-claro-primario dark:bg-oscuro-primario flex items-center justify-center text-white dark:text-oscuro-fondo font-bold text-base shadow-sm border-2 border-white dark:border-oscuro-tarjeta overflow-hidden">
                    {fotoUrl ? (
                      <img src={fotoUrl} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                      iniciales
                    )}
                  </div>
                  <div className="hidden md:flex items-center gap-1">
                    <span className="text-sm font-medium text-claro-texto dark:text-oscuro-texto">
                      {usuario?.nombre || 'Perfil'}
                    </span>
                    <svg
                      className={`w-4 h-4 text-claro-texto2 dark:text-oscuro-texto2 transition-transform duration-200 ${menuAbierto ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {menuAbierto && (
                  <div className="absolute right-0 mt-2 w-48 bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-xl shadow-lg py-2 z-50 overflow-hidden">
                    <Link
                      to={isAdmin ? '/usuarios' : '/dashboard'}
                      onClick={() => setMenuAbierto(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-claro-texto dark:text-oscuro-texto hover:bg-claro-tinte dark:hover:bg-oscuro-tinte transition-colors"
                    >
                      <svg className="w-4 h-4 text-claro-texto2 dark:text-oscuro-texto2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      {isAdmin ? 'Panel Admin' : 'Mi Panel'}
                    </Link>

                    <Link
                      to="/eventos"
                      onClick={() => setMenuAbierto(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-claro-texto dark:text-oscuro-texto hover:bg-claro-tinte dark:hover:bg-oscuro-tinte transition-colors"
                    >
                      <svg className="w-4 h-4 text-claro-texto2 dark:text-oscuro-texto2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Eventos
                    </Link>

                    <Link
                      to="/perfil"
                      onClick={() => setMenuAbierto(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-claro-texto dark:text-oscuro-texto hover:bg-claro-tinte dark:hover:bg-oscuro-tinte transition-colors"
                    >
                      <svg className="w-4 h-4 text-claro-texto2 dark:text-oscuro-texto2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Mi perfil
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={linkOutline}>
                Iniciar Sesión
              </Link>
              <Link to="/registro" className={`${linkOutline} hidden sm:inline-flex`}>
                Registrarse
              </Link>
              <a href="#canchas" className={linkPrimary}>
                Ver Canchas
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default LandingNavbar;