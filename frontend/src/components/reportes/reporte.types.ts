/**
 * ============================================================================
 * ARCHIVO: reporte.types.ts
 * TIPOS COMPARTIDOS del módulo de reportes.
 * ============================================================================
 */

// =====================================================
// CANCHAS (para el heatmap)
// =====================================================
export interface CanchaReporte {
  id_cancha: number;
  nombre: string;
  disciplina: string;
}

// =====================================================
// HEATMAP (datos Nivo)
// =====================================================
export interface HeatmapNivoData {
  id: string;
  data: { x: string; y: number }[];
}

// =====================================================
// PAGOS (para la dona)
// =====================================================
export interface MetodoPagoMetrica {
  id: string;
  label: string;
  cantidad: number;
  monto: number;
}

export interface ReportPagos {
  estado: string;
  total: number;
  cantidad: number;
}

// =====================================================
// RENTABILIDAD
// =====================================================
export interface RentabilidadServicio {
  servicio: string;
  cantidad: number;
  ingresos: number;
  [key: string]: string | number;
}

// =====================================================
// COMPORTAMIENTO
// =====================================================
export interface ClienteVip {
  id_cliente: number;
  cliente: string;
  correo: string;
  telefono: string;
  total_reservas: number;
  total_gastado: number;
}

export interface MetricasComportamiento {
  total_solicitadas: number;
  confirmadas: number;
  canceladas: number;
  pendientes: number;
  porcentaje_cancelacion: number;
}

export interface ReporteComportamientoData {
  clientesVip: ClienteVip[];
  metricas: MetricasComportamiento;
  nuevosClientes: number;
}

// =====================================================
// USUARIOS (reporte admin)
// =====================================================
export interface UsuarioReporte {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  telefono: string;
  estado_cuenta: string;
  fecha_registro: string;
  tipo_usuario: string;
}

export interface DistribucionUsuarios {
  tipo_usuario: string;
  cantidad: number;
}

export interface ReporteUsuariosData {
  usuarios: UsuarioReporte[];
  distribucion: DistribucionUsuarios[];
}

export interface FiltrosReporteUsuarios {
  fechaInicio: string;
  fechaFin: string;
  tipoUsuario: string;
  estado: string;
  busqueda: string;
}

// =====================================================
// EVENTOS Y SERVICIOS (reporte admin)
// =====================================================
export interface EventoServicioItem {
  id_evento: number;
  nombre_evento: string;
  tipo_evento: string;
  fecha_evento: string;
  hora_inicio: string;
  hora_fin: string;
  canchas: string;
  servicios: string;
  cupo_maximo: number;
  estado: string;
}

export interface ServicioIngreso {
  id: string;
  label: string;
  value: number;
}

export interface ReporteEventosServiciosData {
  eventos: EventoServicioItem[];
  ingresosServicios: ServicioIngreso[];
}

// =====================================================
// PAGOS — DETALLES (tabla)
// =====================================================
export interface DetallePagoItem {
  fecha: string;
  concepto: string;
  monto: number;
  metodo: string;
  estado: string;
}

// =====================================================
// HISTORIAL CLIENTE — RESERVAS
// =====================================================
export interface ReservaHistorial {
  id_reserva: number;
  cancha: string;
  disciplina: string | null;
  hora_inicio: string;
  hora_fin: string;
  estado_reserva: string;
  monto: number | null;
  estado_pago: string | null;
}

// =====================================================
// HISTORIAL CLIENTE — INSCRIPCIONES
// =====================================================
export interface InscripcionHistorial {
  id_inscripcion: number;
  id_evento: number;
  nombre_evento: string;
  descripcion: string | null;
  hora_inicio: string;
  hora_fin: string;
  tipo_evento: string | null;
  fecha_inscripcion: string;
  estado_inscripcion: string;
  estado_evento: string;
}

// =====================================================
// TABS
// =====================================================
export type ReporteTab =
  | 'ocupacion'
  | 'finanzas'
  | 'rentabilidad'
  | 'usuarios'
  | 'canchas'
  | 'eventos-servicios';

export type ReporteTabCliente = 'reservas' | 'inscripciones';

// =====================================================
// PROPS COMUNES
// =====================================================
export interface ReporteFiltroProps {
  fechaInicio: string;
  fechaFin: string;
}