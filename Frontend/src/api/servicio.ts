import axios from "axios";
import type { Iservicio } from "../interfaces/servicio";

const servicioApi = axios.create({
  baseURL: "http://127.0.0.1:8000/api_rest/api/v1/servicios/",
});

export const createServicio = (servicio: Iservicio) => servicioApi.post("/", servicio);

export const getAllServicios = () => servicioApi.post("/")

