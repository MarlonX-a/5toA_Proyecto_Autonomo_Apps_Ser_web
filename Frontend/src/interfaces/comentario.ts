import type { Icliente } from "./cliente";
import type { Iservicio } from "./servicio";

export interface Icomentario{
    id?: number;
    cliente: Icliente;
    servicio: Iservicio;
    titulo: string;
    texto: string;
    respuesta?: string | null;
    fecha?: string;
}