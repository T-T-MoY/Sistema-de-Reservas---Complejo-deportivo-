/**
 * ============================================================================
 * ARCHIVO: GestionEventos.tsx
 * PÁGINA: Gestión de eventos para admin/empleado.
 * RUTA: /gestion-eventos
 * ============================================================================
 */

import { EventoList } from '../components/eventos/EventoList';

export default function GestionEventos() {
  return <EventoList modo="admin" />;
}