import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guard de rutas privadas.
 * - Si no hay sesión → redirige a /login.
 * - Si hay sesión → renderiza <Outlet /> y deja que el layout
 *   (AppLayout) se encargue del chrome (Navbar + Header).
 */
const RutasProtegidas = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default RutasProtegidas;