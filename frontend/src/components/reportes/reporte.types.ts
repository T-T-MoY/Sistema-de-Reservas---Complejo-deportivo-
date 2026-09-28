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
// TABS
// =====================================================
export type ReporteTab = 'ocupacion' | 'finanzas' | 'rentabilidad' | 'usuarios';

// =====================================================
// PROPS COMUNES
// =====================================================
export interface ReporteFiltroProps {
  fechaInicio: string;
  fechaFin: string;
}