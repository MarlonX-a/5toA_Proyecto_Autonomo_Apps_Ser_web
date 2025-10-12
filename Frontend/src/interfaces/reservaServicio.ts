import type { Ireserva } from "./reserva";
import type { Iservicio } from "./servicio";

export interface IreservaServicio{
    id?: number;
    reserva: Ireserva;
    servicio: Iservicio;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}