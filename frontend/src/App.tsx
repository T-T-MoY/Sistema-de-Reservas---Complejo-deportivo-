/**
 * ============================================================================
 * ARCHIVO: App.tsx
 * PROPÓSITO: Configuración central de Rutas del Sistema de Reservas
 * ============================================================================
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';

// Guard de rutas privadas
import RutasProtegidas from './components/RutasProtegidas';

// Páginas
import Home from './pages/Home';
import CanchasPage from './pages/CanchasPage';
import Login from './pages/Login';
import Registro from './pages/Registro';
import UsuariosPage from './pages/UsuariosPage';
import Perfil from './pages/Perfil';
import Dashboard from './pages/Dashboard';
import SolicitarRecuperacion from './pages/SolicitarRecuperacion';
import ResetPassword from './pages/ResetPassword';
import MisReservas from './pages/MisReservas';
import GestionReservas from './pages/GestionReservas';
import VerificarPagos from './pages/VerificarPagos';
import DisponibilidadCancha from './pages/DisponibilidadCancha';
import EventosPage from './pages/EventosPage';
import GestionEventos from './pages/GestionEventos';
import MisInscripciones from './pages/MisInscripciones';
import ReportesPage from './pages/ReportesPage';                 // ← corregido

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. PÚBLICO (LandingNavbar + Footer) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* 2. AUTH (pantalla completa, sin chrome) */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/solicitar-recuperacion" element={<SolicitarRecuperacion />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 3. PRIVADO (Navbar sidebar + Header) */}
        <Route element={<RutasProtegidas />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/perfil" element={<Perfil />} />

            <Route path="/canchas" element={<CanchasPage />} />
            <Route path="/canchas/:id/reservar" element={<DisponibilidadCancha />} />

            <Route path="/usuarios" element={<UsuariosPage />} />

            <Route path="/reservas" element={<MisReservas />} />
            <Route path="/gestion-reservas" element={<GestionReservas />} />
            <Route path="/verificar-pagos" element={<VerificarPagos />} />

            <Route path="/eventos" element={<EventosPage />} />
            <Route path="/mis-inscripciones" element={<MisInscripciones />} />
            <Route path="/gestion-eventos" element={<GestionEventos />} />

            <Route path="/reportes" element={<ReportesPage />} />   {/* ← corregido */}
          </Route>
        </Route>

        {/* 4. Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;