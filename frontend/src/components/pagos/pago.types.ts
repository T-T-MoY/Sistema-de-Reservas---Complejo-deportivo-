/**
 * ============================================================================
 * ARCHIVO: pago.types.ts
 * TIPOS COMPARTIDOS del módulo de pagos.
 * ============================================================================
 */

// =====================================================
// MÉTODOS DE PAGO
// =====================================================
export type MetodoPago =
  | 'presencial'
  | 'tarjeta_debito'
  | 'tarjeta_credito'
  | 'qr';

export type MetodoPagoBackend =
  | 'presencial'
  | 'tarjeta'
  | 'tarjeta_debito'
  | 'tarjeta_credito'
  | 'qr';

export type EstadoPago =
  | 'pendiente'
  | 'pendiente_verificacion'
  | 'pagado'
  | 'rechazado';

// =====================================================
// DETALLE DE PAGO (para adicionales/servicios)
// =====================================================
export interface PagoDetalle {
  nombre: string;
  tipo: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

// =====================================================
// PAGO (lo que devuelve el backend)
// =====================================================
export interface Pago {
  id_pago: number;
  id_reserva: number;
  monto: number | string;
  metodo_pago: string;
  tipo_registro?: string;
  fecha_pago: string;
  referencia_pasarela?: string | null;
  nro_comprobante?: string | null;
  comprobante_url?: string | null;
  estado: EstadoPago | string;

  // Datos del cliente (JOIN con usuario)
  nombre?: string;
  apellido_paterno?: string;
  correo?: string;

  // Datos de la reserva (JOIN)
  cancha_nombre?: string;
  fecha_reserva?: string;
  hora_inicio?: string;
  hora_fin?: string;

  [key: string]: unknown;
}

// =====================================================
// INPUT para crear pago
// =====================================================
export interface CrearPagoInput {
  id_reserva: number;
  monto: number;
  metodo_pago: MetodoPago;
  numero_tarjeta?: string;
  referencia_pasarela?: string;
  detalles?: PagoDetalle[];
}

// =====================================================
// RESERVA mínima para el modal de pago
// =====================================================
export interface ReservaParaPago {
  id_reserva: number;
  cancha_nombre?: string;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  precio_hora?: number | string;
  monto_total?: number | string;
  cliente_nombre?: string;
  apellido_paterno?: string;
  detallesIniciales?: PagoDetalle[];
}

// =====================================================
// PROPS de modales
// =====================================================
export interface ModalPagoProps {
  isOpen: boolean;
  reserva: ReservaParaPago | null;
  onClose: () => void;
  onComplete: () => void;
}

export interface ModalVerificarPagoProps {
  isOpen: boolean;
  idReserva: number | null;
  onClose: () => void;
  onComplete: () => void;
}