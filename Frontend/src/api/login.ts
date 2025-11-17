import axios from "axios";
import  type { Ilogin } from "../interfaces/login";
import { createApiClient } from "./axiosConfig";

const loginApi = createApiClient("http://localhost:8000/api_rest/login/")

export const login = (login: Ilogin) => loginApi.post("/", login);