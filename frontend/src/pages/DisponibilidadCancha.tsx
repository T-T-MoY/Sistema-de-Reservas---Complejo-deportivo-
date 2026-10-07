import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canchaApi } from '../components/canchas/cancha.api';
import type { Cancha } from '../components/canchas/cancha.types';
import api from '../services/api';
import ModalPago from '../components/pagos/ModalPago';
import { SERVICIOS_ADICIONALES } from '../data/serviciosAdicionales';
import type { PagoDetalle } from '../components/pagos/pago.types';
import { guardarAdicionalesReserva } from '../utils/reservaExtras';

interface ReservaAgenda {
    id_reserva: number;
    fecha_reserva: string;
    hora_inicio: string;
    hora_fin: string;
    estado: string;
}

const HORARIOS: [string, string][] = [
    ['09:00', '10:00'], ['10:00', '11:00'], ['11:00', '12:00'],
    ['12:00', '13:00'], ['15:00', '16:00'], ['16:00', '17:00'],
    ['17:00', '18:00'], ['18:00', '19:00'], ['19:00', '20:00'], ['20:00', '21:00']
];

const fechaClave = (fecha: Date) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const mesClave = (fecha: Date) => fechaClave(new Date(fecha.getFullYear(), fecha.getMonth(), 1)).slice(0, 7);

