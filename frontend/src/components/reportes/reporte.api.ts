/**
 * ============================================================================
 * ARCHIVO: reporte.api.ts
 * LLAMADAS HTTP del módulo de reportes.
 * ============================================================================
 */

import api from '../../services/api';
import type {
  CanchaReporte,
  HeatmapNivoData,
  MetodoPagoMetrica,
  ReportPagos,
  RentabilidadServicio,
  ReporteComportamientoData,
  ReporteUsuariosData,
  FiltrosReporteUsuarios,
  ReporteEventosServiciosData,
  DetallePagoItem,
  ReservaHistorial,
  InscripcionHistorial,
} from './reporte.types';

interface PayloadFechas {
  fechaInicio: string;
  fechaFin: string;
  idCancha?: string;
}

interface RespuestaReporteUsuarios {
  success: boolean;
  data: ReporteUsuariosData;
}

interface RespuestaEventosServicios {
  success?: boolean;
  data?: {
    eventos?: unknown;
    ingresosServicios?: unknown;
  };
  eventos?: unknown;
  ingresosServicios?: unknown;
}

export const reporteApi = {
  // =====================================================
  // CANCHAS / HEATMAP
  // =====================================================
  listarCanchas: async (): Promise<CanchaReporte[]> => {
    const res = await api.get('/reportes/listarCanchas');
    return res.data?.data || [];
  },

  heatmap: async (payload: PayloadFechas): Promise<HeatmapNivoData[]> => {
    const res = await api.post('/reportes/heatmap', payload);
    return res.data?.data || [];
  },

  totalReservas: async (payload: PayloadFechas): Promise<number> => {
    const res = await api.post('/reportes/totalReservas', payload);
    return res.data?.data?.total || 0;
  },

  horasOcupadas: async (payload: PayloadFechas): Promise<number> => {
    const res = await api.post('/reportes/horasOcupadas', payload);
    return Number(res.data?.data?.horas || 0);
  },

  mayorDemanda: async (payload: PayloadFechas): Promise<string> => {
    const res = await api.post('/reportes/mayorDemanda', payload);
    return res.data?.data?.hora || '-';
  },

  // =====================================================
  // PAGOS / FINANZAS
  // =====================================================
  pagos: async (
    payload: Pick<PayloadFechas, 'fechaInicio' | 'fechaFin'>
  ): Promise<ReportPagos[]> => {
    const res = await api.post('/reportes/pagos', payload);
    return res.data?.data || [];
  },

  metricasPagos: async (
    payload: Pick<PayloadFechas, 'fechaInicio' | 'fechaFin'>
  ): Promise<MetodoPagoMetrica[]> => {
    const res = await api.post('/reportes/metricasPagos', payload);
    return res.data?.data || [];
  },

  detallesPagos: async (
    payload: Pick<PayloadFechas, 'fechaInicio' | 'fechaFin'>
  ): Promise<DetallePagoItem[]> => {
    const res = await api.post('/reportes/detallesPagos', payload);
    return res.data?.data || [];
  },

  // =====================================================
  // RENTABILIDAD
  // =====================================================
  rentabilidadServicios: async (
    payload: Pick<PayloadFechas, 'fechaInicio' | 'fechaFin'>
  ): Promise<RentabilidadServicio[]> => {
    const res = await api.post('/reportes/rentabilidadServicios', payload);
    return (res.data?.data || []).map((item: RentabilidadServicio) => ({
      ...item,
      ingresos: Number(item.ingresos),
    }));
  },

  // =====================================================
  // COMPORTAMIENTO USUARIOS
  // =====================================================
  comportamientoUsuarios: async (
    payload: Pick<PayloadFechas, 'fechaInicio' | 'fechaFin'>
  ): Promise<ReporteComportamientoData | null> => {
    const res = await api.post('/reportes/comportamiento-usuarios', payload);
    return res.data?.data || null;
  },

  // =====================================================
  // REPORTE DE USUARIOS (con filtros)
  // =====================================================
  reporteUsuarios: async (
    filtros: FiltrosReporteUsuarios
  ): Promise<ReporteUsuariosData> => {
    const res = await api.post<RespuestaReporteUsuarios>('/reportes/usuarios', filtros);
    return (
      res.data?.data || {
        usuarios: [],
        distribucion: [],
      }
    );
  },

  // =====================================================
  // REPORTE DE CANCHAS
  // =====================================================
  reporteCanchas: async (): Promise<CanchaReporte[]> => {
    const res = await api.get('/canchas');
    const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
    return data;
  },

  // =====================================================
  // EVENTOS Y SERVICIOS
  // =====================================================
  eventosServicios: async (
    payload: Pick<PayloadFechas, 'fechaInicio' | 'fechaFin'>
  ): Promise<ReporteEventosServiciosData> => {
    const res = await api.post<RespuestaEventosServicios>(
      '/reportes/eventos-servicios',
      payload
    );

    // El backend puede devolver la data en distintas formas; lo normalizamos.
    const payloadResp = res.data?.data || res.data || {};

    let eventos: unknown = [];
    let ingresosServicios: unknown = [];

    if (Array.isArray(payloadResp)) {
      eventos = payloadResp;
    } else if (payloadResp && typeof payloadResp === 'object') {
      const p = payloadResp as Record<string, unknown>;
      eventos = Array.isArray(p.eventos) ? p.eventos : [];
      ingresosServicios = Array.isArray(p.ingresosServicios) ? p.ingresosServicios : [];
    }

    return {
      eventos: eventos as ReporteEventosServiciosData['eventos'],
      ingresosServicios:
        ingresosServicios as ReporteEventosServiciosData['ingresosServicios'],
    };
  },

  // =====================================================
  // HISTORIAL CLIENTE — RESERVAS
  // =====================================================
  historialReservasCliente: async (): Promise<ReservaHistorial[]> => {
    const res = await api.get('/reportes/historial-cliente');
    return res.data?.data || [];
  },

  // =====================================================
  // HISTORIAL CLIENTE — INSCRIPCIONES
  // =====================================================
  historialInscripcionesCliente: async (): Promise<InscripcionHistorial[]> => {
    const res = await api.get('/reportes/historial-inscripciones');
    return res.data?.data || [];
  },
};