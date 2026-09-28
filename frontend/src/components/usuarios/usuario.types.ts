/**
 * ============================================================================
 * ARCHIVO: usuario.types.ts
 * TIPOS COMPARTIDOS del módulo de usuarios.
 * ============================================================================
 */

// =====================================================
// ROLES Y ESTADOS
// =====================================================
export type Rol = 'Cliente' | 'Empleado' | 'Admin' | 'Administrador';
export type Estado = 'Activo' | 'Inactivo';
export type Turno = 'Mañana' | 'Tarde' | 'Noche';
export type NivelAcceso = 'Total' | 'Medio' | 'Bajo';

// =====================================================
// MODELO DE USUARIO (lo que devuelve el backend)
// =====================================================
export interface Usuario {
  id: number;
  nombre?: string;
  apellidos?: string;
  paterno?: string;
  materno?: string;
  correo?: string;
  telefono?: string;
  rol?: string;
  estado?: string;
  estado_cuenta?: string;
  ci_nit?: string | number | null;
  fecha_nacimiento?: string | null;
  calle?: string | null;
  zona?: string | null;
  ciudad?: string | null;
  fecha_contratacion?: string | null;
  cargo?: string | null;
  turno?: Turno | null;
  nivel_acceso?: NivelAcceso | null;
  [key: string]: unknown;
}

// =====================================================
// FORM DATA del modal
// =====================================================
export interface UsuarioFormData {
  nombre: string;
  paterno: string;
  materno: string;
  correo: string;
  telefono: string;
  contraseña: string;
  rol: Rol;
  estado: Estado;
  ci_nit: string;
  fecha_nacimiento: string;
  calle: string;
  zona: string;
  ciudad: string;
  fecha_contratacion: string;
  cargo: string;
  turno: Turno;
  nivel_acceso: NivelAcceso;
}

// =====================================================
// MODOS DE LA LISTA
// =====================================================
export type UsuarioListModo = 'app' | 'preview';

// =====================================================
// PROPS de la lista
// =====================================================
export interface UsuarioListProps {
  modo?: UsuarioListModo;
  title?: string;
  subtitle?: string;
}