const DisponibilidadCancha = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const esAdmin = Boolean(usuario && (usuario.rol === 'Admin' || usuario.rol === 'Administrador'));
    const [cancha, setCancha] = useState<Cancha | null>(null);
    const [mes, setMes] = useState(() => new Date());
    const [fechaSeleccionada, setFechaSeleccionada] = useState(fechaClave(new Date()));
    const [clientes, setClientes] = useState<any[]>([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState('');
    const [reservasMes, setReservasMes] = useState<ReservaAgenda[]>([]);
    const [reservasDia, setReservasDia] = useState<ReservaAgenda[]>([]);
    const [horasSeleccionadas, setHorasSeleccionadas] = useState<number[]>([]);
    const [mensajeHorario, setMensajeHorario] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [adicionalesSeleccionados, setAdicionalesSeleccionados] = useState<Record<string, boolean>>({});
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [reservaPago, setReservaPago] = useState<any | null>(null);
    const [reservaCreada, setReservaCreada] = useState<number | null>(null);

    const cargarMes = async () => {
        if (!id) return;
        try {
            const response = await api.get(`/canchas/${id}/reservas?mes=${mesClave(mes)}`);
            setReservasMes(response.data?.data || []);
        } catch {
            setError('No se pudo consultar la disponibilidad del mes.');
        }
    };

    const cargarDia = async () => {
        if (!id) return;
        try {
            const response = await api.get(`/canchas/${id}/reservas?fecha=${fechaSeleccionada}`);
            setReservasDia(response.data?.data || []);
        } catch {
            setError('No se pudo consultar la disponibilidad del día.');
        }
    };

    useEffect(() => {
        const cargar = async () => {
            if (!id) return;
            setCargando(true);
            const datos = await canchaApi.getById(Number(id));
            setCancha(datos);
            setCargando(false);
        };
        cargar();
    }, [id]);

    useEffect(() => {
        const cargarClientes = async () => {
            if (!esAdmin) return;
            try {
                const response = await api.get('/usuarios');
                const usuarios = response.data?.data || response.data || [];
                const clientesFiltrados = (Array.isArray(usuarios) ? usuarios : []).filter((usuarioActual) => {
                    const rol = String(usuarioActual.rol || '').trim().toLowerCase();
                    return rol === 'cliente';
                });
                setClientes(clientesFiltrados);
                if (clientesFiltrados.length > 0) {
                    setClienteSeleccionado(String(clientesFiltrados[0].id_cliente ?? clientesFiltrados[0].id_usuario ?? clientesFiltrados[0].id));
                }
            } catch {
                setClientes([]);
            }
        };
        cargarClientes();
    }, [esAdmin]);

    useEffect(() => { cargarMes(); }, [id, mes]);
    useEffect(() => {
        setHorasSeleccionadas([]);
        setMensajeHorario('');
        cargarDia();
    }, [id, fechaSeleccionada]);

    const diasCalendario = useMemo(() => {
        const inicio = new Date(mes.getFullYear(), mes.getMonth(), 1);
        const primerDia = (inicio.getDay() + 6) % 7;
        const dias = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
        return Array.from({ length: Math.ceil((primerDia + dias) / 7) * 7 }, (_, indice) => {
            const numero = indice - primerDia + 1;
            return numero < 1 || numero > dias ? null : new Date(mes.getFullYear(), mes.getMonth(), numero);
        });
    }, [mes]);

    const reservasPorDia = useMemo(() => reservasMes.reduce<Record<string, number>>((conteo, reserva) => {
        const clave = reserva.fecha_reserva.slice(0, 10);
        conteo[clave] = (conteo[clave] || 0) + 1;
        return conteo;
    }, {}), [reservasMes]);

    const estaOcupado = (inicio: string, fin: string) => reservasDia.some((reserva) => {
        const reservaInicio = reserva.hora_inicio.slice(0, 5);
        const reservaFin = reserva.hora_fin.slice(0, 5);
        return reservaInicio < fin && reservaFin > inicio;
    });

    const esContinuo = (indices: number[]) => indices.every((indice, posicion) => {
        if (posicion === 0) return true;
        return HORARIOS[indice - 1][1] === HORARIOS[indice][0];
    });

    const seleccionarHorario = (indice: number) => {
        setMensajeHorario('');
        if (estaOcupado(...HORARIOS[indice])) return;

        if (horasSeleccionadas.length > 1) {
            setHorasSeleccionadas(horasSeleccionadas.includes(indice) ? [] : [indice]);
            return;
        }

        if (horasSeleccionadas.length === 1 && horasSeleccionadas[0] === indice) {
            setHorasSeleccionadas([]);
            return;
        }

        if (horasSeleccionadas.length === 0) {
            setHorasSeleccionadas([indice]);
            return;
        }

        const inicio = Math.min(horasSeleccionadas[0], indice);
        const fin = Math.max(horasSeleccionadas[0], indice);
        const rango = Array.from({ length: fin - inicio + 1 }, (_, offset) => inicio + offset);
        if (rango.length > 3) {
            setMensajeHorario('Puedes reservar como máximo 3 horas seguidas.');
            return;
        }
        if (!esContinuo(rango)) {
            setMensajeHorario('Las horas seleccionadas deben ser consecutivas, sin espacios entre ellas.');
            return;
        }
        if (rango.some((slot) => estaOcupado(...HORARIOS[slot]))) {
            setMensajeHorario('Uno de los horarios del rango ya está reservado. Elige otro bloque.');
            return;
        }
        setHorasSeleccionadas(rango);
    };

    const horaSeleccionada: [string, string] | null = horasSeleccionadas.length
        ? [HORARIOS[horasSeleccionadas[0]][0], HORARIOS[horasSeleccionadas[horasSeleccionadas.length - 1]][1]]
        : null;

    const detallesAdicionales = useMemo<PagoDetalle[]>(() => SERVICIOS_ADICIONALES
        .filter((servicio) => adicionalesSeleccionados[servicio.nombre])
        .map((servicio) => ({
            nombre: servicio.nombre,
            tipo: servicio.tipo,
            cantidad: 1,
            precio_unitario: servicio.precio,
            subtotal: servicio.precio
        })), [adicionalesSeleccionados]);

    const subtotalAdicionales = detallesAdicionales.reduce((total, detalle) => total + detalle.subtotal, 0);
    const subtotalReserva = Number(cancha?.precio_hora || 0) * horasSeleccionadas.length;
    const totalReserva = subtotalReserva + subtotalAdicionales;

    const hoy = fechaClave(new Date());
    const cambiarMes = (salto: number) => {
        const nuevoMes = new Date(mes.getFullYear(), mes.getMonth() + salto, 1);
        setMes(nuevoMes);
        setFechaSeleccionada(fechaClave(nuevoMes));
    };

    const crearReserva = async () => {
        if (!cancha || !horaSeleccionada) return;
        if (esAdmin && !clienteSeleccionado) {
            setError('Selecciona un cliente antes de confirmar la reserva como administrador.');
            return;
        }
        setError('');
        setGuardando(true);
        try {
            const payload: any = {
                id_cancha: cancha.id_cancha,
                fecha_reserva: fechaSeleccionada,
                hora_inicio: horaSeleccionada[0],
                hora_fin: horaSeleccionada[1],
                observaciones: observaciones.trim() || undefined
            };

            if (esAdmin) {
                payload.id_cliente = Number(clienteSeleccionado);
            }

            const response = await api.post('/reservas', payload);
            const reserva = response.data?.data;
            if (!reserva?.id_reserva) throw new Error('El backend no devolvió el ID de la reserva');
            setReservaPago({
                ...reserva,
                cancha_nombre: cancha.nombre,
                precio_hora: cancha.precio_hora,
                detallesIniciales: detallesAdicionales
            });
            setReservaCreada(reserva.id_reserva);
            guardarAdicionalesReserva(reserva.id_reserva, detallesAdicionales);
            await cargarMes();
            await cargarDia();
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.error || 'El horario ya fue reservado. Elige otro.');
            await cargarMes();
            await cargarDia();
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) {
        return (
            <div className="mx-auto max-w-6xl p-8 text-center text-claro-texto2 dark:text-oscuro-texto2">
                Cargando cancha y disponibilidad...
            </div>
        );
    }
    if (!cancha) {
        return (
            <div className="mx-auto max-w-6xl p-8 text-center text-claro-texto2 dark:text-oscuro-texto2">
                No se encontró la cancha.
            </div>
        );
    }

    const nombreMes = mes.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    return (
        <div className="mx-auto max-w-6xl space-y-6 pb-8">
            {/* Botón volver */}
            <button
                type="button"
                onClick={() => navigate('/canchas')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-claro-primario dark:text-oscuro-primario transition hover:gap-3"
            >
                ← Volver a canchas
            </button>

            {/* ============================================ */}
            {/* HEADER DE LA CANCHA — con tokens del sistema   */}
            {/* ============================================ */}
            <header className="overflow-hidden rounded-3xl p-6 shadow-xl md:p-8 bg-oscuro-tarjeta dark:bg-oscuro-tarjeta bg-gradient-to-br from-oscuro-fondo via-oscuro-tarjeta to-oscuro-tinte text-white">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-oscuro-primario">
                            Reserva en línea · disponibilidad en vivo
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-white">
                            {cancha.nombre}
                        </h1>
                        <p className="mt-2 text-oscuro-texto2">
                            {cancha.disciplina} · {cancha.ubicacion || 'Sector principal'}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-oscuro-borde bg-oscuro-fondo/40 px-5 py-4 backdrop-blur">
                        <p className="text-xs uppercase tracking-wider text-oscuro-texto2">Tarifa</p>
                        <p className="mt-1 text-2xl font-bold text-white">
                            Bs. {Number(cancha.precio_hora).toFixed(2)}{' '}
                            <span className="text-sm font-normal text-oscuro-texto2">/ hora</span>
                        </p>
                    </div>
                </div>
            </header>

            {error && (
                <div className="rounded-lg p-3 text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                    {error}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                {/* ============================================ */}
                {/* CALENDARIO                                     */}
                {/* ============================================ */}
                <section className="rounded-3xl border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 shadow-sm md:p-6 transition-colors">
                    <div className="mb-4 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => cambiarMes(-1)}
                            aria-label="Mes anterior"
                            className="rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta px-3 py-2 text-claro-texto dark:text-oscuro-texto hover:border-claro-primario dark:hover:border-oscuro-primario transition-colors"
                        >
                            ←
                        </button>
                        <h2 className="text-lg font-semibold capitalize text-claro-texto dark:text-oscuro-texto">
                            {nombreMes}
                        </h2>
                        <button
                            type="button"
                            onClick={() => cambiarMes(1)}
                            aria-label="Mes siguiente"
                            className="rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta px-3 py-2 text-claro-texto dark:text-oscuro-texto hover:border-claro-primario dark:hover:border-oscuro-primario transition-colors"
                        >
                            →
                        </button>
                    </div>

                    <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold uppercase text-claro-texto2 dark:text-oscuro-texto2">
                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia) => (
                            <span key={dia} className="p-2">{dia}</span>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {diasCalendario.map((dia, indice) => {
                            if (!dia) return <span key={`vacio-${indice}`} className="min-h-16" />;
                            const clave = fechaClave(dia);
                            const cantidad = reservasPorDia[clave] || 0;
                            const pasado = clave < hoy;
                            const esSeleccionado = fechaSeleccionada === clave;
                            return (
                                <button
                                    key={clave}
                                    type="button"
                                    disabled={pasado}
                                    onClick={() => setFechaSeleccionada(clave)}
                                    className={`min-h-16 rounded-lg border p-2 text-left transition-colors
                                        ${esSeleccionado
                                            ? 'border-claro-primario dark:border-oscuro-primario bg-claro-primario/10 dark:bg-oscuro-primario/10'
                                            : 'border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta hover:border-claro-primario dark:hover:border-oscuro-primario'
                                        }
                                        ${pasado ? 'cursor-not-allowed opacity-40' : ''}`}
                                >
                                    <span className="text-sm font-semibold text-claro-texto dark:text-oscuro-texto">
                                        {dia.getDate()}
                                    </span>
                                    <span
                                        className={`mt-2 block text-xs font-medium ${
                                            cantidad
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-green-600 dark:text-green-400'
                                        }`}
                                    >
                                        {cantidad ? `● ${cantidad} reserv.` : '● Libre'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* ============================================ */}
                {/* PANEL DE HORARIOS                             */}
                {/* ============================================ */}
                <section className="rounded-3xl border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 shadow-sm md:p-6 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-claro-primario dark:text-oscuro-primario">
                                Paso 1 · Horario
                            </p>
                            <h2 className="mt-1 text-lg font-semibold text-claro-texto dark:text-oscuro-texto">
                                Elige hasta 3 horas seguidas
                            </h2>
                            <p className="mt-1 text-sm text-claro-texto2 dark:text-oscuro-texto2">
                                {new Date(`${fechaSeleccionada}T12:00:00`).toLocaleDateString('es-ES')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-claro-primario/10 dark:bg-oscuro-primario/10 px-3 py-1 text-xs font-semibold text-claro-primario dark:text-oscuro-primario">
                                {horasSeleccionadas.length}/3 horas
                            </span>
                            {horasSeleccionadas.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => { setHorasSeleccionadas([]); setMensajeHorario(''); }}
                                    className="text-xs font-semibold text-claro-texto2 dark:text-oscuro-texto2 underline decoration-dotted underline-offset-2 hover:text-claro-primario dark:hover:text-oscuro-primario"
                                >
                                    Limpiar
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {HORARIOS.map(([inicio, fin], indice) => {
                            const ocupado = estaOcupado(inicio, fin);
                            const seleccionado = horasSeleccionadas.includes(indice);
                            const clases = ocupado
                                ? 'cursor-not-allowed border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                : seleccionado
                                ? 'border-claro-primario dark:border-oscuro-primario bg-claro-primario dark:bg-oscuro-primario text-white dark:text-oscuro-fondo shadow-md'
                                : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:-translate-y-0.5 hover:border-green-400 dark:hover:border-green-600';

                            return (
                                <button
                                    key={inicio}
                                    type="button"
                                    disabled={ocupado}
                                    onClick={() => seleccionarHorario(indice)}
                                    className={`group flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${clases}`}
                                >
                                    <span className="font-medium">{inicio} - {fin}</span>
                                    <span className="text-xs font-semibold">
                                        {ocupado ? 'Reservada' : seleccionado ? 'Seleccionada' : 'Disponible'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {mensajeHorario && (
                        <p className="mt-3 rounded-xl p-3 text-sm font-medium bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/40">
                            {mensajeHorario}
                        </p>
                    )}
                </section>
            </div>

            {/* ============================================ */}
            {/* PASO 2 · CONFIRMACIÓN                         */}
            {/* ============================================ */}
            <section className="rounded-3xl border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 shadow-sm md:p-6 transition-colors">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-claro-primario dark:text-oscuro-primario">
                            Paso 2 · Confirmación
                        </p>
                        <h2 className="mt-1 text-lg font-semibold text-claro-texto dark:text-oscuro-texto">
                            Resumen de reserva
                        </h2>
                    </div>
                    <span className="text-lg font-bold text-claro-primario dark:text-oscuro-primario">
                        {horasSeleccionadas.length ? `Bs. ${totalReserva.toFixed(2)}` : 'Selecciona un horario'}
                    </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                    <div>
                        <p className="text-xs text-claro-texto2 dark:text-oscuro-texto2">Cancha</p>
                        <p className="font-medium text-claro-texto dark:text-oscuro-texto">{cancha.nombre}</p>
                    </div>
                    <div>
                        <p className="text-xs text-claro-texto2 dark:text-oscuro-texto2">Fecha</p>
                        <p className="font-medium text-claro-texto dark:text-oscuro-texto">
                            {new Date(`${fechaSeleccionada}T12:00:00`).toLocaleDateString('es-ES')}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-claro-texto2 dark:text-oscuro-texto2">Horario</p>
                        <p className="font-medium text-claro-texto dark:text-oscuro-texto">
                            {horaSeleccionada ? `${horaSeleccionada[0]} - ${horaSeleccionada[1]}` : 'Selecciona un horario'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-claro-texto2 dark:text-oscuro-texto2">Precio base</p>
                        <p className="font-medium text-claro-texto dark:text-oscuro-texto">
                            Bs. {Number(cancha.precio_hora).toFixed(2)} / hora
                        </p>
                    </div>
                </div>

                {esAdmin && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-claro-texto dark:text-oscuro-texto">
                            Cliente asociado *
                        </label>
                        <select
                            value={clienteSeleccionado}
                            onChange={(event) => setClienteSeleccionado(event.target.value)}
                            className="mt-1 w-full rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo p-3 text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40"
                        >
                            <option value="">Seleccione un cliente</option>
                            {clientes.map((cliente) => {
                                const idCliente = cliente.id_cliente ?? cliente.id_usuario ?? cliente.id;
                                const nombreCompleto = `${cliente.nombre || ''} ${cliente.paterno || cliente.apellido_paterno || cliente.apellidoPaterno || ''}`.trim();
                                return (
                                    <option key={idCliente} value={String(idCliente)}>
                                        {nombreCompleto || cliente.correo || `Cliente #${idCliente}`}
                                    </option>
                                );
                            })}
                        </select>
                        {clientes.length === 0 && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                No se encontraron clientes disponibles.
                            </p>
                        )}
                    </div>
                )}

                <label className="mt-4 block text-sm font-medium text-claro-texto dark:text-oscuro-texto">
                    Observaciones
                    <textarea
                        value={observaciones}
                        onChange={(event) => setObservaciones(event.target.value)}
                        rows={2}
                        placeholder="Indica alguna necesidad para tu reserva"
                        className="mt-1 w-full rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo p-3 text-claro-texto dark:text-oscuro-texto placeholder-claro-texto2 dark:placeholder-oscuro-texto2 resize-none focus:outline-none focus:ring-2 focus:ring-claro-primario/40 dark:focus:ring-oscuro-primario/40"
                    />
                </label>

                {/* Adicionales */}
                <div className="mt-4 border-t border-claro-borde dark:border-oscuro-borde pt-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-claro-primario dark:text-oscuro-primario">
                                Opcionales
                            </p>
                            <h3 className="mt-1 text-sm font-semibold text-claro-texto dark:text-oscuro-texto">
                                Agrega servicios
                            </h3>
                        </div>
                        <span className="text-xs font-semibold text-claro-primario dark:text-oscuro-primario">
                            Adicionales: Bs. {subtotalAdicionales.toFixed(2)}
                        </span>
                    </div>

                    <div className="grid gap-2 md:grid-cols-3">
                        {SERVICIOS_ADICIONALES.map((servicio) => {
                            const seleccionado = Boolean(adicionalesSeleccionados[servicio.nombre]);
                            return (
                                <label
                                    key={servicio.nombre}
                                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${
                                        seleccionado
                                            ? 'border-claro-primario dark:border-oscuro-primario bg-claro-primario/10 dark:bg-oscuro-primario/10'
                                            : 'border-claro-borde dark:border-oscuro-borde hover:border-claro-primario/50 dark:hover:border-oscuro-primario/50'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={seleccionado}
                                        onChange={() =>
                                            setAdicionalesSeleccionados((actuales) => ({
                                                ...actuales,
                                                [servicio.nombre]: !actuales[servicio.nombre]
                                            }))
                                        }
                                        className="h-4 w-4 shrink-0 accent-claro-primario dark:accent-oscuro-primario"
                                    />
                                    <span className="min-w-0 truncate text-xs font-semibold text-claro-texto dark:text-oscuro-texto">
                                        {servicio.nombre}
                                    </span>
                                    <span className="ml-auto shrink-0 text-xs text-claro-texto2 dark:text-oscuro-texto2">
                                        Bs. {servicio.precio.toFixed(2)}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Total */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm bg-claro-tinte dark:bg-oscuro-tinte">
                    <span className="text-claro-texto2 dark:text-oscuro-texto2">
                        Cancha: Bs. {subtotalReserva.toFixed(2)} + adicionales: Bs. {subtotalAdicionales.toFixed(2)}
                    </span>
                    <strong className="text-base text-claro-primario dark:text-oscuro-primario">
                        Total: Bs. {totalReserva.toFixed(2)}
                    </strong>
                </div>

                {/* Botón confirmar */}
                <button
                    type="button"
                    disabled={!horaSeleccionada || guardando}
                    onClick={crearReserva}
                    className="mt-4 rounded-lg px-5 py-3 font-semibold text-white dark:text-oscuro-fondo transition-all shadow-sm bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {guardando ? 'Creando reserva...' : 'Confirmar reserva y continuar al pago'}
                </button>

                {reservaCreada && (
                    <p className="mt-3 rounded-xl p-3 text-sm font-medium bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/40">
                        Reserva #{reservaCreada} creada como pendiente. Puedes cerrar el pago y completarlo después desde Mis reservas.
                    </p>
                )}
            </section>

            <ModalPago
                isOpen={Boolean(reservaPago)}
                reserva={reservaPago}
                onClose={() => setReservaPago(null)}
                onComplete={() => {
                    setReservaPago(null);
                    navigate('/reservas');
                }}
            />
        </div>
    );
};

export default DisponibilidadCancha;