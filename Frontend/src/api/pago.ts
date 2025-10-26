import axios from "axios";
import type { Ipago } from "../interfaces/pago";

const pagoApi = axios.create({
    baseURL: "http://127.0.0.1:8000/api_rest/api/v1/pago/"
})

export const createPago = (pago: Ipago, token: string) => pagoApi.post("/", pago, {headers: {Authorization: `Token ${token}`}})