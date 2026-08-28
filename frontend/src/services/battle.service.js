import axios from "axios";

const app = axios.create({
      baseURL: import.meta.env.VITE_BASE_URI
});

/**
 * invokes the battle graph with the given input
 * @param {string} input - the prompt to be sent to the battle graph
 * @returns {object} - the response from the battle graph
 * @throws {Error} - if the battle graph fails to invoke
 */
export async function invokeBattle(input) {
      try {
            const response = await app.post(`/invoke`, { input });
            return response.data;
      } catch (error) {
            console.error("Error invoking battle:", error);
            throw error;
      }
}