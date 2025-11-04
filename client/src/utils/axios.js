import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://192.168.10.103:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
