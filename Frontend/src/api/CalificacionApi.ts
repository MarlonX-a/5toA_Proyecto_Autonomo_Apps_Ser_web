import axios from "axios";
import type { Icalificacion } from "../interfaces/califiacion";

const calificacionApi = axios.create({
  baseURL: "http://127.0.0.1:8000/api_rest/api/v1/calificacion/"
});

export const createCalificacion = (data: Icalificacion, token: string) =>
  calificacionApi.post("/", data, { headers: { Authorization: `Token ${token}` } });

export const getCalificacionesByServicio = (servicioId: number, token: string) =>
  calificacionApi.get(`?servicio_id=${servicioId}`, { headers: { Authorization: `Token ${token}` } });

export const updateCalificacion = (id: number, data: Partial<Icalificacion>, token: string) =>
  calificacionApi.patch(`/${id}/`, data, { headers: { Authorization: `Token ${token}` } });

export const deleteCalificacion = (id: number, token: string) =>
  calificacionApi.delete(`/${id}/`, { headers: { Authorization: `Token ${token}` } });
