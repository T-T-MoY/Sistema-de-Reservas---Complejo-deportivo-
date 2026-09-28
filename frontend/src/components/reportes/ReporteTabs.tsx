/**
 * ============================================================================
 * ARCHIVO: ReporteTabs.tsx
 * COMPONENTE: Contenedor con tabs + filtro de fechas + renderizado de reportes.
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { defaultRangeDate } from '../../utils/formatDate';
import { reporteApi } from './reporte.api';
import { DonaMetricas } from './ReportesPagosGrafica';
import { MapaOcupacionCanchas } from './ReportesHeatMap';
import { ReportesRentabilidad } from './ReportesRentabilidad';
import { ReporteComportamiento } from './ReportesComportamiento';
import type { ReportPagos, MetodoPagoMetrica, ReporteTab } from './reporte.types';

export const ReporteTabs = () => {
  const defaultRange = defaultRangeDate();
  const [fechaInicio, setFechaInicio] = useState<string>(defaultRange.fechaInicio);
  const [fechaFin, setFechaFin] = useState<string>(defaultRange.fechaFin);

  const [dataPagos, setDataPagos] = useState<ReportPagos[]>([]);
  const [dataMetricasPagos, setDataMetricasPagos] = useState<MetodoPagoMetrica[]>([]);

  const [tabActive, setTabActive] = useState<ReporteTab>('ocupacion');

  useEffect(() => {
    const obtenerDataPagos = async () => {
      try {
        const [pagos, metricas] = await Promise.all([
          reporteApi.pagos({ fechaInicio, fechaFin }),
          reporteApi.metricasPagos({ fechaInicio, fechaFin }),
        ]);
        setDataPagos(pagos);
        setDataMetricasPagos(metricas);
      } catch (error) {
        console.error('Error al obtener analítica de pagos', error);
      }
    };
    obtenerDataPagos();
  }, [fechaInicio, fechaFin]);

  const tabs: { id: ReporteTab; label: string }[] = [
    { id: 'ocupacion', label: 'Reporte ocupacional' },
    { id: 'finanzas', label: 'Reporte de finanzas' },
    { id: 'rentabilidad', label: 'Rentabilidad' },
    { id: 'usuarios', label: 'Comportamiento Usuarios' },
  ];

  return (
    <div className="space-y-6">
      {/* Filtro de fechas */}
      <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">Rango de fechas</p>
            <h3 className="text-xl font-bold text-claro-texto dark:text-oscuro-texto mt-1">Filtrar reportes</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="bg-transparent text-claro-texto dark:text-oscuro-texto text-sm px-3 py-2 rounded-xl border border-claro-borde dark:border-oscuro-borde focus:outline-none cursor-pointer"
            />
            <span className="hidden sm:inline text-claro-texto2 dark:text-oscuro-texto2 text-sm font-medium">a</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="bg-transparent text-claro-texto dark:text-oscuro-texto text-sm px-3 py-2 rounded-xl border border-claro-borde dark:border-oscuro-borde focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-2 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabActive(tab.id)}
              className={`flex-1 sm:flex-initial text-sm font-medium px-5 py-2.5 rounded-xl transition-colors ${
                tabActive === tab.id
                  ? 'bg-claro-primario dark:bg-oscuro-primario text-white dark:text-oscuro-fondo shadow-sm'
                  : 'text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-texto dark:hover:text-oscuro-texto hover:bg-claro-borde/30 dark:hover:bg-oscuro-borde/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      {tabActive === 'ocupacion' && (
        <MapaOcupacionCanchas fechaInicio={fechaInicio} fechaFin={fechaFin} />
      )}

      {tabActive === 'finanzas' && (
        dataPagos && dataPagos.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {dataPagos.map((item) => (
                <div
                  key={item.estado}
                  className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors"
                >
                  <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">{item.estado}</p>
                  <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">
                    Cantidad: {item.cantidad}
                  </p>
                  <h3 className="text-3xl font-bold text-claro-texto dark:text-oscuro-texto mt-2">
                    {item.total} Bs.
                  </h3>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DonaMetricas
                data={dataMetricasPagos}
                metrica="cantidad"
                titulo="Volumen de Transacciones"
                subtitulo="Distribución según la frecuencia de uso de cada método"
              />
              <DonaMetricas
                data={dataMetricasPagos}
                metrica="monto"
                titulo="Ingresos Totales (Bs.)"
                subtitulo="Distribución del dinero recaudado por método de pago"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl border border-claro-borde dark:border-oscuro-borde">
            <div className="w-12 h-12 mb-3 rounded-full bg-claro-borde/30 dark:bg-oscuro-borde/30 flex items-center justify-center text-claro-texto2 dark:text-oscuro-texto2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2-2 4 4m4-7a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-claro-texto dark:text-oscuro-texto">No hay datos disponibles</h4>
            <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2 mt-1">
              No se encontraron registros de pagos o finanzas para el rango de fechas seleccionado.
            </p>
          </div>
        )
      )}

      {tabActive === 'rentabilidad' && (
        <ReportesRentabilidad fechaInicio={fechaInicio} fechaFin={fechaFin} />
      )}

      {tabActive === 'usuarios' && (
        <ReporteComportamiento fechaInicio={fechaInicio} fechaFin={fechaFin} />
      )}
    </div>
  );
};

export default ReporteTabs;