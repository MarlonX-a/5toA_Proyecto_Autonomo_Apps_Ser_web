import axios from "axios";
import type { IreservaServicio } from "../interfaces/reservaServicio";


const ReservaServicioApi = axios.create({
    baseURL: "http://localhost:8000/api_rest/api/v1/reservaServicio/",
})

export const createReservaServicio = (data: IreservaServicio, token: string) => ReservaServicioApi.post("/", data, {headers: { Authorization: `Token ${token}` },});
export const deleteReservaServicio = (id: number, token: string) =>
  ReservaServicioApi.delete(`/${id}/`, {
    headers: { Authorization: `Token ${token}` },
  });
export const getReservaServiciosByReserva = (reservaId: number, token: string) =>
  ReservaServicioApi.get(`/?reserva_id=${reservaId}`, {
    headers: { Authorization: `Token ${token}` },
  });
export const updateReservaServicio = (id: number, data: Partial<IreservaServicio>, token: string) => ReservaServicioApi.patch(`/${id}/`, data, {headers: { Authorization: `Token ${token}` },});

export const getReservaServicioById = (id: number, token: string) =>
    ReservaServicioApi.get(`/${id}/`, { headers: { Authorization: `Token ${token}` } });