/**
 * ============================================================================
 * ARCHIVO: GestionReservas.tsx
 * PÁGINA: Vista admin/empleado de todas las reservas.
 * RUTA: /gestion-reservas
 * ============================================================================
 */

import { ReservaList } from '../components/reservas/ReservaList';

export default function GestionReservas() {
  return <ReservaList modo="app" filtro="todas" />;
}