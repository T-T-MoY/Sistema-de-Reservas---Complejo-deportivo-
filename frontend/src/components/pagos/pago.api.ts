/**
 * ============================================================================
 * ARCHIVO: pago.api.ts
 * LLAMADAS HTTP del módulo de pagos.
 * ============================================================================
 */

import api from '../../services/api';
import type { Pago, CrearPagoInput } from './pago.types';

interface RespuestaProcesarPago {
  estado?: string;
  nro_comprobante?: string;
  [key: string]: unknown;
}

export const pagoApi = {
  /**
   * Procesa un pago presencial (sin comprobante).
   */
  procesar: async (input: CrearPagoInput): Promise<RespuestaProcesarPago> => {
    const metodoBackend =
      input.metodo_pago === 'tarjeta_debito' || input.metodo_pago === 'tarjeta_credito'
        ? 'tarjeta'
        : input.metodo_pago;

    const res = await api.post('/pagos/procesar', {
      id_reserva: input.id_reserva,
      metodo_pago: metodoBackend,
      numero_tarjeta: input.numero_tarjeta,
      referencia_pasarela: input.referencia_pasarela,
      modo_demo: true,
    });
    return res.data;
  },

  /**
   * Procesa un pago con comprobante subido (multipart).
   */
  procesarConComprobante: async (formData: FormData): Promise<RespuestaProcesarPago> => {
    const res = await api.post('/pagos/procesar-con-comprobante', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /**
   * Obtiene el pago de una reserva (puede estar vacío).
   */
  getByReserva: async (idReserva: number): Promise<Pago | null> => {
    const res = await api.get(`/pagos/reserva/${idReserva}`);
    const data = res.data?.data || res.data;
    if (!data) return null;
    return Array.isArray(data) ? data[0] || null : data;
  },

  /**
   * Lista los pagos pendientes de verificación (admin / empleado).
   */
  getPendientes: async (): Promise<Pago[]> => {
    const res = await api.get('/pagos/pendientes');
    return res.data?.data || res.data || [];
  },

  /**
   * Aprueba o rechaza un pago.
   */
  verificar: async (idPago: number, estado: 'pagado' | 'rechazado'): Promise<void> => {
    await api.patch(`/pagos/verificar/${idPago}`, { estado });
  },
};