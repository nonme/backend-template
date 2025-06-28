import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
} from "./task.types";

export interface TaskRepository {
  create(data: CreateTaskInput): Promise<Task>;
  findAll(
    filters?: TaskFilters,
    limit?: number,
    offset?: number,
  ): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  update(id: string, data: UpdateTaskInput): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
  count(filters?: TaskFilters): Promise<number>;
}
