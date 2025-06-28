import { TaskService } from "../domain/tasks/task.service";
import { MongoTaskRepository } from "../infra/repositories/mongo-task.repository";

export const getTaskService = (
  mongoTaskRepository: MongoTaskRepository,
): TaskService => {
  return new TaskService(mongoTaskRepository);
};
