/**
 * ============================================================================
 * ARCHIVO: ReportesHeatMap.tsx
 * COMPONENTE: Mapa de calor de ocupación de canchas.
 *
 * PALETA: escala de verde del sistema con 5 niveles:
 *   0 reservas → claro-tinte   (verde muy claro)
 *   1 reserva  → verde claro
 *   2 reservas → verde medio (primario)
 *   3 reservas → verde oscuro
 *   4+         → oscuro profundo
 *
 * Se usa una escala fija (no depende del tema) porque el heatmap necesita
 * mostrar gradación de intensidad, y para ello los colores deben ser
 * consistentes en claro y oscuro.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { reporteApi } from './reporte.api';
import type { CanchaReporte, HeatmapNivoData } from './reporte.types';

interface Props {
  fechaInicio: string;
  fechaFin: string;
}

// Paleta de intensidad — coherente con los tonos verde/crema del sistema
const PALETA_HEATMAP = {
  nivel0: '#F1EADA', // crema claro (equivalente a claro-tinte)
  nivel1: '#8FC7B8', // verde claro
  nivel2: '#5DA797', // verde primario del sistema
  nivel3: '#3B7B6D', // verde oscuro
  nivel4: '#1C3034', // oscuro profundo (equivalente a oscuro-tarjeta)
};

export const MapaOcupacionCanchas: React.FC<Props> = ({ fechaInicio, fechaFin }) => {
  const [canchas, setCanchas] = useState<CanchaReporte[]>([]);
  const [canchaSeleccionada, setCanchaSeleccionada] = useState<string>('todas');
  const [dataHeatmap, setDataHeatmap] = useState<HeatmapNivoData[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [totalReservas, setTotalReservas] = useState<number>(0);
  const [horasOcupadas, setHorasOcupadas] = useState<number>(0);
  const [mayorDemanda, setMayorDemanda] = useState<string>('-');

  useEffect(() => {
    const obtenerCanchas = async () => {
      try {
        const data = await reporteApi.listarCanchas();
        setCanchas(data);
      } catch (error) {
        console.error('Error al listar canchas:', error);
      }
    };
    obtenerCanchas();
  }, []);

  useEffect(() => {
    const obtenerOcupacion = async () => {
      if (!fechaInicio || !fechaFin) return;
      setCargando(true);
      try {
        const payload = { fechaInicio, fechaFin, idCancha: canchaSeleccionada };
        const [heatmap, total, horas, demanda] = await Promise.all([
          reporteApi.heatmap(payload),
          reporteApi.totalReservas(payload),
          reporteApi.horasOcupadas(payload),
          reporteApi.mayorDemanda(payload),
        ]);
        setDataHeatmap(heatmap);
        setTotalReservas(total);
        setHorasOcupadas(horas);
        setMayorDemanda(demanda);
      } catch (error) {
        console.error('Error al obtener ocupación:', error);
      } finally {
        setCargando(false);
      }
    };
    obtenerOcupacion();
  }, [fechaInicio, fechaFin, canchaSeleccionada]);

  const exportarCSV = () => {
    let contenido = 'REPORTE DE OCUPACIÓN\n\n';
    contenido += `Fecha inicio,${fechaInicio}\n`;
    contenido += `Fecha fin,${fechaFin}\n`;

    const cancha =
      canchaSeleccionada === 'todas'
        ? 'Todas las canchas'
        : canchas.find((c) => c.id_cancha.toString() === canchaSeleccionada)?.nombre ||
          'Cancha seleccionada';

    contenido += `Cancha,${cancha}\n`;
    contenido += `Total de reservas,${totalReservas}\n`;
    contenido += `Horas ocupadas,${horasOcupadas}\n`;
    contenido += `Mayor demanda,${mayorDemanda}\n\n`;
    contenido += 'Día,Hora,Reservas\n';

    dataHeatmap.forEach((dia) => {
      dia.data.forEach((hora) => {
        contenido += `${dia.id},${hora.x},${hora.y}\n`;
      });
    });

    const archivo = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'reporte_ocupacion.csv';
    enlace.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-claro-texto dark:text-oscuro-texto">
            Mapa de Calor de Ocupación
          </h3>
          <p className="text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2">
            Frecuencia de reservas según días y horas pico
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportarCSV}
            className="px-4 py-2 rounded-xl bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo text-sm font-medium transition-colors"
          >
            Exportar CSV
          </button>

          <div className="flex items-center gap-2">
            <label
              htmlFor="select-cancha"
              className="text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2"
            >
              Cancha:
            </label>
            <select
              id="select-cancha"
              value={canchaSeleccionada}
              onChange={(e) => setCanchaSeleccionada(e.target.value)}
              className="bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto text-sm px-3 py-2 rounded-xl border border-claro-borde dark:border-oscuro-borde focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40 cursor-pointer"
            >
              <option value="todas" className="bg-claro-tarjeta dark:bg-oscuro-tarjeta">
                Todas las canchas
              </option>
              {canchas.map((cancha) => (
                <option
                  key={cancha.id_cancha}
                  value={cancha.id_cancha}
                  className="bg-claro-tarjeta dark:bg-oscuro-tarjeta"
                >
                  {cancha.nombre} ({cancha.disciplina})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPIs resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-claro-fondo dark:bg-oscuro-fondo p-4 rounded-xl border border-claro-borde dark:border-oscuro-borde">
          <p className="text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2">
            Total de reservas
          </p>
          <p className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto mt-1">
            {totalReservas}
          </p>
        </div>

        <div className="bg-claro-fondo dark:bg-oscuro-fondo p-4 rounded-xl border border-claro-borde dark:border-oscuro-borde">
          <p className="text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2">
            Horas ocupadas
          </p>
          <p className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto mt-1">
            {horasOcupadas}
          </p>
        </div>

        <div className="bg-claro-fondo dark:bg-oscuro-fondo p-4 rounded-xl border border-claro-borde dark:border-oscuro-borde">
          <p className="text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2">
            Mayor demanda
          </p>
          <p className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto mt-1">
            {mayorDemanda}
          </p>
        </div>
      </div>

      {/* Heatmap */}
      {cargando ? (
        <div className="h-80 flex items-center justify-center text-claro-texto2 dark:text-oscuro-texto2 text-sm">
          Cargando datos de ocupación...
        </div>
      ) : dataHeatmap.length > 0 ? (
        <div className="h-80 w-full">
          <ResponsiveHeatMap
            data={dataHeatmap}
            margin={{ top: 20, right: 30, bottom: 50, left: 70 }}
            valueFormat={(val) => `${val} reservas`}
            axisTop={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: 'Hora del día',
              legendPosition: 'middle',
              legendOffset: 40,
            }}
            axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}

            /* Escala de 5 niveles con paleta del sistema */
            colors={(cell) => {
              const v = Number(cell.value ?? 0);
              if (v <= 0) return PALETA_HEATMAP.nivel0;
              if (v === 1) return PALETA_HEATMAP.nivel1;
              if (v === 2) return PALETA_HEATMAP.nivel2;
              if (v === 3) return PALETA_HEATMAP.nivel3;
              return PALETA_HEATMAP.nivel4;
            }}

            emptyColor={PALETA_HEATMAP.nivel0}
            borderRadius={3}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [['darker', 0.1]] }}
            enableLabels={true}

            /* Texto que se adapta al fondo de cada celda */
            labelTextColor={(cell) => {
              const v = Number(cell.value ?? 0);
              return v >= 3 ? '#F1EADA' : '#1C3034';
            }}

            theme={{
              text: { fontSize: 11, fill: 'currentColor' },
              axis: {
                ticks: { text: { fill: 'currentColor' } },
                legend: { text: { fill: 'currentColor', fontWeight: 'bold' } },
              },
              tooltip: {
                container: {
                  background: '#1f2937',
                  color: '#ffffff',
                  fontSize: '12px',
                  borderRadius: '8px',
                },
              },
            }}
          />
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center text-claro-texto2 dark:text-oscuro-texto2 text-sm">
          No hay reservas registradas para esta cancha en las fechas seleccionadas.
        </div>
      )}
    </div>
  );
};

export default MapaOcupacionCanchas;