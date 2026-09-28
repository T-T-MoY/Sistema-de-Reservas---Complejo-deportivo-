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
} from './reporte.types';

interface PayloadFechas {
  fechaInicio: string;
  fechaFin: string;
  idCancha?: string;
}

export const reporteApi = {
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

  pagos: async (payload: Pick<PayloadFechas, 'fechaInicio' | 'fechaFin'>): Promise<ReportPagos[]> => {
    const res = await api.post('/reportes/pagos', payload);
    return res.data?.data || [];
  },

  metricasPagos: async (payload: Pick<PayloadFechas, 'fechaInicio' | 'fechaFin'>): Promise<MetodoPagoMetrica[]> => {
    const res = await api.post('/reportes/metricasPagos', payload);
    return res.data?.data || [];
  },

  rentabilidadServicios: async (payload: Pick<PayloadFechas, 'fechaInicio' | 'fechaFin'>): Promise<RentabilidadServicio[]> => {
    const res = await api.post('/reportes/rentabilidadServicios', payload);
    return (res.data?.data || []).map((item: RentabilidadServicio) => ({
      ...item,
      ingresos: Number(item.ingresos),
    }));
  },

  comportamientoUsuarios: async (payload: Pick<PayloadFechas, 'fechaInicio' | 'fechaFin'>): Promise<ReporteComportamientoData | null> => {
    const res = await api.post('/reportes/comportamiento-usuarios', payload);
    return res.data?.data || null;
  },
};