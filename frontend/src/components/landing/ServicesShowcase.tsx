/**
 * ============================================================================
 * ARCHIVO: ServicesShowcase.tsx
 * COMPONENTE: Sección de Servicios e Instalaciones del Complejo
 * Estilos migrados a Tailwind (tokens claro-x & oscuro-x de tailwind.config.js)
 * ============================================================================
 */

import React from 'react';

const SERVICES = [
  {
    icon: '💡',
    title: 'Iluminación LED Profesional',
    description: 'Sistemas de iluminación nocturna de alta potencia que garantizan visibilidad perfecta para partidos después de las 18:00.',
  },
  {
    icon: '🚿',
    title: 'Vestuarios y Duchas con Agua Caliente',
    description: 'Casilleros de seguridad individuales, baños higienizados y duchas presurizadas a disposición de los jugadores.',
  },
  {
    icon: '🚗',
    title: 'Parqueo Privado y Seguro',
    description: 'Amplia playa de estacionamiento con vigilancia por cámaras de circuito cerrado 24/7 para tu total tranquilidad.',
  },
  {
    icon: '🥤',
    title: 'Cafetería e Hidratación',
    description: 'Bebidas isotónicas, snacks saludables, área lounge con pantallas gigantes para ver partidos y descansar.',
  },
  {
    icon: '🏆',
    title: 'Organización de Torneos',
    description: 'Soporte y logística para ligas empresariales, campeonatos intercolegiales y eventos deportivos corporativos.',
  },
  {
    icon: '🛡️',
    title: 'Seguridad y Primeros Auxilios',
    description: 'Personal de atención médica primaria y botiquín de emergencia disponible en todo momento ante cualquier eventualidad.',
  },
];

export const ServicesShowcase: React.FC = () => {
  return (
    <section id="servicios" className="px-6 py-20 border-t border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo">
      <div className="text-center max-w-[650px] mx-auto mb-14">
        <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 bg-sky-500/10 text-sky-500 dark:text-sky-400">
          Comodidades
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-claro-texto dark:text-oscuro-texto">
          Instalaciones de Primer Nivel
        </h2>
        <p className="text-base text-claro-texto2 dark:text-oscuro-texto2">
          Todo lo necesario para que tu experiencia deportiva sea completa, segura y memorable.
        </p>
      </div>

      <div className="grid gap-7 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] max-w-[1240px] mx-auto">
        {SERVICES.map((s, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-8 transition-all hover:-translate-y-1 border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta"
          >
            <div className="text-3xl mb-4">{s.icon}</div>
            <h3 className="text-lg font-bold mb-2 text-claro-texto dark:text-oscuro-texto">{s.title}</h3>
            <p className="text-sm leading-relaxed text-claro-texto2 dark:text-oscuro-texto2">{s.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
export default ServicesShowcase;
