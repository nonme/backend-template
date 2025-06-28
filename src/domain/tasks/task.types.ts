export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateTaskInput = Pick<Task, "title" | "description">;

export type UpdateTaskInput = Partial<
  Pick<Task, "title" | "description" | "completed">
>;

export type GetTaskInput = Pick<Task, "id">;

export type DeleteTaskInput = Pick<Task, "id">;

export interface TaskFilters {
  completed?: boolean;
  search?: string;
}

export interface GetTasksInput extends TaskFilters {
  limit?: number;
  offset?: number;
}
