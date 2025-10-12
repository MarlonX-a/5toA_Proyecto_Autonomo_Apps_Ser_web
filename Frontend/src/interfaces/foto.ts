import type { Iservicio } from "./servicio";

export interface Ifoto{
    id?: number;
    servicio: Iservicio;
    ubicacion?: string | null; 
}