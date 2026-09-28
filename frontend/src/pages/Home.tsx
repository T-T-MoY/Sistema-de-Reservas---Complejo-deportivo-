/**
 * ============================================================================
 * ARCHIVO: Home.tsx
 * PÁGINA: Página Principal del Complejo Deportivo (Landing Page)
 * RUTA: /
 * NOTA: El chrome (LandingNavbar + Footer) lo provee PublicLayout.
 *       Esta página solo compone las secciones de la landing.
 * ============================================================================
 */

import { Hero } from '../components/landing/Hero';
import { CanchaList } from '../components/canchas/CanchaList';
import { HowItWorks } from '../components/landing/HowItWorks';
import { ServicesShowcase } from '../components/landing/ServicesShowcase';

export default function Home() {
  return (
    <>
      {/* 1. Sección Hero con métricas y bienvenida */}
      <Hero />

      {/* 2. Catálogo y Gestión de Canchas (CRUD con permisos admin) */}
      <CanchaList />

      {/* 3. ¿Cómo funciona la reserva? */}
      <HowItWorks />

      {/* 4. Comodidades y Servicios */}
      <ServicesShowcase />
    </>
  );
}