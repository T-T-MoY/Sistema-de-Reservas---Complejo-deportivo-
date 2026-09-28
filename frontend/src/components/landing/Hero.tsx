/**
 * ============================================================================
 * ARCHIVO: Hero.tsx
 * COMPONENTE: Sección Principal de Bienvenida del Complejo Deportivo
 * Con animación de partículas interactiva estilo web moderna (mans.im)
 * Estilos migrados a Tailwind (tokens claro-x & oscuro-x de tailwind.config.js)
 * ============================================================================
 */

import React, { useEffect, useRef } from 'react';

export const Hero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const section = canvas.parentElement;

    let width = (canvas.width = section?.offsetWidth || window.innerWidth);
    let height = (canvas.height = section?.offsetHeight || 620);

    const handleResize = () => {
      if (!canvas || !section) return;
      width = canvas.width = section.offsetWidth;
      height = canvas.height = section.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    const mouse = { x: -1000, y: -1000, radius: 140 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    section?.addEventListener('mousemove', handleMouseMove);
    section?.addEventListener('mouseleave', handleMouseLeave);

    // Paleta de partículas deportivas luminosas (coincide con claro/oscuro primario)
    const colors = ['#5DA797', '#1C3034', '#38bdf8', '#F1EADA', '#06b6d4'];
    const count = Math.min(Math.floor((width * height) / 16000), 50);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.65;
        this.vy = (Math.random() - 0.5) * 0.65;
        this.size = Math.random() * 2 + 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.5 + 0.35;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 1.6;
          this.x -= (dx / dist) * force;
          this.y -= (dy / dist) * force;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        ctx.restore();
      }
    }

    const particles: Particle[] = Array.from({ length: count }, () => new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 115) {
            const alpha = (1 - dist / 115) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(93, 167, 151, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }

        const dx = mouse.x - particles[i].x;
        const dy = mouse.y - particles[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const alpha = (1 - dist / mouse.radius) * 0.35;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        particles[i].update();
        particles[i].draw();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      section?.removeEventListener('mousemove', handleMouseMove);
      section?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section className="relative overflow-hidden px-6 pt-22 pb-18 bg-claro-fondo dark:bg-oscuro-fondo border-b border-claro-borde dark:border-oscuro-borde">
      {/* 1. Orbes de luz con movimiento suave */}
      <div
        aria-hidden="true"
        className="absolute -top-[15%] left-[20%] w-[500px] h-[500px] rounded-full pointer-events-none z-[1] blur-[75px] animate-float-orb-1 bg-[radial-gradient(circle,rgba(93,167,151,0.20)_0%,rgba(28,48,52,0.25)_50%,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="absolute top-[10%] right-[10%] w-[550px] h-[550px] rounded-full pointer-events-none z-[1] blur-[85px] animate-float-orb-2 bg-[radial-gradient(circle,rgba(38,18,17,0.30)_0%,rgba(28,48,52,0.20)_50%,transparent_70%)]"
      />

      {/* 2. Patrón de rejilla geométrica */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-[1] opacity-60 dark:opacity-100 [background-size:32px_32px] bg-[radial-gradient(rgba(28,48,52,0.10)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(241,234,218,0.08)_1px,transparent_1px)]"
      />

      {/* 3. Canvas de partículas y constelación interactiva */}
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none z-[2]" />

      {/* 4. Contenido Principal */}
      <div className="relative z-[5] max-w-[960px] mx-auto text-center flex flex-col items-center">
        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-sm backdrop-blur-sm border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta/70 dark:bg-oscuro-tinte/50 text-claro-texto dark:text-oscuro-texto">
          <span className="w-2 h-2 rounded-full bg-claro-primario dark:bg-oscuro-primario animate-pulse-dot" />
          <span>Instalaciones abiertas hoy • Horario 06:00 a 23:30</span>
        </div>

        {/* Título Principal con Gradiente */}
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-5 text-claro-texto dark:text-oscuro-texto">
          Tu espacio ideal para <br />
          <span className="bg-gradient-to-br from-claro-primario to-sky-500 dark:from-oscuro-primario dark:to-sky-400 bg-clip-text text-transparent">
            jugar, entrenar y competir
          </span>
        </h1>

        {/* Descripción */}
        <p className="text-lg max-w-[720px] mb-9 text-claro-texto2 dark:text-oscuro-texto2">
          El complejo deportivo más completo de la ciudad. Reserva canchas de fútbol, básquetbol,
          voleibol, tenis y pádel con disponibilidad en tiempo real y confirmación instantánea.
        </p>

        {/* Grupo de Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-4 mb-14 w-full sm:w-auto">
          <a
            href="#canchas"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-base shadow-md transition-all hover:-translate-y-0.5 bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo"
          >
            Explorar Canchas
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
          <a
            href="#como-funciona"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-semibold text-base border transition-all border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta hover:bg-claro-tinte dark:hover:bg-oscuro-tinte text-claro-texto dark:text-oscuro-texto"
          >
            ¿Cómo reservar?
          </a>
        </div>

        {/* Barra de Estadísticas Rápidas */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 w-full max-w-[860px] rounded-2xl px-6 py-5 backdrop-blur-sm border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta/80 dark:bg-oscuro-tinte/40">
          {[
            { n: '6+', t: 'Canchas Profesionales' },
            { n: '7', t: 'Disciplinas Deportivas' },
            { n: '100%', t: 'Gestión en Línea' },
            { n: '4.9 ★', t: 'Calificación Usuarios' },
          ].map((stat, i) => (
            <React.Fragment key={stat.t}>
              {i > 0 && (
                <div className="hidden md:block w-px h-9 mx-6 bg-claro-borde dark:bg-oscuro-borde" />
              )}
              <div className="flex-1 text-center">
                <span className="block text-2xl font-extrabold text-claro-texto dark:text-oscuro-texto">{stat.n}</span>
                <span className="text-sm text-claro-texto2 dark:text-oscuro-texto2">{stat.t}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Hero;
