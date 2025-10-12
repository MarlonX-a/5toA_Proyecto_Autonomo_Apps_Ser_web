import type { Icliente } from "./cliente";
import type { Iservicio } from "./servicio";

export interface Icalificacion{
    id?: number;
    cliente: Icliente;
    servicio: Iservicio;
    fecha?: string;
    puntuacion: number;
}