import axios from "axios";
import  type { Ilogin } from "../interfaces/login";

const loginApi = axios.create({
    baseURL: "http://localhost:8000/api_rest/login/"
})

export const login = (login: Ilogin) => loginApi.post("/", login);