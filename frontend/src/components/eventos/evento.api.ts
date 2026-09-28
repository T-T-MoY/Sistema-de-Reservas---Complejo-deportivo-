/**
 * ============================================================================
 * ARCHIVO: evento.api.ts
 * LLAMADAS HTTP del módulo de eventos.
 * ============================================================================
 */

import api from '../../services/api';
import type {
  Evento,
  Inscripcion,
  EventoFormData,
  ServicioSeleccionado,
} from './evento.types';

interface FiltrosEventos {
  disponibles?: boolean;
  tipo?: string;
  fecha?: string;
  id_cancha?: string;
}

export const eventoApi = {
  // ============================================================
  // EVENTOS
  // ============================================================
  getAll: async (filtros?: FiltrosEventos): Promise<Evento[]> => {
    const params = new URLSearchParams();
    if (filtros?.disponibles) params.append('disponibles', 'true');
    if (filtros?.tipo) params.append('tipo', filtros.tipo);
    if (filtros?.fecha) params.append('fecha', filtros.fecha);
    if (filtros?.id_cancha) params.append('id_cancha', filtros.id_cancha);

    const query = params.toString();
    const url = query ? `/eventos?${query}` : '/eventos';
    const res = await api.get(url);
    return res.data?.data || [];
  },

  getById: async (id: number): Promise<Evento | null> => {
    const res = await api.get(`/eventos/${id}`);
    return res.data?.data || null;
  },

  create: async (
    formData: EventoFormData,
    servicios: ServicioSeleccionado[]
  ): Promise<Evento> => {
    const payload = {
      ...formData,
      cupo_maximo: parseInt(String(formData.cupo_maximo)),
      servicios,
    };
    const res = await api.post('/eventos', payload);
    return res.data?.data || res.data;
  },

  update: async (
    id: number,
    formData: EventoFormData,
    servicios: ServicioSeleccionado[]
  ): Promise<Evento> => {
    const payload = {
      ...formData,
      cupo_maximo: parseInt(String(formData.cupo_maximo)),
      servicios,
    };
    const res = await api.put(`/eventos/${id}`, payload);
    return res.data?.data || res.data;
  },

  reprogramar: async (
    id: number,
    formData: EventoFormData,
    servicios: ServicioSeleccionado[]
  ): Promise<Evento> => {
    const payload = {
      ...formData,
      cupo_maximo: parseInt(String(formData.cupo_maximo)),
      servicios,
    };
    const res = await api.patch(`/eventos/${id}/reprogramar`, payload);
    return res.data?.data || res.data;
  },

  cancelar: async (id: number, motivo_cancelacion: string) => {
    const res = await api.patch(`/eventos/${id}/cancelar`, {
      motivo_cancelacion,
    });
    return res.data;
  },

  // ============================================================
  // CATÁLOGO DE SERVICIOS
  // ============================================================
  getServicios: async (): Promise<
    Array<{
      id_servicio: number;
      nombre: string;
      precio_referencia: number;
      tipo_servicio?: string;
      [key: string]: unknown;
    }>
  > => {
    const res = await api.get('/eventos/servicios');
    return res.data?.data || [];
  },

  // ============================================================
  // INSCRIPCIONES
  // ============================================================
  inscribir: async (idEvento: number): Promise<void> => {
    await api.post(`/eventos/${idEvento}/inscribir`, {});
  },

  misInscripciones: async (): Promise<Inscripcion[]> => {
    const res = await api.get('/eventos/mis-inscripciones');
    return res.data?.data || [];
  },

  cancelarInscripcion: async (idEvento: number): Promise<void> => {
    await api.patch(`/eventos/${idEvento}/cancelar-inscripcion`, {});
  },
};