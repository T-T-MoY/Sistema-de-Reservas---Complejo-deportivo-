/**
 * ============================================================================
 * ARCHIVO: ReporteTabs.tsx
 * COMPONENTE: Contenedor con tabs + filtro de fechas + renderizado de reportes.
 *
 * INCLUYE:
 * - Manejo de roles: cliente / empleado / administrador.
 * - Vista cliente: "Mis Reservas" / "Mis Inscripciones".
 * - Vista empleado: "Reportes de canchas" / "Eventos y servicios".
 * - Vista admin: tabs principales + menú "Más" desplegable.
 * - Estilos con tokens del sistema (claro-* / oscuro-*).
 * ============================================================================
 */

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { defaultRangeDate } from '../../utils/formatDate';
import { useAuth } from '../../context/AuthContext';
import { reporteApi } from './reporte.api';
import { DonaMetricas } from './ReportesPagosGrafica';
import { MapaOcupacionCanchas } from './ReportesHeatMap';
import { ReportesRentabilidad } from './ReportesRentabilidad';
import { ReporteComportamiento } from './ReportesComportamiento';
import { ReporteUsuarios } from './ReporteUsuarios';
import { ReporteCanchas } from './ReporteCanchas';
import { ReporteEventosServicios } from './ReporteEventosServicios';
import { DetallesPagosTabla } from './DetallesPagosTabla';
import { HistorialReservasCliente } from './HistorialReservasCliente';
import { HistorialInscripcionesCliente } from './HistorialInscripcionesCliente';
import type {
  ReportPagos,
  MetodoPagoMetrica,
  ReporteTab,
  ReporteTabCliente,
} from './reporte.types';

