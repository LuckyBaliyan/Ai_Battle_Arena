import axios from "axios";

const app = axios.create({
      baseURL: import.meta.env.VITE_BASE_URI
});


export async function invokeBattle(input) {
      try {
            const response = await app.post(`/invoke`, { input });
            return response.data;
      } catch (error) {
            console.error("Error invoking battle:", error);
            throw error;
      }
}