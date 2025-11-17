import axios from 'axios';
import type { IclienteRegister } from '../interfaces/cliente';
import type { IproveedorRegister } from '../interfaces/proveedor';
import { createApiClient } from './axiosConfig';

const clienteApi = createApiClient('http://127.0.0.1:8000/api_rest/api/v1/cliente/');

const proveedorApi = createApiClient('http://127.0.0.1:8000/api_rest/api/v1/proveedor/');



export const registerCliente = (cliente: IclienteRegister) => clienteApi.post('/', cliente);

export const registerProveedor = (proveedor: IproveedorRegister) => proveedorApi.post('/', proveedor);