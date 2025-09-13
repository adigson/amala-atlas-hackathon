import axios from "axios";

// change baseURL to your FastAPI backend URL
const api = axios.create({
  baseURL: "https://web-production-be18e.up.railway.app", 
});

export default api;
