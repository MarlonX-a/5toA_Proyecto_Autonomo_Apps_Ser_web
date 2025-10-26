import axios from "axios";
import type { IservicioUbicacion } from "../interfaces/servicioUbicacion";
import type { Icalificacion } from "../interfaces/califiacion";

const servicioUbicacionApi = axios.create({
    baseURL: "http://127.0.0.1:8000/api_rest/api/v1/servicioUbicacion/"
})

export const getAllServicioUbicacion = (    token: string) => servicioUbicacionApi.get("/", { headers: { Authorization: `Token ${token}` } });
export const getServicioUbicacio = (id: number, token: string) => servicioUbicacionApi.get(`/${id}/`, { headers: { Authorization: `Token ${token}` } });
export const createServicioUbicacion = (data: IservicioUbicacion, token: string) => servicioUbicacionApi.post("/", data, { headers: { Authorization: `Token ${token}` } });
export const updateServicioUbicacion = (id: number, data: Partial<Icalificacion>, token: string) => servicioUbicacionApi.patch(`/${id}/`, data, { headers: { Authorization: `Token ${token}` } });
export const deleteServicioUbicacion = (id: number, token: string) => servicioUbicacionApi.delete(`/${id}/`, { headers: { Authorization: `Token ${token}` } });
export const getServicioUbicacionByServicio = (servicio_id: number, token: string) => servicioUbicacionApi.get(`/?servicio_id=${servicio_id}`, { headers: { Authorization: `Token ${token}` } });