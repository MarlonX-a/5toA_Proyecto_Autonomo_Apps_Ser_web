import axios from "axios";

const ubicacionApi = axios.create({
    baseURL: "http://127.0.0.1:8000/api_rest/api/v1/ubicacion/"
})

export const getAllUbicaciones = () => ubicacionApi.get("/");