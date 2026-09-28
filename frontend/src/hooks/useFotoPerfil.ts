// src/hooks/useFotoPerfil.ts
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface PerfilResponse {
  foto_url?: string | null;
}

/**
 * Hook que obtiene la URL de la foto de perfil del usuario autenticado.
 * Se re-fetcha cada vez que cambia la ruta (para reflejar cambios tras subir foto).
 * Devuelve `null` si no hay sesión, no hay foto, o hay error.
 */
export const useFotoPerfil = (): string | null => {
  const { token } = useAuth();
  const location = useLocation();
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    const fetchFoto = async (): Promise<void> => {
      if (!token) {
        setFotoUrl(null);
        return;
      }
      try {
        const res = await axios.get<PerfilResponse>(
          `${import.meta.env.VITE_API_URL}/usuarios/perfil`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (cancelado) return;

        if (res.data.foto_url) {
          const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
          setFotoUrl(`${baseUrl}${res.data.foto_url}`);
        } else {
          setFotoUrl(null);
        }
      } catch (error) {
        if (!cancelado) {
          console.error('Error al cargar foto del perfil', error);
          setFotoUrl(null);
        }
      }
    };

    fetchFoto();

    return () => {
      cancelado = true;
    };
  }, [token, location.pathname]);

  return fotoUrl;
};