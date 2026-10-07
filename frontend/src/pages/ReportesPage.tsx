/**
 * ============================================================================
 * ARCHIVO: ReportesPage.tsx
 * PÁGINA: Dashboard de reportes con tabs (ocupación, finanzas, rentabilidad,
 *         usuarios, canchas, eventos y servicios).
 * RUTA: /reportes
 *
 * NOTA: Toda la lógica vive en components/reportes/ReporteTabs.tsx.
 *       Este archivo solo envuelve el componente en un layout mínimo.
 * ============================================================================
 */

import { ReporteTabs } from '../components/reportes/ReporteTabs';

export default function ReportesPage() {
  return (
    <div className="min-h-screen bg-claro-fondo dark:bg-oscuro-fondo transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <ReporteTabs />
      </div>
    </div>
  );
}