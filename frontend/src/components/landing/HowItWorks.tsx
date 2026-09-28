/**
 * ============================================================================
 * ARCHIVO: HowItWorks.tsx
 * COMPONENTE: Sección explicativa "Cómo Reservar"
 * Estilos migrados a Tailwind (tokens claro-x & oscuro-x de tailwind.config.js)
 * ============================================================================
 */

import React from 'react';

const STEPS = [
  {
    number: '01',
    icon: '🔍',
    title: 'Elige tu Cancha',
    description: 'Filtra por disciplina (Fútbol, Pádel, Tenis, Básquet) y revisa especificaciones, dimensiones y estado.',
  },
  {
    number: '02',
    icon: '📅',
    title: 'Selecciona Fecha y Hora',
    description: 'Verifica la disponibilidad en tiempo real sin colas ni llamadas. Elige el horario que mejor te convenga.',
  },
  {
    number: '03',
    icon: '⚽',
    title: 'Confirma y Juega',
    description: 'Recibe la confirmación inmediata de tu reserva y prepárate para disfrutar tu deporte favorito.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="como-funciona" className="px-6 py-20 border-t border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo">
      <div className="text-center max-w-[650px] mx-auto mb-14">
        <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 bg-sky-500/10 text-sky-500 dark:text-sky-400">
          Paso a Paso
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-claro-texto dark:text-oscuro-texto">
          ¿Cómo Funciona el Sistema?
        </h2>
        <p className="text-base text-claro-texto2 dark:text-oscuro-texto2">
          Reservar un escenario deportivo nunca fue tan rápido, transparente y cómodo.
        </p>
      </div>

      <div className="grid gap-7 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] max-w-[1240px] mx-auto">
        {STEPS.map(step => (
          <div
            key={step.number}
            className="rounded-2xl p-8 transition-all hover:-translate-y-1 border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta"
          >
            <div className="flex justify-between items-center mb-5">
              <span className="text-3xl font-black opacity-80 text-claro-primario dark:text-oscuro-primario">{step.number}</span>
              <span className="text-3xl">{step.icon}</span>
            </div>
            <h3 className="text-lg font-bold mb-2 text-claro-texto dark:text-oscuro-texto">{step.title}</h3>
            <p className="text-sm leading-relaxed text-claro-texto2 dark:text-oscuro-texto2">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
export default HowItWorks;
