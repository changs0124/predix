import axios from "axios";

export const exeInstance = (port) => axios.create({
  baseURL: `http://127.0.0.1:${port}`,
  headers: {
    'Content-Type': 'application/json'
  }
})