/**
 * ============================================================================
 * ARCHIVO: MisReservas.tsx
 * PÁGINA: Vista del cliente con sus reservas.
 * RUTA: /reservas
 * ============================================================================
 */

import { ReservaList } from '../components/reservas/ReservaList';

export default function MisReservas() {
  return <ReservaList modo="app" filtro="mias" />;
}