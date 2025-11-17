import axios from "axios";
import type { Ipago } from "../interfaces/pago";
import { createApiClient } from "./axiosConfig";

const pagoApi = createApiClient("http://127.0.0.1:8000/api_rest/api/v1/pago/")

export const createPago = (pago: Ipago, token: string) => pagoApi.post("/", pago, {headers: {Authorization: `Token ${token}`}})

export const markPagoAsPagado = (pagoId: number, token: string) => pagoApi.post(`/${pagoId}/mark_pagado/`, {}, {headers: {Authorization: `Token ${token}`}})