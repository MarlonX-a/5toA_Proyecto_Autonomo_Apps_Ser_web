import axios from "axios";

const categoriaApi = axios.create({
    baseURL: "http://127.0.0.1:8000/api_rest/api/v1/categoria/"
})

export const getAllCategorias = () => categoriaApi.get("/");