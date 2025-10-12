import type { Ireserva } from "./reserva";

export interface Ipago{
    id?: number;
    reserva: Ireserva;
    metodo_pago?: "pendiente" | "pagado" | "rechazado";
    monto: number;
    estado?: "efectivo" | "tarjeta" | "transferencia";
    referencia?: string | null;
    fecha_pago: string | null;
}