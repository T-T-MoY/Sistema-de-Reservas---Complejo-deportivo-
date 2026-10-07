import { Request, Response } from "express";
import { ReportesModel } from "../models/reportes.model";

export const ReportesController = {
  // =====================================================
  // PAGOS / FINANZAS
  // =====================================================
  obtenerDatosPagos: async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin } = req.body;

      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          message: "Las fechas de inicio y fin son obligatorias.",
        });
      }

      const result = await ReportesModel.obtReportPagos(fechaInicio, fechaFin);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("Error en obtenerDatosPagos:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener los datos de pagos.",
      });
    }
  },

  obtenerMetricasPagos: async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin } = req.body;

      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          message: "Las fechas de inicio y fin son obligatorias.",
        });
      }

      const result = await ReportesModel.obtMetricasPagos(fechaInicio, fechaFin);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("Error en obtenerMetricasPagos:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener las métricas de pagos.",
      });
    }
  },

  obtenerDetallesPagos: async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin } = req.body;

      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          message: "Las fechas de inicio y fin son obligatorias.",
        });
      }

      const result = await ReportesModel.obtenerDetallesPagos(fechaInicio, fechaFin);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("Error en obtenerDetallesPagos:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener el detalle de pagos.",
      });
    }
  },

  // =====================================================
  // OCUPACIÓN / HEATMAP
  // =====================================================
  obtenerDatosOcupacion: async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin, idCancha } = req.body;

      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          message: "Las fechas de inicio y fin son obligatorias.",
        });
      }

      const result = await ReportesModel.obtDataHeatMap(fechaInicio, fechaFin, idCancha);
      const transformData = transformarANivoHeatmap(result);

      res.status(200).json({ success: true, data: transformData });
    } catch (error) {
      console.error("Error en obtenerDatosOcupacion:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener datos para el heatmap.",
      });
    }
  },

  listarCanchas: async (req: Request, res: Response) => {
    try {
      const result = await ReportesModel.listarCanchas();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("Error en listarCanchas:", error);
      res.status(500).json({
        success: false,
        message: "Error al listar las canchas registradas.",
      });
    }
  },

  obtenerTotalReservas: async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin, idCancha } = req.body;

      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          message: "Las fechas de inicio y fin son obligatorias.",
        });
      }

      const result = await ReportesModel.obtenerTotalReservas(
        fechaInicio,
        fechaFin,
        idCancha
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("Error en obtenerTotalReservas:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener el total de reservas.",
      });
    }
  },

  obtenerHorasOcupadas: async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin, idCancha } = req.body;

      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          message: "Las fechas de inicio y fin son obligatorias.",
        });
      }

      const result = await ReportesModel.obtenerHorasOcupadas(
        fechaInicio,
        fechaFin,
        idCancha
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("Error en obtenerHorasOcupadas:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener las horas ocupadas.",
      });
    }
  },

  obtenerMayorDemanda: async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin, idCancha } = req.body;

      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          message: "Las fechas de inicio y fin son obligatorias.",
        });
      }

      const result = await ReportesModel.obtenerMayorDemanda(
        fechaInicio,
        fechaFin,
        idCancha
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("Error en obtenerMayorDemanda:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener la mayor demanda.",
      });
    }
  },

  // =====================================================
  // RENTABILIDAD
  // =====================================================
  obtenerRentabilidadServicios: async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin } = req.body;

      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          message: "Las fechas de inicio y fin son obligatorias.",
        });
      }

      const result = await ReportesModel.obtenerRentabilidadServicios(
        fechaInicio,
        fechaFin
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("Error en obtenerRentabilidadServicios:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener la rentabilidad de servicios.",
      });
    }
  },

  // =====================================================
  // COMPORTAMIENTO DE USUARIOS
  // =====================================================
  obtenerComportamientoUsuarios: async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin } = req.body;

      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          message: "Las fechas de inicio y fin son obligatorias.",
        });
      }

      const result = await ReportesModel.obtenerComportamientoUsuarios(
        fechaInicio,
        fechaFin
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("Error en obtenerComportamientoUsuarios:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener el reporte de comportamiento de usuarios.",
      });
    }
  },

  // =====================================================
  // REPORTE DE USUARIOS (CON FILTROS)
  // =====================================================
  obtenerReporteUsuarios: async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin, tipoUsuario, estado, busqueda } = req.body;

      const result = await ReportesModel.obtenerReporteUsuarios(
        fechaInicio,
        fechaFin,
        tipoUsuario,
        estado,
        busqueda
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("Error en obtenerReporteUsuarios:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener el reporte de usuarios.",
      });
    }
  },

  // =====================================================
  // HISTORIAL CLIENTE
  // =====================================================
  obtenerHistorialCliente: async (req: Request, res: Response) => {
    try {
      const usuario = (req as any).usuario;

      if (!usuario?.id_usuario) {
        return res.status(401).json({
          success: false,
          message: "Usuario no autenticado.",
        });
      }

      const result = await ReportesModel.obtenerHistorialCliente(usuario.id_usuario);

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("Error en obtenerHistorialCliente:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener el historial de reservas.",
      });
    }
  },

  obtenerHistorialInscripciones: async (req: Request, res: Response) => {
    try {
      const usuario = (req as any).usuario;

      if (!usuario?.id_usuario) {
        return res.status(401).json({
          success: false,
          message: "Usuario no autenticado.",
        });
      }

      const result = await ReportesModel.obtenerHistorialInscripciones(
        usuario.id_usuario
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("Error en obtenerHistorialInscripciones:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener el historial de inscripciones.",
      });
    }
  },

  // =====================================================
  // EVENTOS Y SERVICIOS
  // =====================================================
  obtenerReporteEventosServicios: async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin } = req.body;

      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          message: "Las fechas de inicio y fin son obligatorias.",
        });
      }

      const result = await ReportesModel.obtenerReporteEventosServicios(
        fechaInicio,
        fechaFin
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("Error en obtenerReporteEventosServicios:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener el reporte de eventos y servicios.",
      });
    }
  },
};

// =====================================================
// HELPERS
// =====================================================
const transformarANivoHeatmap = (
  rows: { dia: string; hora: string; reservas: number }[]
) => {
  const diasMap = new Map<string, { x: string; y: number }[]>();

  rows.forEach((row) => {
    if (!diasMap.has(row.dia)) {
      diasMap.set(row.dia, []);
    }
    diasMap.get(row.dia)?.push({
      x: row.hora,
      y: row.reservas,
    });
  });

  return Array.from(diasMap.entries()).map(([dia, data]) => ({
    id: dia,
    data,
  }));
};