/**
 * ============================================================================
 * ARCHIVO: EventosPage.tsx
 * PÁGINA: Catálogo público de eventos.
 * RUTA: /eventos
 * ============================================================================
 */

import { EventoList } from '../components/eventos/EventoList';

export default function EventosPage() {
  return <EventoList modo="catalogo" />;
}