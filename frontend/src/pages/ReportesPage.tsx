/**
 * ============================================================================
 * ARCHIVO: ReportesPage.tsx
 * PÁGINA: Dashboard de reportes con tabs (ocupación, finanzas, rentabilidad, usuarios).
 * RUTA: /reportes
 * NOTA: Toda la lógica vive en components/reportes/ReporteTabs.tsx
 * ============================================================================
 */

import { ReporteTabs } from '../components/reportes/ReporteTabs';

export default function ReportesPage() {
  return <ReporteTabs />;
}