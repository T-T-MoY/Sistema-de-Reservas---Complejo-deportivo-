/**
 * ============================================================================
 * ARCHIVO: ReportesPagosGrafica.tsx
 * COMPONENTE: Dona de métricas de pagos (reutilizable).
 *
 * PALETA: colores consistentes con el sistema para métodos de pago.
 * ============================================================================
 */

import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import type { MetodoPagoMetrica } from './reporte.types';

interface Props {
  data: MetodoPagoMetrica[];
  metrica: 'monto' | 'cantidad';
  titulo: string;
  subtitulo: string;
}

// Paleta fija por método de pago — coherente con el sistema
const COLORES_METODO: Record<string, string> = {
  qr: '#5DA797',        // verde sistema
  efectivo: '#8FC7B8',  // verde claro
  tarjeta: '#1C3034',   // oscuro profundo
  presencial: '#8FC7B8',
  transferencia: '#3B7B6D',
  default: '#6B7280',
};

export const DonaMetricas: React.FC<Props> = ({ data, metrica, titulo, subtitulo }) => {
  const dataFormateada = data.map((item) => ({
    id: item.id,
    label: item.label,
    value: item[metrica],
  }));

  const esMonto = metrica === 'monto';

  return (
    <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
      <div className="mb-2">
        <h3 className="text-base font-bold text-claro-texto dark:text-oscuro-texto">
          {titulo}
        </h3>
        <p className="text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2">
          {subtitulo}
        </p>
      </div>

      <div className="h-64 w-full">
        {dataFormateada.length > 0 ? (
          <ResponsivePie
            data={dataFormateada}
            margin={{ top: 20, right: 60, bottom: 20, left: 60 }}
            innerRadius={0.65}
            padAngle={2}
            cornerRadius={5}
            activeOuterRadiusOffset={6}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
            colors={({ id }) => COLORES_METODO[String(id)] || COLORES_METODO.default}
            enableArcLinkLabels={true}
            arcLinkLabel={(d) => `${d.id}`}
            arcLinkLabelsTextColor="currentColor"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor="#ffffff"
            valueFormat={(val) =>
              esMonto
                ? `Bs. ${Number(val).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`
                : `${val} transacciones`
            }
            theme={{
              text: { fontSize: 11, fill: 'currentColor' },
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
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2 font-medium">
              Sin datos para mostrar
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonaMetricas;