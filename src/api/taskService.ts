// src/api/taskService.ts
import axios from "axios";
import { Task } from "@/types/task";

const API_URL = "http://localhost:8000"; // ton URL backend

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // si tu utilises des cookies ou tokens
});

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await axiosInstance.get("/taches/");
  return response.data;
};

export const createTask = async (taskData: Partial<Task>) => {
  const response = await axiosInstance.post("/taches/", taskData);
  return response.data;
};
