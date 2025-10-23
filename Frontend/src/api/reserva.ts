import axios from "axios";
import type { Ireserva } from "../interfaces/reserva";

const reservaApi = axios.create({
    baseURL: "http://127.0.0.1:8000/api_rest/api/v1/reserva/"
})

export const createReserva = (reserva: Ireserva, token: string) => reservaApi.post("/", reserva, { headers: { Authorization: `Token ${token}` } });