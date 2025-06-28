import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
} from "./task.types";
import { TaskRepository } from "./task.repository";

export class TaskService {
  constructor(private readonly tasksRepository: TaskRepository) {}

  async createTask(data: CreateTaskInput): Promise<Task> {
    return this.tasksRepository.create(data);
  }

  async getAllTasks(
    filters?: TaskFilters,
    limit?: number,
    offset?: number,
  ): Promise<Task[]> {
    return this.tasksRepository.findAll(filters, limit, offset);
  }

  async getTaskById(id: string): Promise<Task | null> {
    return this.tasksRepository.findById(id);
  }

  async updateTask(id: string, data: UpdateTaskInput): Promise<Task | null> {
    return this.tasksRepository.update(id, data);
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasksRepository.delete(id);
  }

  async getTasksCount(filters?: TaskFilters): Promise<number> {
    return this.tasksRepository.count(filters);
  }
}
