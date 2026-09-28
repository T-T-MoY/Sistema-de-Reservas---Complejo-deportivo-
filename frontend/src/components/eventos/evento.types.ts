/**
 * ============================================================================
 * ARCHIVO: evento.types.ts
 * TIPOS COMPARTIDOS del módulo de eventos.
 * ============================================================================
 */

// =====================================================
// CANCHA ASIGNADA (JOIN con cancha)
// =====================================================
export interface CanchaAsignada {
  id_cancha: number;
  nombre: string;
  disciplina: string;
  ubicacion?: string;
  precio_hora?: number;
}

// =====================================================
// SERVICIO ADICIONAL (JOIN con servicio)
// =====================================================
export interface ServicioEvento {
  id_servicio: number;
  nombre: string;
  costo_contratado: string | number;
}

// =====================================================
// EVENTO
// =====================================================
export type EstadoEvento = 'programado' | 'cancelado' | 'finalizado';
export type TipoEvento =
  | 'torneo'
  | 'exhibicion'
  | 'recreativo'
  | 'social'
  | 'otro';

export interface Evento {
  id_evento: number;
  nombre_evento: string;
  descripcion: string;
  fecha_evento: string;
  hora_inicio: string;
  hora_fin: string;
  cupo_maximo: number;
  cupos_restantes: number;
  tipo_evento: TipoEvento | string;
  estado: EstadoEvento | string;
  cancha_asignada?: CanchaAsignada;
  servicios_adicionales?: ServicioEvento[];
  costo_total?: number;
  motivo_cancelacion?: string | null;
  fecha_cancelacion?: string | null;
  fecha_creacion?: string;
  [key: string]: unknown;
}

// =====================================================
// FORM DATA (para crear/editar evento)
// =====================================================
export interface EventoFormData {
  nombre_evento: string;
  descripcion: string;
  fecha_evento: string;
  hora_inicio: string;
  hora_fin: string;
  cupo_maximo: number;
  tipo_evento: string;
  id_cancha: string;
}

export interface ServicioSeleccionado {
  id_servicio: number;
  costo_contratado: number;
}

// =====================================================
// INSCRIPCIÓN (eventos del cliente)
// =====================================================
export interface Inscripcion {
  id_inscripcion: number;
  id_cliente: number;
  id_evento: number;
  fecha_inscripcion: string;
  estado_inscripcion: string;
  estado_evento: string;

  // Datos del evento (JOIN)
  nombre_evento: string;
  fecha_evento: string;
  hora_inicio: string;
  hora_fin: string;
  tipo_evento: string;
  cancha_nombre?: string;
  cupo_maximo?: number;
  cupos_restantes?: number;
  costo_total?: number;

  [key: string]: unknown;
}

// =====================================================
// MODOS DE LISTA
// =====================================================
export type EventoListModo = 'catalogo' | 'admin' | 'preview';   // 👈 CORREGIDO
export type InscripcionListModo = 'app' | 'preview';

// =====================================================
// PROPS
// =====================================================
export interface EventoListProps {
  modo?: EventoListModo;
  title?: string;
  subtitle?: string;
}

export interface EventoCardProps {
  evento: Evento;
  modo: EventoListModo;
  isAdmin?: boolean;
  isCliente?: boolean;
  onInscribir?: (idEvento: number) => void;
  onEditar?: (evento: Evento) => void;
  onCancelar?: (evento: Evento) => void;
  onReprogramar?: (evento: Evento) => void;
}

export interface InscripcionListProps {
  modo?: InscripcionListModo;
  title?: string;
  subtitle?: string;
}