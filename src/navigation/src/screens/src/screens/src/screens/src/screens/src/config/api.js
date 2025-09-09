import axios from "axios";

// change baseURL to your FastAPI backend URL
const api = axios.create({
  baseURL: "http://localhost:8000", 
});

export default api;
