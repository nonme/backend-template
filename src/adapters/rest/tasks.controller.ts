import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from "@nestjs/swagger";
import { CreateTaskInput, UpdateTaskInput } from "./tasks.types";
import { TaskFilters } from "../../domain/tasks/task.types";
import { getService, AppContext } from "../../service-provider";
import { MongoTaskRepository } from "../../infra/repositories/mongo-task.repository";
import { logError } from "../../utils/logger.utils";

@ApiTags("tasks")
@Controller("tasks")
export class TasksController {
  constructor(private readonly mongoTaskRepository: MongoTaskRepository) {}

  private getContext(): AppContext {
    return {
      mongoTaskRepository: this.mongoTaskRepository,
    };
  }

  @Post()
  @ApiOperation({ summary: "Create a new task" })
  @ApiBody({ type: CreateTaskInput })
  @ApiResponse({ status: 201, description: "Task created successfully" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async createTask(@Body() createTaskInput: CreateTaskInput) {
    try {
      const taskService = getService(this.getContext(), "task");
      return await taskService.createTask(createTaskInput);
    } catch (error) {
      logError(error, "TasksController.createTask", { createTaskInput });
      throw new HttpException(
        "Failed to create task",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: "Get all tasks with optional filtering" })
  @ApiQuery({
    name: "completed",
    required: false,
    type: "boolean",
    description: "Filter by completion status",
  })
  @ApiQuery({
    name: "search",
    required: false,
    type: "string",
    description: "Search in title and description",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: "number",
    description: "Maximum number of tasks to return",
  })
  @ApiQuery({
    name: "offset",
    required: false,
    type: "number",
    description: "Number of tasks to skip",
  })
  @ApiResponse({ status: 200, description: "Tasks retrieved successfully" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getAllTasks(
    @Query("completed") completed?: string,
    @Query("search") search?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    try {
      const taskService = getService(this.getContext(), "task");

      const filters: TaskFilters = {};
      if (completed !== undefined) {
        filters.completed = completed === "true";
      }
      if (search) {
        filters.search = search;
      }

      const tasks = await taskService.getAllTasks(
        filters,
        limit ? parseInt(limit) : undefined,
        offset ? parseInt(offset) : undefined,
      );

      const total = await taskService.getTasksCount(filters);

      return {
        tasks,
        total,
      };
    } catch (error) {
      logError(error, "TasksController.getAllTasks", {
        completed,
        search,
        limit,
        offset,
      });
      throw new HttpException(
        "Failed to fetch tasks",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a task by ID" })
  @ApiParam({ name: "id", description: "Task ID" })
  @ApiResponse({ status: 200, description: "Task found" })
  @ApiResponse({ status: 404, description: "Task not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getTaskById(@Param("id") id: string) {
    try {
      const taskService = getService(this.getContext(), "task");
      const task = await taskService.getTaskById(id);

      if (!task) {
        throw new HttpException("Task not found", HttpStatus.NOT_FOUND);
      }

      return task;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      logError(error, "TasksController.getTaskById", { id });
      throw new HttpException(
        "Failed to fetch task",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a task by ID" })
  @ApiParam({ name: "id", description: "Task ID" })
  @ApiBody({ type: UpdateTaskInput })
  @ApiResponse({ status: 200, description: "Task updated successfully" })
  @ApiResponse({ status: 404, description: "Task not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async updateTask(
    @Param("id") id: string,
    @Body() updateTaskInput: UpdateTaskInput,
  ) {
    try {
      const taskService = getService(this.getContext(), "task");
      const task = await taskService.updateTask(id, updateTaskInput);

      if (!task) {
        throw new HttpException("Task not found", HttpStatus.NOT_FOUND);
      }

      return task;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      logError(error, "TasksController.updateTask", { id, updateTaskInput });
      throw new HttpException(
        "Failed to update task",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a task by ID" })
  @ApiParam({ name: "id", description: "Task ID" })
  @ApiResponse({ status: 200, description: "Task deleted successfully" })
  @ApiResponse({ status: 404, description: "Task not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async deleteTask(@Param("id") id: string) {
    try {
      const taskService = getService(this.getContext(), "task");
      const deleted = await taskService.deleteTask(id);

      if (!deleted) {
        throw new HttpException("Task not found", HttpStatus.NOT_FOUND);
      }

      return { message: "Task deleted successfully" };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      logError(error, "TasksController.deleteTask", { id });
      throw new HttpException(
        "Failed to delete task",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