export const ReporteTabs = () => {
  const { usuario } = useAuth();
  const [searchParams] = useSearchParams();

  const rolLower = (usuario?.rol || '').toLowerCase();
  const esEmpleado = rolLower === 'empleado';
  const esAdministrador =
    rolLower === 'administrador' || rolLower === 'admin';
  const esCliente = rolLower === 'cliente';

  // =====================================================
  // ESTADO GLOBAL DE FECHAS
  // =====================================================
  const defaultRange = useMemo(() => defaultRangeDate(), []);
  const [fechaInicio, setFechaInicio] = useState<string>(defaultRange.fechaInicio);
  const [fechaFin, setFechaFin] = useState<string>(defaultRange.fechaFin);

  // =====================================================
  // DATA FINANZAS (solo admin)
  // =====================================================
  const [dataPagos, setDataPagos] = useState<ReportPagos[]>([]);
  const [dataMetricasPagos, setDataMetricasPagos] = useState<MetodoPagoMetrica[]>([]);

  useEffect(() => {
    if (!esAdministrador) return;
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
  }, [fechaInicio, fechaFin, esAdministrador]);

  // =====================================================
  // PESTAÑA DEL CLIENTE
  // =====================================================
  const [pestanaCliente, setPestanaCliente] = useState<ReporteTabCliente>('reservas');

  // =====================================================
  // TAB ACTIVA (admin / empleado)
  // =====================================================
  const [tabActive, setTabActive] = useState<ReporteTab>(() => {
    const tab = searchParams.get('tab') as ReporteTab | null;

    if (esEmpleado) {
      if (tab === 'canchas' || tab === 'eventos-servicios') return tab;
      return 'canchas';
    }

    if (esAdministrador) {
      const validas: ReporteTab[] = [
        'ocupacion',
        'finanzas',
        'rentabilidad',
        'usuarios',
        'canchas',
        'eventos-servicios',
      ];
      if (tab && validas.includes(tab)) return tab;
      return 'usuarios';
    }

    return 'usuarios';
  });

  const [menuMasAbierto, setMenuMasAbierto] = useState(false);

  const esTabSecundario = ['ocupacion', 'finanzas', 'rentabilidad'].includes(tabActive);

  // =====================================================
  // RENDER: VISTA CLIENTE
  // =====================================================
  if (esCliente) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-claro-texto dark:text-oscuro-texto">
            Mi Historial
          </h1>
          <p className="text-claro-texto2 dark:text-oscuro-texto2 mt-1">
            Consulta tu historial de reservas e inscripciones.
          </p>
        </div>

        <div className="flex border-b border-claro-borde dark:border-oscuro-borde">
          <div className="flex gap-2">
            <button
              onClick={() => setPestanaCliente('reservas')}
              className={`px-6 py-3 font-medium rounded-xl transition-colors ${
                pestanaCliente === 'reservas'
                  ? 'bg-claro-primario dark:bg-oscuro-primario text-white dark:text-oscuro-fondo shadow-sm'
                  : 'text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-primario dark:hover:text-oscuro-primario hover:bg-claro-tinte dark:hover:bg-oscuro-tinte'
              }`}
            >
              📅 Mis Reservas
            </button>

            <button
              onClick={() => setPestanaCliente('inscripciones')}
              className={`px-6 py-3 font-medium rounded-xl transition-colors ${
                pestanaCliente === 'inscripciones'
                  ? 'bg-claro-primario dark:bg-oscuro-primario text-white dark:text-oscuro-fondo shadow-sm'
                  : 'text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-primario dark:hover:text-oscuro-primario hover:bg-claro-tinte dark:hover:bg-oscuro-tinte'
              }`}
            >
              🏆 Mis Inscripciones
            </button>
          </div>
        </div>

        <div>
          {pestanaCliente === 'reservas' && <HistorialReservasCliente />}
          {pestanaCliente === 'inscripciones' && <HistorialInscripcionesCliente />}
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER: VISTA ADMIN / EMPLEADO
  // =====================================================
  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* FILTRO DE FECHAS                              */}
      {/* ============================================ */}
      <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">
              Rango de fechas
            </p>
            <h3 className="text-xl font-bold text-claro-texto dark:text-oscuro-texto mt-1">
              Filtrar reportes
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto text-sm px-3 py-2 rounded-xl border border-claro-borde dark:border-oscuro-borde focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40 cursor-pointer"
            />
            <span className="hidden sm:inline text-claro-texto2 dark:text-oscuro-texto2 text-sm font-medium">
              a
            </span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto text-sm px-3 py-2 rounded-xl border border-claro-borde dark:border-oscuro-borde focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* TABS                                          */}
      {/* ============================================ */}
      <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-2 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
        <div className="flex flex-wrap items-center gap-2">
          {/* Reportes de Usuarios (solo admin) */}
          {esAdministrador && (
            <button
              onClick={() => setTabActive('usuarios')}
              className={`flex-1 sm:flex-initial text-sm font-medium px-5 py-2.5 rounded-xl transition-colors ${
                tabActive === 'usuarios'
                  ? 'bg-claro-primario dark:bg-oscuro-primario text-white dark:text-oscuro-fondo shadow-sm'
                  : 'text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-primario dark:hover:text-oscuro-primario hover:bg-claro-tinte dark:hover:bg-oscuro-tinte'
              }`}
            >
              Reportes de usuarios
            </button>
          )}

          {/* Reportes de Canchas (admin y empleado) */}
          <button
            onClick={() => setTabActive('canchas')}
            className={`flex-1 sm:flex-initial text-sm font-medium px-5 py-2.5 rounded-xl transition-colors ${
              tabActive === 'canchas'
                ? 'bg-claro-primario dark:bg-oscuro-primario text-white dark:text-oscuro-fondo shadow-sm'
                : 'text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-primario dark:hover:text-oscuro-primario hover:bg-claro-tinte dark:hover:bg-oscuro-tinte'
            }`}
          >
            Reportes de canchas
          </button>

          {/* Eventos y Servicios (admin y empleado) */}
          <button
            onClick={() => setTabActive('eventos-servicios')}
            className={`flex-1 sm:flex-initial text-sm font-medium px-5 py-2.5 rounded-xl transition-colors ${
              tabActive === 'eventos-servicios'
                ? 'bg-claro-primario dark:bg-oscuro-primario text-white dark:text-oscuro-fondo shadow-sm'
                : 'text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-primario dark:hover:text-oscuro-primario hover:bg-claro-tinte dark:hover:bg-oscuro-tinte'
            }`}
          >
            Reporte de eventos y servicios
          </button>

          {/* Menú "Más" (solo admin) */}
          {esAdministrador && (
            <div className="relative flex-1 sm:flex-initial">
              <button
                onClick={() => setMenuMasAbierto(!menuMasAbierto)}
                className={`w-full sm:w-auto text-sm font-medium px-5 py-2.5 rounded-xl transition-colors flex items-center justify-between gap-2 ${
                  esTabSecundario
                    ? 'bg-claro-primario dark:bg-oscuro-primario text-white dark:text-oscuro-fondo shadow-sm'
                    : 'text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-primario dark:hover:text-oscuro-primario hover:bg-claro-tinte dark:hover:bg-oscuro-tinte'
                }`}
              >
                <span>
                  {tabActive === 'ocupacion'
                    ? 'Reporte ocupacional'
                    : tabActive === 'finanzas'
                    ? 'Reporte de finanzas'
                    : tabActive === 'rentabilidad'
                    ? 'Rentabilidad'
                    : 'Más'}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    menuMasAbierto ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {menuMasAbierto && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-xl shadow-lg z-20 py-1"
                  onMouseLeave={() => setMenuMasAbierto(false)}
                >
                  <button
                    onClick={() => {
                      setTabActive('ocupacion');
                      setMenuMasAbierto(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors rounded-lg mx-1 ${
                      tabActive === 'ocupacion'
                        ? 'bg-claro-tinte dark:bg-oscuro-tinte text-claro-primario dark:text-oscuro-primario font-semibold'
                        : 'text-claro-texto dark:text-oscuro-texto hover:bg-claro-fondo dark:hover:bg-oscuro-fondo'
                    }`}
                  >
                    Reporte ocupacional
                  </button>

                  <button
                    onClick={() => {
                      setTabActive('finanzas');
                      setMenuMasAbierto(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors rounded-lg mx-1 ${
                      tabActive === 'finanzas'
                        ? 'bg-claro-tinte dark:bg-oscuro-tinte text-claro-primario dark:text-oscuro-primario font-semibold'
                        : 'text-claro-texto dark:text-oscuro-texto hover:bg-claro-fondo dark:hover:bg-oscuro-fondo'
                    }`}
                  >
                    Reporte de finanzas
                  </button>

                  <button
                    onClick={() => {
                      setTabActive('rentabilidad');
                      setMenuMasAbierto(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors rounded-lg mx-1 ${
                      tabActive === 'rentabilidad'
                        ? 'bg-claro-tinte dark:bg-oscuro-tinte text-claro-primario dark:text-oscuro-primario font-semibold'
                        : 'text-claro-texto dark:text-oscuro-texto hover:bg-claro-fondo dark:hover:bg-oscuro-fondo'
                    }`}
                  >
                    Rentabilidad
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* CONTENIDO SEGÚN TAB                           */}
      {/* ============================================ */}

      {/* Reportes de Usuarios */}
      {tabActive === 'usuarios' && esAdministrador && <ReporteUsuarios />}

      {/* Reportes de Canchas */}
      {tabActive === 'canchas' && <ReporteCanchas />}

      {/* Eventos y Servicios */}
      {tabActive === 'eventos-servicios' && (
        <ReporteEventosServicios fechaInicio={fechaInicio} fechaFin={fechaFin} />
      )}

      {/* Reporte ocupacional (HeatMap) */}
      {tabActive === 'ocupacion' && (
        <MapaOcupacionCanchas fechaInicio={fechaInicio} fechaFin={fechaFin} />
      )}

      {/* Reporte de Finanzas */}
      {tabActive === 'finanzas' &&
        (dataPagos && dataPagos.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {dataPagos.map((item) => (
                <div
                  key={item.estado}
                  className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors"
                >
                  <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">
                    {item.estado}
                  </p>
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

            <DetallesPagosTabla fechaInicio={fechaInicio} fechaFin={fechaFin} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl border border-claro-borde dark:border-oscuro-borde">
            <div className="w-12 h-12 mb-3 rounded-full bg-claro-borde/30 dark:bg-oscuro-borde/30 flex items-center justify-center text-claro-texto2 dark:text-oscuro-texto2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 14l2-2 4 4m4-7a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-claro-texto dark:text-oscuro-texto">
              No hay datos disponibles
            </h4>
            <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2 mt-1">
              No se encontraron registros de pagos o finanzas para el rango de fechas seleccionado.
            </p>
          </div>
        ))}

      {/* Rentabilidad */}
      {tabActive === 'rentabilidad' && (
        <ReportesRentabilidad fechaInicio={fechaInicio} fechaFin={fechaFin} />
      )}
    </div>
  );
};

export default ReporteTabs;