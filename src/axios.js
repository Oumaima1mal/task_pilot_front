import axios from "axios";

// Crée une instance Axios avec une URL de base
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api",  // Change ceci si ton backend est ailleurs
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor pour ajouter dynamiquement le token à chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
