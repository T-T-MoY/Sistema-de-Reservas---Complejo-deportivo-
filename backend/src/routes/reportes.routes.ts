import { Router } from "express";
import { ReportesController } from "../controllers/reportes.controller";
import {
  esAdmin,
  esAdminOEmpleado,
  esCliente,
  verificarToken,
} from "../middlewares/authMiddleware";

const router = Router();

// =====================================================
// PAGOS / FINANZAS  (solo admin)
// =====================================================
router.post(
  "/pagos",
  [verificarToken, esAdmin],
  ReportesController.obtenerDatosPagos
);

router.post(
  "/metricasPagos",
  [verificarToken, esAdmin],
  ReportesController.obtenerMetricasPagos
);

router.post(
  "/detallesPagos",
  [verificarToken, esAdmin],
  ReportesController.obtenerDetallesPagos
);

// =====================================================
// OCUPACIÓN / HEATMAP  (solo admin)
// =====================================================
router.post(
  "/heatmap",
  [verificarToken, esAdmin],
  ReportesController.obtenerDatosOcupacion
);

router.get(
  "/listarCanchas",
  [verificarToken, esAdmin],
  ReportesController.listarCanchas
);

router.post(
  "/totalReservas",
  [verificarToken, esAdmin],
  ReportesController.obtenerTotalReservas
);

router.post(
  "/horasOcupadas",
  [verificarToken, esAdmin],
  ReportesController.obtenerHorasOcupadas
);

router.post(
  "/mayorDemanda",
  [verificarToken, esAdmin],
  ReportesController.obtenerMayorDemanda
);

// =====================================================
// RENTABILIDAD  (solo admin)
// =====================================================
router.post(
  "/rentabilidadServicios",
  [verificarToken, esAdmin],
  ReportesController.obtenerRentabilidadServicios
);

// =====================================================
// COMPORTAMIENTO DE USUARIOS  (solo admin)
// =====================================================
router.post(
  "/comportamiento-usuarios",
  [verificarToken, esAdmin],
  ReportesController.obtenerComportamientoUsuarios
);

// =====================================================
// REPORTE DE USUARIOS  (solo admin)
// =====================================================
router.post(
  "/usuarios",
  [verificarToken, esAdmin],
  ReportesController.obtenerReporteUsuarios
);

// =====================================================
// HISTORIAL DEL CLIENTE  (solo cliente autenticado)
// =====================================================
router.get(
  "/historial-cliente",
  [verificarToken, esCliente],
  ReportesController.obtenerHistorialCliente
);

router.get(
  "/historial-inscripciones",
  [verificarToken, esCliente],
  ReportesController.obtenerHistorialInscripciones
);

// =====================================================
// EVENTOS Y SERVICIOS  (admin y empleado)
// =====================================================
router.post(
  "/eventos-servicios",
  [verificarToken, esAdminOEmpleado],
  ReportesController.obtenerReporteEventosServicios
);

export default router;