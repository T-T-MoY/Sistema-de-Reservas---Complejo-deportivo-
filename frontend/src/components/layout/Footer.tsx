/**
 * ============================================================================
 * ARCHIVO: Footer.tsx
 * COMPONENTE: Pie de Página Institucional del Complejo Deportivo
 * Estilos migrados a Tailwind (tokens claro-x & oscuro-x de tailwind.config.js)
 * ============================================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';

const linkClass =
  "text-sm text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-primario dark:hover:text-oscuro-primario transition-colors";

export const Footer: React.FC = () => {
  return (
    <footer
      id="contacto"
      className="mt-auto pt-16 pb-8 px-6 border-t border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo"
    >
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Columna Marca */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 font-extrabold text-lg text-claro-texto dark:text-oscuro-texto">
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-claro-primario dark:bg-oscuro-primario text-white dark:text-oscuro-fondo">⚡</span>
            SPORT<span className="text-claro-primario dark:text-oscuro-primario">PLEX</span>
          </div>
          <p className="text-sm mt-4 mb-4 max-w-[320px] text-claro-texto2 dark:text-oscuro-texto2">
            El complejo deportivo más completo y moderno de la ciudad. Infraestructura pensada para deportistas de alto rendimiento y aficionados.
          </p>
          <div className="flex gap-2 text-sm text-claro-texto2/80 dark:text-oscuro-texto2/80">
            <span>📍 Av. Universitaria #450, La Paz</span>
          </div>
        </div>

        {/* Columna Disciplinas */}
        <div>
          <h4 className="font-bold mb-4 text-claro-texto dark:text-oscuro-texto">Disciplinas</h4>
          <ul className="flex flex-col gap-3">
            <li><a href="#canchas" className={linkClass}>Fútbol 11 y Futsal</a></li>
            <li><a href="#canchas" className={linkClass}>Pádel y Tenis</a></li>
            <li><a href="#canchas" className={linkClass}>Básquetbol Reglamentario</a></li>
            <li><a href="#canchas" className={linkClass}>Voleibol y Arena</a></li>
          </ul>
        </div>

        {/* Columna Sistema */}
        <div>
          <h4 className="font-bold mb-4 text-claro-texto dark:text-oscuro-texto">Sistema</h4>
          <ul className="flex flex-col gap-3">
            <li><Link to="/login" className={linkClass}>Iniciar Sesión</Link></li>
            <li><Link to="/registro" className={linkClass}>Crear Cuenta Cliente</Link></li>
            <li><a href="#como-funciona" className={linkClass}>Políticas de Reserva</a></li>
            <li><a href="#servicios" className={linkClass}>Tarifas y Horarios</a></li>
          </ul>
        </div>

        {/* Columna Contacto */}
        <div>
          <h4 className="font-bold mb-4 text-claro-texto dark:text-oscuro-texto">Atención y Reservas</h4>
          <p className="text-sm mb-2.5 text-claro-texto2 dark:text-oscuro-texto2">📞 +591 (2) 244-8900</p>
          <p className="text-sm mb-2.5 text-claro-texto2 dark:text-oscuro-texto2">📱 WhatsApp: +591 789-01234</p>
          <p className="text-sm mb-2.5 text-claro-texto2 dark:text-oscuro-texto2">✉️ contacto@sportplex.bo</p>
          <p className="text-sm mb-2.5 text-claro-texto2 dark:text-oscuro-texto2">🕒 Lunes a Domingo: 06:00 - 23:30</p>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto pt-6 border-t border-claro-borde dark:border-oscuro-borde">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-claro-texto2/70 dark:text-oscuro-texto2/70">
          <p>© {new Date().getFullYear()} SPORTPLEX - Complejo Deportivo. Todos los derechos reservados.</p>
          <p>Proyecto Análisis y Diseño de Datos - UMSA</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
