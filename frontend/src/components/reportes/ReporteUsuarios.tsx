/**
 * ============================================================================
 * ARCHIVO: ReporteUsuarios.tsx
 * COMPONENTE: Reporte de usuarios con filtros + dona + tabla + export.
 * Estilos con tokens del sistema (claro-* / oscuro-*).
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ResponsivePie } from '@nivo/pie';
import { reporteApi } from './reporte.api';
import type {
  UsuarioReporte,
  DistribucionUsuarios,
} from './reporte.types';

export const ReporteUsuarios: React.FC = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('todos');
  const [estado, setEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const [usuarios, setUsuarios] = useState<UsuarioReporte[]>([]);
  const [distribucion, setDistribucion] = useState<DistribucionUsuarios[]>([]);
  const [cargando, setCargando] = useState(false);

  const obtenerReporte = async () => {
    try {
      setCargando(true);
      const data = await reporteApi.reporteUsuarios({
        fechaInicio,
        fechaFin,
        tipoUsuario,
        estado,
        busqueda,
      });
      setUsuarios(data.usuarios || []);
      setDistribucion(data.distribucion || []);
    } catch (error) {
      console.error('Error al obtener reporte de usuarios:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerReporte();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const datosDona = distribucion.map((item) => ({
    id: item.tipo_usuario,
    label: item.tipo_usuario,
    value: Number(item.cantidad),
  }));

  const exportarExcel = () => {
    const datosExcel = usuarios.map((usuario) => ({
      Usuario: usuario.nombre_completo,
      Correo: usuario.correo,
      Teléfono: usuario.telefono,
      Tipo: usuario.tipo_usuario,
      Estado: usuario.estado_cuenta,
      'Fecha de registro': new Date(usuario.fecha_registro).toLocaleDateString('es-BO'),
    }));

    const hoja = XLSX.utils.json_to_sheet(datosExcel);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Usuarios');
    XLSX.writeFile(libro, 'reporte-usuarios.xlsx');
  };

  const exportarPDF = async () => {
    const elemento = document.getElementById('reporte-usuarios-pdf');
    if (!elemento) return;

    const canvas = await html2canvas(elemento, { scale: 2 });
    const imagen = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const ancho = 190;
    const alto = (canvas.height * ancho) / canvas.width;

    pdf.text('Reporte de Usuarios', 10, 10);
    pdf.addImage(imagen, 'PNG', 10, 15, ancho, alto);
    pdf.save('reporte-usuarios.pdf');
  };

  return (
    <div
      className="space-y-6 bg-claro-fondo dark:bg-oscuro-fondo p-6 rounded-2xl text-claro-texto dark:text-oscuro-texto"
      id="reporte-usuarios-pdf"
    >
      <h2 className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto">
        Reporte de Usuarios
      </h2>

      {/* ============================================ */}
      {/* FILTROS                                       */}
      {/* ============================================ */}
      <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
        <h3 className="text-lg font-bold text-claro-texto dark:text-oscuro-texto mb-4">
          Filtros
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
              Fecha desde
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
              Fecha hasta
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
              Tipo de usuario
            </label>
            <select
              value={tipoUsuario}
              onChange={(e) => setTipoUsuario(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40"
            >
              <option value="todos">Todos</option>
              <option value="Cliente">Cliente</option>
              <option value="Empleado">Empleado</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
              Estado
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40"
            >
              <option value="todos">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre, correo o teléfono"
              className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto placeholder-claro-texto2 dark:placeholder-oscuro-texto2 focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={obtenerReporte}
            disabled={cargando}
            className="px-5 py-2 rounded-lg bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo font-medium transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {cargando ? 'Generando...' : 'Aplicar filtros'}
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* DONA                                          */}
      {/* ============================================ */}
      <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
        <div className="mb-2">
          <h3 className="text-base font-bold text-claro-texto dark:text-oscuro-texto">
            Distribución de usuarios
          </h3>
          <p className="text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2">
            Usuarios según tipo
          </p>
        </div>

        <div className="h-72 w-full">
          {datosDona.length > 0 ? (
            <ResponsivePie
              data={datosDona}
              colors={['#1C3034', '#3B7B6D', '#5DA797']}
              margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
              innerRadius={0.65}
              padAngle={2}
              cornerRadius={5}
              activeOuterRadiusOffset={6}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              enableArcLinkLabels={true}
              arcLinkLabel={(d) => `${d.id}`}
              arcLinkLabelsTextColor="currentColor"
              arcLabelsSkipAngle={10}
              arcLabelsTextColor="#ffffff"
              valueFormat={(value) => `${value} usuarios`}
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

      {/* ============================================ */}
      {/* BOTONES EXPORT                                */}
      {/* ============================================ */}
      <div className="flex gap-3">
        <button
          onClick={exportarExcel}
          disabled={usuarios.length === 0}
          className="px-4 py-2 rounded-lg bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Exportar Excel
        </button>

        <button
          onClick={exportarPDF}
          disabled={usuarios.length === 0}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Exportar PDF
        </button>
      </div>

      {/* ============================================ */}
      {/* TABLA                                         */}
      {/* ============================================ */}
      <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-claro-texto dark:text-oscuro-texto">
              Usuarios encontrados
            </h3>
            <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2">
              Total: {usuarios.length} usuarios
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-claro-borde dark:border-oscuro-borde">
                <th className="text-left py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 font-semibold">
                  Usuario
                </th>
                <th className="text-left py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 font-semibold">
                  Correo
                </th>
                <th className="text-left py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 font-semibold">
                  Teléfono
                </th>
                <th className="text-left py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 font-semibold">
                  Tipo
                </th>
                <th className="text-left py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 font-semibold">
                  Estado
                </th>
                <th className="text-left py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2 font-semibold">
                  Fecha de registro
                </th>
              </tr>
            </thead>

            <tbody>
              {usuarios.length > 0 ? (
                usuarios.map((usuario) => (
                  <tr
                    key={usuario.id_usuario}
                    className="border-b border-claro-borde dark:border-oscuro-borde hover:bg-claro-fondo dark:hover:bg-oscuro-fondo/50 transition-colors"
                  >
                    <td className="py-3 px-3 text-claro-texto dark:text-oscuro-texto">
                      {usuario.nombre_completo}
                    </td>

                    <td className="py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2">
                      {usuario.correo}
                    </td>

                    <td className="py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2">
                      {usuario.telefono}
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-flex px-2.5 py-1 rounded-full bg-claro-tinte dark:bg-oscuro-tinte text-claro-primario dark:text-oscuro-primario font-medium text-xs">
                        {usuario.tipo_usuario}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={
                          usuario.estado_cuenta === 'Activo'
                            ? 'inline-flex px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium text-xs'
                            : 'inline-flex px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-medium text-xs'
                        }
                      >
                        {usuario.estado_cuenta}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-claro-texto2 dark:text-oscuro-texto2">
                      {new Date(usuario.fecha_registro).toLocaleDateString('es-BO')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-6 text-claro-texto2 dark:text-oscuro-texto2"
                  >
                    No se encontraron usuarios con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReporteUsuarios;