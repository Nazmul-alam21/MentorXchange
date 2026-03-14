import axios from "axios";

const api = axios.create({
    baseURL: "https://mentorxchange-backend.onrender.com/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// attached token to every request
api.interceptors.request.use(

    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }

);

export default api;