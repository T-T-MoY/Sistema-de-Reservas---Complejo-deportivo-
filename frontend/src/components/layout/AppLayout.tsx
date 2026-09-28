import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Header from './Header';

export default function AppLayout() {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const location = useLocation();

  // Cierra el sidebar móvil automáticamente al cambiar de ruta
  useEffect(() => {
    setSidebarAbierto(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-claro-fondo dark:bg-oscuro-fondo transition-colors duration-300 overflow-hidden">
      {/* Sidebar (fijo a la izquierda) */}
      <Navbar
        abierto={sidebarAbierto}
        onCerrar={() => setSidebarAbierto(false)}
      />

      {/* Columna derecha: Header arriba + contenido scrolleable */}
      <div className="flex-1 md:ml-64 flex flex-col overflow-hidden w-full">
        <Header onAbrirMenu={() => setSidebarAbierto(true)} />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}