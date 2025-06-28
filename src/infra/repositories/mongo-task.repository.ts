import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery } from "mongoose";
import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
} from "../../domain/tasks/task.types";
import { TaskRepository } from "../../domain/tasks/task.repository";
import { TaskDocument } from "./task.schema";

@Injectable()
export class MongoTaskRepository implements TaskRepository {
  constructor(
    @InjectModel("Task") private readonly taskModel: Model<TaskDocument>,
  ) {}

  async create(data: CreateTaskInput): Promise<Task> {
    const task = new this.taskModel(data);
    const savedTask = await task.save();
    return this.mapToTask(savedTask);
  }

  async findAll(
    filters?: TaskFilters,
    limit?: number,
    offset?: number,
  ): Promise<Task[]> {
    const query = this.buildQuery(filters);
    const tasks = await this.taskModel
      .find(query)
      .limit(limit ?? 100)
      .skip(offset ?? 0)
      .sort({ createdAt: -1 })
      .exec();

    return tasks.map((task) => this.mapToTask(task));
  }

  async findById(id: string): Promise<Task | null> {
    const task = await this.taskModel.findById(id).exec();
    return task ? this.mapToTask(task) : null;
  }

  async update(id: string, data: UpdateTaskInput): Promise<Task | null> {
    const task = await this.taskModel
      .findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true })
      .exec();
    return task ? this.mapToTask(task) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.taskModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async count(filters?: TaskFilters): Promise<number> {
    const query = this.buildQuery(filters);
    return this.taskModel.countDocuments(query).exec();
  }

  private buildQuery(filters?: TaskFilters): FilterQuery<TaskDocument> {
    const query: FilterQuery<TaskDocument> = {};

    if (filters?.completed !== undefined) {
      query.completed = filters.completed;
    }

    if (filters?.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    return query;
  }

  private mapToTask(doc: TaskDocument): Task {
    return {
      id: String(doc._id),
      title: doc.title,
      description: doc.description,
      completed: doc.completed,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
