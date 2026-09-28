/**
 * ============================================================================
 * ARCHIVO: InscripcionList.tsx
 * COMPONENTE: Lista de inscripciones del cliente logueado.
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { eventoApi } from './evento.api';
import { InscripcionCard } from './InscripcionCard';
import type { Inscripcion, InscripcionListProps } from './evento.types';

export const InscripcionList = ({
  modo = 'app',
  title,
  subtitle,
}: InscripcionListProps) => {
  const isPreview = modo === 'preview';

  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState<{
    tipo: 'exito' | 'error';
    texto: string;
  } | null>(null);
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);

  const cargarInscripciones = async () => {
    setCargando(true);
    setError('');
    try {
      const data = await eventoApi.misInscripciones();
      setInscripciones(data);
    } catch (err) {
      console.error('Error al cargar inscripciones:', err);
      setError('No se pudieron cargar tus inscripciones.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarInscripciones();
  }, []);

  const handleCancelar = async (idEvento: number) => {
    if (
      !window.confirm(
        '¿Estás seguro que deseas cancelar tu inscripción a este evento?'
      )
    ) {
      return;
    }

    setCancelandoId(idEvento);
    setMensaje(null);
    try {
      await eventoApi.cancelarInscripcion(idEvento);
      setMensaje({
        tipo: 'exito',
        texto: 'Inscripción cancelada con éxito. Se ha liberado tu cupo.',
      });
      await cargarInscripciones();
      setTimeout(() => setMensaje(null), 4000);
    } catch (err: any) {
      setMensaje({
        tipo: 'error',
        texto:
          err.response?.data?.message || 'Error al cancelar la inscripción.',
      });
    } finally {
      setCancelandoId(null);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="space-y-6 pb-10">
      {!isPreview && (
        <div>
          <h2 className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto">
            {title || 'Mis Inscripciones'}
          </h2>
          <p className="text-claro-texto2 dark:text-oscuro-texto2 mt-1">
            {subtitle ||
              'Gestiona tu participación en los eventos del complejo deportivo.'}
          </p>
        </div>
      )}

      {mensaje && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${
            mensaje.tipo === 'exito'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {mensaje.texto}
          <button
            onClick={() => setMensaje(null)}
            className="float-right font-bold"
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}

      {cargando ? (
        <div className="text-center py-10 text-claro-texto2 dark:text-oscuro-texto2">
          Cargando inscripciones...
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500 font-medium">
          {error}
        </div>
      ) : inscripciones.length === 0 ? (
        <div className="text-center py-10 bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl border border-claro-borde dark:border-oscuro-borde">
          <div className="text-5xl mb-3">🏆</div>
          <p className="text-lg font-medium text-claro-texto dark:text-oscuro-texto">
            No tienes inscripciones activas
          </p>
          <p className="text-claro-texto2 dark:text-oscuro-texto2 mb-6">
            Explora los eventos disponibles y únete a uno.
          </p>
          <a
            href="/eventos"
            className="inline-block bg-claro-primario text-white px-6 py-2.5 rounded-xl font-bold hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover transition-colors"
          >
            Ver Eventos
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inscripciones.map((inscripcion) => (
            <InscripcionCard
              key={inscripcion.id_inscripcion}
              inscripcion={inscripcion}
              onCancelar={handleCancelar}
              cancelando={cancelandoId === inscripcion.id_evento}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InscripcionList;