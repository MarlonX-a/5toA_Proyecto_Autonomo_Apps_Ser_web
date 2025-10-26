import axios from "axios";
import type { IclienteRegister } from "../interfaces/cliente";
import type { IproveedorRegister } from "../interfaces/proveedor";

const clienteApi = axios.create({
    baseURL: "http://127.0.0.1:8000/api_rest/api/v1/cliente/"
});

const proveedorApi = axios.create({
    baseURL: "http://127.0.0.1:8000/api_rest/api/v1/proveedor/"
});

const profileApi = axios.create({
    baseURL: "http://127.0.0.1:8000/api_rest/profile/"
});

export const getUsers = (token: string) => profileApi.get("/", { headers: { Authorization: `Token ${token}` } });

export const getCliente = (id: number) => clienteApi.get(`/${id}/`);
export const updateCliente = (id: number, cliente: Partial<IclienteRegister>, token: string) =>
    clienteApi.patch(`/${id}/`, cliente, { headers: { Authorization: `Token ${token}` } });

export const getProveedor = (id: number) => proveedorApi.get(`/${id}/`);
export const updateProveedor = (id: number, proveedor: Partial<IproveedorRegister>, token: string) =>
    proveedorApi.patch(`/${id}/`, proveedor, { headers: { Authorization: `Token ${token}` } });
