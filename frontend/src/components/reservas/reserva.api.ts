/**
 * ============================================================================
 * ARCHIVO: reserva.api.ts
 * LLAMADAS HTTP del módulo de reservas.
 * ============================================================================
 */

import api from '../../services/api';
import type { Reserva } from './reserva.types';

export const reservaApi = {
  /**
   * Reservas del cliente logueado.
   */
  getMias: async (): Promise<Reserva[]> => {
    const res = await api.get('/reservas/mis-reservas');
    return res.data?.data || [];
  },

  /**
   * Todas las reservas (solo admin/empleado).
   */
  getTodas: async (): Promise<Reserva[]> => {
    const res = await api.get('/reservas');
    return res.data?.data || [];
  },

  /**
   * Crea una reserva.
   */
  create: async (payload: Record<string, unknown>): Promise<Reserva> => {
    const res = await api.post('/reservas', payload);
    return res.data?.data || res.data;
  },

  /**
   * Modifica una reserva existente.
   */
  update: async (id: number, payload: Record<string, unknown>): Promise<Reserva> => {
    const res = await api.put(`/reservas/${id}`, payload);
    return res.data?.data || res.data;
  },

  /**
   * Cancela una reserva con motivo.
   */
  cancelar: async (id: number, motivo: string): Promise<void> => {
    await api.put(`/reservas/${id}/cancelar`, { motivo });
  },
};