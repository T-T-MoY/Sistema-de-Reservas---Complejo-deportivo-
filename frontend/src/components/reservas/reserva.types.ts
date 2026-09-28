/**
 * ============================================================================
 * ARCHIVO: reserva.types.ts
 * TIPOS COMPARTIDOS del módulo de reservas.
 * ============================================================================
 */

// =====================================================
// ESTADOS
// =====================================================
export type EstadoReserva =
  | 'pendiente'
  | 'pendiente_pago'
  | 'confirmada'
  | 'cancelada'
  | 'pagada'
  | 'finalizada';

// =====================================================
// RESERVA
// =====================================================
export interface Reserva {
  id_reserva: number;
  id_cancha?: number;
  id_cliente?: number;

  // Cliente
  cliente_nombre?: string;
  apellido_paterno?: string;
  nombre?: string;
  paterno?: string;
  correo?: string;
  telefono?: string;

  // Cancha
  cancha_nombre?: string;
  disciplina?: string;
  ubicacion?: string;
  precio_hora?: number | string;

  // Reserva
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  estado: EstadoReserva | string;
  observaciones?: string | null;
  monto_total?: number | string;
  canal_reserva?: string;

  // Extras
  motivo_cancelacion?: string | null;
  fecha_creacion?: string;

  [key: string]: unknown;
}

// =====================================================
// FILTROS
// =====================================================
export type ReservaFiltro = 'mias' | 'todas';
export type ReservaModo = 'app' | 'preview';

// =====================================================
// PROPS
// =====================================================
export interface ReservaListProps {
  modo?: ReservaModo;
  filtro: ReservaFiltro;
  title?: string;
  subtitle?: string;
}

export interface ReservaCardProps {
  reserva: Reserva;
  isAdmin: boolean;
  onPagar?: (reserva: Reserva) => void;
  onCancelar?: (reserva: Reserva) => void;
  onModificar?: (reserva: Reserva) => void;
  onVerificarPago?: (reserva: Reserva) => void;
}