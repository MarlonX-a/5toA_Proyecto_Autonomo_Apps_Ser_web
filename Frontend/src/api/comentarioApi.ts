import axios from "axios";
import type { Icomentario } from "../interfaces/comentario";
import { createApiClient } from "./axiosConfig";

const comentarioApi = createApiClient("http://127.0.0.1:8000/api_rest/api/v1/comentario/");

export const createComentario = (comentario: Icomentario, token: string) =>
  comentarioApi.post("/", comentario, {
    headers: { Authorization: `Token ${token}` },
  });


export const getAllComentarios = (token: string) =>
  comentarioApi.get("/", {
    headers: { Authorization: `Token ${token}` },
  });


export const getComentariosByServicio = (servicioId: number, token: string) =>
  comentarioApi.get(`/?servicio_id=${servicioId}`, {
    headers: { Authorization: `Token ${token}` },
});


export const getComentario = (id: number, token: string) =>
  comentarioApi.get(`/${id}/`, {
    headers: { Authorization: `Token ${token}` },
  });


export const updateComentario = (id: number, data: Partial<Icomentario>, token: string) =>
  comentarioApi.patch(`/${id}/`, data, {
    headers: { Authorization: `Token ${token}` },
  });

export const deleteComentario = (id: number, token: string) =>
  comentarioApi.delete(`/${id}/`, {
    headers: { Authorization: `Token ${token}` },
  });
