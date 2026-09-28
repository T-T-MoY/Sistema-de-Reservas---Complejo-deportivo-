/**
 * ============================================================================
 * ARCHIVO: ModalVerificarPago.tsx
 * COMPONENTE: Modal que admin/empleado usa para verificar un pago o
 * registrar uno presencial si la reserva no tiene pago.
 *
 * - Los botones se ocultan cuando aparece el mensaje de éxito.
 * - Usa GET /pagos/pendientes y filtra por id_reserva (sin tocar backend).
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import { pagoApi } from './pago.api';
import type { Pago } from './pago.types';

interface Props {
  isOpen: boolean;
  idReserva: number | null;
  onClose: () => void;
  onComplete: () => void;
}

export const ModalVerificarPago = ({
  isOpen,
  idReserva,
  onClose,
  onComplete,
}: Props) => {
  const [pago, setPago] = useState<Pago | null>(null);
  const [cargando, setCargando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Bloqueo scroll body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fetch del pago al abrir (busca en /pagos/pendientes)
  useEffect(() => {
    if (!isOpen || !idReserva) {
      setPago(null);
      setError('');
      setMensaje('');
      return;
    }
    const fetchPago = async () => {
      setCargando(true);
      setError('');
      try {
        const pendientes = await pagoApi.getPendientes();
        const encontrado = pendientes.find(
          (p) => Number(p.id_reserva) === Number(idReserva)
        );
        setPago(encontrado || null);
      } catch (err: any) {
        console.error('Error al cargar pago:', err);
        setPago(null);
      } finally {
        setCargando(false);
      }
    };
    fetchPago();
  }, [isOpen, idReserva]);

  if (!isOpen) return null;

  const handleVerificar = async (estado: 'pagado' | 'rechazado') => {
    if (!pago) return;
    setVerificando(true);
    setError('');
    try {
      await pagoApi.verificar(pago.id_pago, estado);
      setMensaje(
        estado === 'pagado' ? 'Pago aprobado y reserva confirmada' : 'Pago rechazado'
      );
      setTimeout(() => {
        onComplete();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo verificar el pago');
    } finally {
      setVerificando(false);
    }
  };

  const handleRegistrarPresencial = async () => {
    if (!idReserva) return;
    setVerificando(true);
    setError('');
    try {
      await api.post('/pagos/procesar', {
        id_reserva: idReserva,
        metodo_pago: 'presencial',
      });
      setMensaje('Pago presencial registrado. Reserva confirmada.');
      setTimeout(() => {
        onComplete();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'No se pudo registrar el pago presencial'
      );
    } finally {
      setVerificando(false);
    }
  };

  const baseUrl = (
    import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
  ).replace(/\/api\/?$/, '');

  const esImagen = pago?.comprobante_url?.match(/\.(jpg|jpeg|png|webp)$/i);

  const getMetodoLabel = (metodo: string) => {
    const labels: Record<string, string> = {
      presencial: '🏢 Presencial',
      tarjeta_debito: '💳 Tarjeta Débito',
      tarjeta_credito: '💎 Tarjeta Crédito',
      tarjeta: '💳 Tarjeta',
      qr: '📱 QR',
      transferencia: '🏦 Transferencia',
    };
    return labels[metodo] || metodo;
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl shadow-xl overflow-hidden border border-claro-borde dark:border-oscuro-borde flex flex-col">

        {/* Cabecera */}
        <div className="px-6 py-5 border-b border-claro-borde dark:border-oscuro-borde bg-claro-tinte dark:bg-oscuro-tinte shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-claro-primario dark:text-oscuro-primario">
                {pago ? 'Verificar Pago' : 'Registrar Pago'}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-claro-texto dark:text-oscuro-texto">
                Reserva #{idReserva}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-claro-texto2 hover:text-claro-texto dark:text-oscuro-texto2 dark:hover:text-oscuro-texto transition-colors"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-claro-tarjeta dark:bg-oscuro-tarjeta">
          {mensaje ? (
            <div className="py-12 text-center">
              <div className="text-5xl mb-4">✅</div>
              <p className="text-lg font-medium text-claro-primario dark:text-oscuro-primario">
                {mensaje}
              </p>
            </div>
          ) : cargando ? (
            <div className="py-12 text-center text-claro-texto2 dark:text-oscuro-texto2">
              Cargando información de pago...
            </div>
          ) : pago ? (
            <>
              {/* Cliente + monto */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-claro-texto2 dark:text-oscuro-texto2 text-xs uppercase tracking-wide mb-1">
                    Cliente
                  </p>
                  <p className="text-claro-texto dark:text-oscuro-texto font-medium">
                    {pago.nombre} {pago.apellido_paterno}
                  </p>
                </div>
                <div>
                  <p className="text-claro-texto2 dark:text-oscuro-texto2 text-xs uppercase tracking-wide mb-1">
                    Monto
                  </p>
                  <p className="text-claro-primario dark:text-oscuro-primario font-bold text-lg">
                    Bs. {Number(pago.monto).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Reserva */}
              <div className="p-3 rounded-xl bg-claro-tinte dark:bg-oscuro-tinte text-sm space-y-1">
                {pago.cancha_nombre && (
                  <p className="text-claro-texto dark:text-oscuro-texto">
                    <strong>Cancha:</strong> {pago.cancha_nombre}
                  </p>
                )}
                {pago.fecha_reserva && (
                  <p className="text-claro-texto dark:text-oscuro-texto">
                    <strong>Fecha:</strong>{' '}
                    {new Date(pago.fecha_reserva).toLocaleDateString()}
                  </p>
                )}
                {pago.hora_inicio && pago.hora_fin && (
                  <p className="text-claro-texto dark:text-oscuro-texto">
                    <strong>Horario:</strong> {pago.hora_inicio.slice(0, 5)} -{' '}
                    {pago.hora_fin.slice(0, 5)}
                  </p>
                )}
                <p className="text-claro-texto dark:text-oscuro-texto">
                  <strong>Método:</strong> {getMetodoLabel(pago.metodo_pago)}
                </p>
                {pago.referencia_pasarela && (
                  <p className="text-xs text-claro-texto2 dark:text-oscuro-texto2">
                    Ref: {pago.referencia_pasarela}
                  </p>
                )}
              </div>

              {/* Comprobante */}
              {pago.comprobante_url ? (
                <div>
                  <p className="text-sm font-medium mb-2 text-claro-texto dark:text-oscuro-texto">
                    Comprobante
                  </p>
                  {esImagen ? (
                    <img
                      src={`${baseUrl}${pago.comprobante_url}`}
                      alt="Comprobante"
                      className="w-full rounded-xl border border-claro-borde dark:border-oscuro-borde"
                    />
                  ) : (
                    <a
                      href={`${baseUrl}${pago.comprobante_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo font-medium text-sm"
                    >
                      📄 Abrir comprobante (PDF)
                    </a>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-sm">
                  Este pago no tiene comprobante adjunto.
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-claro-tinte dark:bg-oscuro-tinte border border-claro-primario/20 dark:border-oscuro-primario/20">
                <p className="text-sm text-claro-texto dark:text-oscuro-texto">
                  Esta reserva <strong>aún no tiene un pago registrado</strong>. Puedes
                  registrarlo como pago presencial (efectivo en caja) para confirmar la
                  reserva.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  ⚠️ Al confirmar, la reserva pasará a estado <strong>confirmada</strong>.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Acciones — ocultas cuando se muestra mensaje de éxito */}
        {!mensaje && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-claro-borde dark:border-oscuro-borde shrink-0">
            {pago ? (
              <>
                <button
                  type="button"
                  disabled={verificando}
                  onClick={() => handleVerificar('rechazado')}
                  className="px-5 py-2 text-sm font-medium rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  Rechazar
                </button>
                <button
                  type="button"
                  disabled={verificando}
                  onClick={() => handleVerificar('pagado')}
                  className={`px-5 py-2 text-sm font-medium rounded-lg shadow-sm transition-all ${
                    verificando
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo'
                  }`}
                >
                  {verificando ? 'Procesando...' : 'Aprobar pago'}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={verificando}
                  onClick={onClose}
                  className="px-5 py-2 text-sm font-medium rounded-lg text-claro-texto dark:text-oscuro-texto hover:bg-claro-tinte dark:hover:bg-oscuro-tinte disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={verificando || cargando}
                  onClick={handleRegistrarPresencial}
                  className={`px-5 py-2 text-sm font-medium rounded-lg shadow-sm transition-all ${
                    verificando || cargando
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo'
                  }`}
                >
                  {verificando ? 'Registrando...' : 'Registrar Pago Presencial'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ModalVerificarPago;