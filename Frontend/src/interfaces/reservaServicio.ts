import type { Ireserva } from "./reserva";
import type { Iservicio } from "./servicio";

export interface IreservaServicio{
    id?: number;
    reserva: Ireserva;
    servicio: Iservicio;
    fecha_servicio: string;
    hora_servicio: string;
}