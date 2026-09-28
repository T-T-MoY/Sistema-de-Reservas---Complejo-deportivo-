/**
 * ============================================================================
 * ARCHIVO: UsuariosPage.tsx
 * PÁGINA: Panel de administración de usuarios (solo admin).
 * RUTA: /usuarios
 * ============================================================================
 */

import { UsuarioList } from '../components/usuarios/UsuarioList';

export default function UsuariosPage() {
  return <UsuarioList modo="app" />;
}