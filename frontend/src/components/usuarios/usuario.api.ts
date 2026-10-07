/**
 * ============================================================================
 * ARCHIVO: usuario.api.ts
 * LLAMADAS HTTP del módulo de usuarios.
 * Usa el axios configurado en services/api.ts (con baseURL y token).
 * ============================================================================
 */

import api from '../../services/api';
import type { Usuario } from './usuario.types';

export const usuarioApi = {
  /**
   * Lista todos los usuarios (solo admin).
   */
  getAll: async (): Promise<Usuario[]> => {
    const res = await api.get<Usuario[]>('/usuarios');
    return res.data;
  },

  /**
   * Obtiene un usuario por ID.
   */
  getById: async (id: number | string): Promise<Usuario> => {
    const res = await api.get<Usuario>(`/usuarios/${id}`);
    return res.data;
  },

  /**
   * Crea un nuevo usuario.
   */
  create: async (payload: Record<string, unknown>): Promise<Usuario> => {
    const res = await api.post<Usuario>('/usuarios', payload);
    return res.data;
  },

  /**
   * Actualiza un usuario existente.
   */
  update: async (
    id: number | string,
    payload: Record<string, unknown>
  ): Promise<Usuario> => {
    const res = await api.put<Usuario>(`/usuarios/${id}`, payload);
    return res.data;
  },

  /**
   * Elimina un usuario.
   * Lanza el error completo de axios para que el llamador pueda inspeccionar
   * el status y el mensaje del backend.
   */
  delete: async (id: number | string): Promise<void> => {
    await api.delete(`/usuarios/${id}`);
  },
};