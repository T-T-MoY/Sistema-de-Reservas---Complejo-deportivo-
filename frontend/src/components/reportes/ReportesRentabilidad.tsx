/**
 * ============================================================================
 * ARCHIVO: ReportesRentabilidad.tsx
 * COMPONENTE: Reporte de rentabilidad por servicios.
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { reporteApi } from './reporte.api';
import type { RentabilidadServicio } from './reporte.types';

interface Props {
  fechaInicio: string;
  fechaFin: string;
}

export const ReportesRentabilidad: React.FC<Props> = ({ fechaInicio, fechaFin }) => {
  const [datos, setDatos] = useState<RentabilidadServicio[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);

  useEffect(() => {
    const obtenerRentabilidad = async () => {
      if (!fechaInicio || !fechaFin) return;
      setCargando(true);
      try {
        const data = await reporteApi.rentabilidadServicios({ fechaInicio, fechaFin });
        setDatos(data);
      } catch (error) {
        console.error('Error al obtener la rentabilidad:', error);
      } finally {
        setCargando(false);
      }
    };
    obtenerRentabilidad();
  }, [fechaInicio, fechaFin]);

  const totalIngresos = datos.reduce((total, item) => total + item.ingresos, 0);
  const totalServicios = datos.reduce((total, item) => total + item.cantidad, 0);

  const servicioMayorIngresos =
    datos.length > 0
      ? datos.reduce((mayor, item) => (item.ingresos > mayor.ingresos ? item : mayor))
      : null;

  const exportarCSV = () => {
    let contenido = 'REPORTE DE RENTABILIDAD DE SERVICIOS\n\n';
    contenido += `Fecha inicio,${fechaInicio}\n`;
    contenido += `Fecha fin,${fechaFin}\n\n`;
    contenido += `Total de ingresos,${totalIngresos.toFixed(2)}\n`;
    contenido += `Total de servicios contratados,${totalServicios}\n`;
    if (servicioMayorIngresos) {
      contenido += `Servicio con mayores ingresos,${servicioMayorIngresos.servicio}\n`;
    }
    contenido += '\nServicio,Cantidad,Ingresos\n';
    datos.forEach((item) => {
      contenido += `${item.servicio},${item.cantidad},${item.ingresos.toFixed(2)}\n`;
    });

    const archivo = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'reporte_rentabilidad.csv';
    enlace.click();
    URL.revokeObjectURL(url);
  };

  if (cargando) {
    return (
      <div className="h-80 flex items-center justify-center text-claro-texto2 dark:text-oscuro-texto2">
        Cargando reporte de rentabilidad...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-claro-texto dark:text-oscuro-texto">
            Rentabilidad y Servicios
          </h2>
          <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2">
            Ingresos generados por los servicios contratados
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportarCSV}
            className="px-4 py-2 rounded-xl bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo text-sm font-medium transition-colors"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde">
          <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2">Ingresos por servicios</p>
          <p className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto mt-2">
            Bs {totalIngresos.toFixed(2)}
          </p>
        </div>
        <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde">
          <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2">Servicios contratados</p>
          <p className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto mt-2">{totalServicios}</p>
        </div>
        <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde">
          <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2">Mayor ingreso</p>
          <p className="text-lg font-bold text-claro-texto dark:text-oscuro-texto mt-2">
            {servicioMayorIngresos ? servicioMayorIngresos.servicio : '-'}
          </p>
        </div>
      </div>

      <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde">
        <h3 className="text-lg font-bold text-claro-texto dark:text-oscuro-texto mb-4">
          Detalle de servicios
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-claro-borde dark:border-oscuro-borde">
                <th className="text-left py-3 text-claro-texto2 dark:text-oscuro-texto2">Servicio</th>
                <th className="text-center py-3 text-claro-texto2 dark:text-oscuro-texto2">Cantidad</th>
                <th className="text-right py-3 text-claro-texto2 dark:text-oscuro-texto2">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((item) => (
                <tr key={item.servicio} className="border-b border-claro-borde dark:border-oscuro-borde">
                  <td className="py-3 text-claro-texto dark:text-oscuro-texto">{item.servicio}</td>
                  <td className="text-center py-3 text-claro-texto dark:text-oscuro-texto">{item.cantidad}</td>
                  <td className="text-right py-3 text-claro-texto dark:text-oscuro-texto">
                    Bs {item.ingresos.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};