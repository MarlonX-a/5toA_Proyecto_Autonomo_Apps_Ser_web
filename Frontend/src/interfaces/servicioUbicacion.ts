import type { Iservicio } from "./servicio";
import type { Iubicacion } from "./ubicacion";

export interface IservicioUbicacion{
    id?: number;
    servicio: Iservicio;
    ubicacion: Iubicacion;
}