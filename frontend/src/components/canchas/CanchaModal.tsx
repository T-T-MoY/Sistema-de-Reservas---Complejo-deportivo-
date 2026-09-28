/**
 * ============================================================================
 * ARCHIVO: CanchaModal.tsx
 * COMPONENTE: Modal para Crear / Editar Cancha Deportiva
 * ACCESO: Solo Administradores
 * Estilos migrados a Tailwind (tokens claro-x & oscuro-x de tailwind.config.js).
 * Reutiliza el helper claseInput() ya usado en ModalUsuario.tsx para que los
 * inputs se vean idénticos en todo el sistema.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import type { Cancha, CanchaFormData } from './cancha.types';
import { claseInput } from '../../utils/validaciones';

interface CanchaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CanchaFormData, editingId?: number) => Promise<void>;
  canchaToEdit?: Cancha | null;
}

const INITIAL_FORM: CanchaFormData = {
  nombre: '',
  disciplina: 'futbol',
  capacidad: '',
  precio_hora: '',
  estado: 'disponible',
  ubicacion: '',
  largo: '',
  ancho: '',
  hora_apertura: '07:00',
  hora_cierre: '23:00',
};

const labelClass = 'text-sm font-semibold text-claro-texto2 dark:text-oscuro-texto2';
const inputClass = claseInput(false, true);

export const CanchaModal: React.FC<CanchaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  canchaToEdit,
}) => {
  const [formData, setFormData] = useState<CanchaFormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isEditing = Boolean(canchaToEdit);

  useEffect(() => {
    if (canchaToEdit) {
      setFormData({
        nombre: canchaToEdit.nombre,
        disciplina: canchaToEdit.disciplina || 'futbol',
        capacidad: canchaToEdit.capacidad ?? '',
        precio_hora: canchaToEdit.precio_hora,
        estado: canchaToEdit.estado || 'disponible',
        ubicacion: canchaToEdit.ubicacion || '',
        largo: canchaToEdit.largo ?? '',
        ancho: canchaToEdit.ancho ?? '',
        hora_apertura: canchaToEdit.hora_apertura ? canchaToEdit.hora_apertura.slice(0, 5) : '07:00',
        hora_cierre: canchaToEdit.hora_cierre ? canchaToEdit.hora_cierre.slice(0, 5) : '23:00',
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setErrorMsg('');
  }, [canchaToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.nombre.trim()) {
      setErrorMsg('El nombre de la cancha es obligatorio');
      return;
    }

    if (!formData.precio_hora || Number(formData.precio_hora) < 0) {
      setErrorMsg('Debes ingresar un precio por hora válido');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData, canchaToEdit?.id_cancha);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la cancha en el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[540px] max-h-[90vh] overflow-y-auto rounded-2xl p-8 shadow-xl animate-modal-in border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-claro-texto dark:text-oscuro-texto">
            {isEditing ? `Editar Cancha #${canchaToEdit?.id_cancha}` : 'Registrar Nueva Cancha'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-texto dark:hover:text-oscuro-texto"
          >
            ×
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 px-4 py-2.5 rounded-xl text-sm border border-red-400 bg-red-500/10 text-red-600 dark:text-red-400">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Nombre de la Cancha *</label>
            <input
              type="text"
              placeholder="Ej: Cancha Central Sintética"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              required
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Disciplina Deportiva</label>
              <select
                value={formData.disciplina}
                onChange={e => setFormData({ ...formData, disciplina: e.target.value })}
                className={inputClass}
              >
                <option value="futbol">Fútbol</option>
                <option value="futsal">Futsal</option>
                <option value="padel">Pádel</option>
                <option value="tenis">Tenis</option>
                <option value="basquet">Básquetbol</option>
                <option value="voley">Voleibol</option>
                <option value="atletismo">Atletismo</option>
                <option value="multiuso">Multiuso</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Estado Operativo</label>
              <select
                value={formData.estado}
                onChange={e => setFormData({ ...formData, estado: e.target.value })}
                className={inputClass}
              >
                <option value="disponible">Disponible</option>
                <option value="mantenimiento">En Mantenimiento</option>
                <option value="ocupada">Ocupada</option>
                <option value="inactiva">Inactiva</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Precio por Hora (Bs.) *</label>
              <input
                type="number"
                step="0.50"
                min="0"
                placeholder="100.00"
                value={formData.precio_hora}
                onChange={e => setFormData({ ...formData, precio_hora: e.target.value })}
                required
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Capacidad (personas)</label>
              <input
                type="number"
                min="1"
                placeholder="Ej: 14"
                value={formData.capacidad}
                onChange={e => setFormData({ ...formData, capacidad: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Ubicación / Sector en el Complejo</label>
            <input
              type="text"
              placeholder="Ej: Sector Norte - Bloque C"
              value={formData.ubicacion}
              onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Largo (metros)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej: 40.0"
                value={formData.largo}
                onChange={e => setFormData({ ...formData, largo: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Ancho (metros)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej: 20.0"
                value={formData.ancho}
                onChange={e => setFormData({ ...formData, ancho: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Hora Apertura</label>
              <input
                type="time"
                value={formData.hora_apertura}
                onChange={e => setFormData({ ...formData, hora_apertura: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Hora Cierre</label>
              <input
                type="time"
                value={formData.hora_cierre}
                onChange={e => setFormData({ ...formData, hora_cierre: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-medium border transition-colors disabled:opacity-50 border-claro-borde dark:border-oscuro-borde text-claro-texto dark:text-oscuro-texto hover:bg-claro-tinte dark:hover:bg-oscuro-tinte"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50 bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo"
            >
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Registrar Cancha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CanchaModal;
