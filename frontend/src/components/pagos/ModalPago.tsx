/**
 * ============================================================================
 * ARCHIVO: ModalPago.tsx
 * COMPONENTE: Modal único de pago para el cliente.
 * - Cliente paga su reserva eligiendo método.
 * - Virtual (tarjeta / QR) → sube comprobante → reserva pendiente_pago.
 * - Presencial → confirma reserva al instante.
 * ============================================================================
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { pagoApi } from './pago.api';
import type { MetodoPago, ModalPagoProps } from './pago.types';

const calcularHoras = (inicio: string, fin: string): number => {
  const [hi, mi] = inicio.slice(0, 5).split(':').map(Number);
  const [hf, mf] = fin.slice(0, 5).split(':').map(Number);
  return Math.max(0, (hf * 60 + mf - (hi * 60 + mi)) / 60);
};

const METODOS: {
  value: MetodoPago;
  label: string;
  icon: string;
}[] = [
  { value: 'presencial', label: 'Pago Presencial', icon: '🏢' },
  { value: 'tarjeta_debito', label: 'Tarjeta Débito', icon: '💳' },
  { value: 'tarjeta_credito', label: 'Tarjeta Crédito', icon: '💎' },
  { value: 'qr', label: 'Pago QR', icon: '📱' },
];

export const ModalPago = ({
  isOpen,
  reserva,
  onClose,
  onComplete,
}: ModalPagoProps) => {
  const [metodo, setMetodo] = useState<MetodoPago>('presencial');
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [nroComprobante, setNroComprobante] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setMetodo('presencial');
      setComprobante(null);
      setPreviewUrl('');
      setNroComprobante('');
      setMensaje('');
      setError('');
    }
  }, [isOpen]);

  const { precioReserva, total } = useMemo(() => {
    if (!reserva) return { precioReserva: 0, total: 0 };
    const precio = reserva.precio_hora
      ? Number(reserva.precio_hora) * calcularHoras(reserva.hora_inicio, reserva.hora_fin)
      : Number(reserva.monto_total || 0);
    const detalles = reserva.detallesIniciales || [];
    const extras = detalles.reduce((s, d) => s + d.subtotal, 0);
    return { precioReserva: precio, total: precio + extras };
  }, [reserva]);

  if (!isOpen || !reserva) return null;

  const esVirtual = metodo === 'tarjeta_debito' || metodo === 'tarjeta_credito' || metodo === 'qr';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Solo se permiten imágenes (JPG, PNG, WEBP) o PDF');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo no debe superar 5MB');
      return;
    }

    setComprobante(file);
    setPreviewUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : '');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (esVirtual && !comprobante) {
      setError('Para pagos virtuales es obligatorio subir el comprobante de pago.');
      return;
    }

    setCargando(true);
    try {
      if (esVirtual) {
        const formData = new FormData();
        formData.append('id_reserva', String(reserva.id_reserva));
        formData.append('metodo_pago', metodo);
        formData.append('nro_comprobante', nroComprobante || '');
        formData.append('comprobante', comprobante as File);

        await pagoApi.procesarConComprobante(formData);
        setMensaje('¡Comprobante enviado! Tu reserva será verificada por un administrador.');
      } else {
        await pagoApi.procesar({
          id_reserva: reserva.id_reserva,
          monto: Number(total.toFixed(2)),
          metodo_pago: 'presencial',
        });
        setMensaje('¡Reserva confirmada! El pago se realiza al llegar al complejo.');
      }

      setTimeout(() => {
        onComplete();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error al procesar el pago:', err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'No se pudo procesar el pago'
      );
    } finally {
      setCargando(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl shadow-xl overflow-hidden border border-claro-borde dark:border-oscuro-borde flex flex-col">

        {/* Cabecera */}
        <div className="px-6 py-5 border-b border-claro-borde dark:border-oscuro-borde bg-claro-tinte dark:bg-oscuro-tinte shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-claro-primario dark:text-oscuro-primario">
                Pago · Reserva #{reserva.id_reserva}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-claro-texto dark:text-oscuro-texto">
                Completar Pago
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-claro-texto2 hover:text-claro-texto dark:text-oscuro-texto2 dark:hover:text-oscuro-texto transition-colors"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {mensaje ? (
          <div className="p-8 text-center bg-claro-tarjeta dark:bg-oscuro-tarjeta">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-lg font-medium text-claro-primario dark:text-oscuro-primario">
              {mensaje}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-4 overflow-y-auto flex-1 bg-claro-tarjeta dark:bg-oscuro-tarjeta"
          >
            {/* Info reserva */}
            <div className="p-3 rounded-xl bg-claro-tinte dark:bg-oscuro-tinte text-sm">
              <p className="text-claro-texto dark:text-oscuro-texto">
                <strong>{reserva.cancha_nombre}</strong> ·{' '}
                {new Date(reserva.fecha_reserva).toLocaleDateString()} ·{' '}
                {reserva.hora_inicio.slice(0, 5)} - {reserva.hora_fin.slice(0, 5)}
              </p>
            </div>

            {/* Método de pago */}
            <div>
              <label className="block text-sm font-medium mb-2 text-claro-texto dark:text-oscuro-texto">
                Método de Pago *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {METODOS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => {
                      setMetodo(m.value);
                      setError('');
                    }}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      metodo === m.value
                        ? 'border-claro-primario dark:border-oscuro-primario bg-claro-tinte dark:bg-oscuro-tinte'
                        : 'border-claro-borde dark:border-oscuro-borde hover:border-claro-primario/50 dark:hover:border-oscuro-primario/50'
                    }`}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <p className="text-sm font-medium mt-1 text-claro-texto dark:text-oscuro-texto">
                      {m.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Aviso pago presencial */}
            {metodo === 'presencial' && (
              <div className="rounded-xl p-4 bg-claro-tinte dark:bg-oscuro-tinte border border-claro-primario/20 dark:border-oscuro-primario/20">
                <p className="text-sm text-claro-texto dark:text-oscuro-texto">
                  🏢 Pagarás directamente en el complejo deportivo al momento de tu reserva.
                </p>
              </div>
            )}

            {/* Campos pago virtual */}
            {esVirtual && (
              <>
                <div className="rounded-xl p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    ⚠️{' '}
                    <strong>
                      Para pagos virtuales es OBLIGATORIO subir el comprobante de pago.
                    </strong>
                    {metodo === 'qr' && ' Escanea el QR de tu banco y sube la captura.'}
                    {(metodo === 'tarjeta_debito' || metodo === 'tarjeta_credito') &&
                      ' Realiza la transferencia y sube el comprobante.'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-claro-texto dark:text-oscuro-texto">
                    Número de comprobante / Referencia
                  </label>
                  <input
                    type="text"
                    value={nroComprobante}
                    onChange={(e) => setNroComprobante(e.target.value)}
                    placeholder="Ej: TXN-123456789"
                    className="w-full px-3 py-2.5 border border-claro-borde dark:border-oscuro-borde rounded-xl bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-claro-texto dark:text-oscuro-texto">
                    Comprobante de pago * (imagen o PDF)
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors bg-claro-fondo dark:bg-oscuro-fondo ${
                      comprobante
                        ? 'border-claro-primario dark:border-oscuro-primario'
                        : 'border-claro-borde dark:border-oscuro-borde hover:border-claro-primario dark:hover:border-oscuro-primario'
                    }`}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-40 mx-auto rounded-lg"
                      />
                    ) : comprobante ? (
                      <div className="text-center">
                        <span className="text-3xl">✅</span>
                        <p className="text-sm mt-2 font-medium text-claro-primario dark:text-oscuro-primario">
                          {comprobante.name}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl">📤</span>
                        <p className="text-sm mt-2 text-claro-texto2 dark:text-oscuro-texto2">
                          Haz clic para subir el comprobante
                        </p>
                        <p className="text-xs text-claro-texto2 dark:text-oscuro-texto2 mt-1">
                          JPG, PNG, WEBP o PDF (máx. 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </>
            )}

            {/* Detalles adicionales */}
            {reserva.detallesIniciales && reserva.detallesIniciales.length > 0 && (
              <div className="rounded-xl border border-claro-borde dark:border-oscuro-borde p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-claro-primario dark:text-oscuro-primario mb-2">
                  Servicios adicionales
                </p>
                <div className="space-y-1">
                  {reserva.detallesIniciales.map((d) => (
                    <div
                      key={d.nombre}
                      className="flex justify-between text-sm text-claro-texto dark:text-oscuro-texto"
                    >
                      <span>
                        {d.nombre}{' '}
                        <span className="text-xs text-claro-texto2 dark:text-oscuro-texto2">
                          x{d.cantidad}
                        </span>
                      </span>
                      <span>Bs. {d.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            <div className="rounded-xl bg-claro-tinte dark:bg-oscuro-tinte p-4 border border-claro-primario/20 dark:border-oscuro-primario/20">
              <div className="flex justify-between text-sm text-claro-texto dark:text-oscuro-texto">
                <span>Reserva</span>
                <span>Bs. {precioReserva.toFixed(2)}</span>
              </div>
              {reserva.detallesIniciales && reserva.detallesIniciales.length > 0 && (
                <div className="flex justify-between text-sm text-claro-texto dark:text-oscuro-texto mt-1">
                  <span>Adicionales</span>
                  <span>
                    Bs.{' '}
                    {reserva.detallesIniciales
                      .reduce((s, d) => s + d.subtotal, 0)
                      .toFixed(2)}
                  </span>
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-claro-primario/20 dark:border-oscuro-primario/20 flex justify-between text-lg font-bold text-claro-primario dark:text-oscuro-primario">
                <span>Total a pagar</span>
                <span>Bs. {total.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t border-claro-borde dark:border-oscuro-borde shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-sm font-medium rounded-lg text-claro-texto dark:text-oscuro-texto hover:bg-claro-tinte dark:hover:bg-oscuro-tinte"
              >
                Pagar después
              </button>
              <button
                type="submit"
                disabled={cargando || (esVirtual && !comprobante)}
                className={`px-5 py-2 text-sm font-medium rounded-lg shadow-sm transition-all ${
                  cargando || (esVirtual && !comprobante)
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo'
                }`}
              >
                {cargando
                  ? 'Procesando...'
                  : esVirtual && !comprobante
                  ? 'Sube el comprobante'
                  : metodo === 'presencial'
                  ? `Confirmar Reserva`
                  : `Enviar Comprobante`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ModalPago;