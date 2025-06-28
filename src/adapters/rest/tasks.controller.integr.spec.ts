import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { MongooseModule } from "@nestjs/mongoose";
import { HttpStatus } from "@nestjs/common";
import mongoose from "mongoose";
import { TasksController } from "./tasks.controller";
import { MongoTaskRepository } from "../../infra/repositories/mongo-task.repository";
import { TaskSchema } from "../../infra/repositories/task.schema";
import { TaskService } from "../../domain/tasks/task.service";
import { CreateTaskInput, UpdateTaskInput } from "./tasks.types";
import { hasStatusAndMessage } from "../../utils/error.utils";

// Mock logger utils to avoid config validation
vi.mock("../../utils/logger.utils", () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarning: vi.fn(),
  logDebug: vi.fn(),
}));

// Mock service provider to return real service instance
vi.mock("../../service-provider", () => ({
  getService: vi.fn(),
}));

describe("TasksController Integration Tests", () => {
  let app: TestingModule;
  let controller: TasksController;
  let repository: MongoTaskRepository;
  let taskService: TaskService;

  const mongoUri =
    "mongodb://admin:password@localhost:27017/progress_test?authSource=admin";

  beforeAll(async () => {
    // Connect to test database - will throw if MongoDB not available
    await mongoose.connect(mongoUri);

    app = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature([{ name: "Task", schema: TaskSchema }]),
      ],
      controllers: [TasksController],
      providers: [
        MongoTaskRepository,
        {
          provide: TaskService,
          useFactory: (repository: MongoTaskRepository) =>
            new TaskService(repository),
          inject: [MongoTaskRepository],
        },
      ],
    }).compile();

    controller = app.get<TasksController>(TasksController);
    repository = app.get<MongoTaskRepository>(MongoTaskRepository);
    taskService = app.get<TaskService>(TaskService);

    // Setup the mock to return the real task service
    const { getService } = await import("../../service-provider");
    vi.mocked(getService).mockReturnValue(taskService);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await mongoose.connection.db!.dropDatabase();
  });

  describe("createTask", () => {
    it("should create a task successfully", async () => {
      // Arrange
      const createTaskDto: CreateTaskInput = {
        title: "Integration Test Task",
        description: "Test Description",
      };

      // Act
      const result = await controller.createTask(createTaskDto);

      // Assert
      expect(result).toMatchObject({
        title: createTaskDto.title,
        description: createTaskDto.description,
        completed: false,
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);

      // Verify task was saved to database
      const savedTask = await repository.findById(result.id);
      expect(savedTask).toMatchObject(result);
    });

    it("should create task with only title", async () => {
      // Arrange
      const createTaskDto: CreateTaskInput = {
        title: "Title Only Task",
      };

      // Act
      const result = await controller.createTask(createTaskDto);

      // Assert
      expect(result).toMatchObject({
        title: createTaskDto.title,
        completed: false,
      });
      expect(result.description).toBeUndefined();
    });
  });

  describe("getAllTasks", () => {
    beforeEach(async () => {
      // Create test data
      await repository.create({
        title: "Task 1",
        description: "Description 1",
      });
      const task2 = await repository.create({
        title: "Task 2",
        description: "Description 2",
      });
      await repository.update(task2.id, { completed: true });
      await repository.create({
        title: "Search Task",
        description: "Special description",
      });
    });

    it("should get all tasks with default parameters", async () => {
      // Act
      const result = await controller.getAllTasks();

      // Assert
      expect(result.tasks).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(typeof result.tasks[0].title).toBe("string");
      expect(typeof result.tasks[0].completed).toBe("boolean");
    });

    it("should filter tasks by completed status", async () => {
      // Act
      const result = await controller.getAllTasks("true");

      // Assert
      expect(result.tasks).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.tasks[0].completed).toBe(true);
    });

    it("should search tasks by title and description", async () => {
      // Act
      const result = await controller.getAllTasks(undefined, "Search");

      // Assert
      expect(result.tasks).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.tasks[0].title).toBe("Search Task");
    });

    it("should apply pagination", async () => {
      // Act
      const result = await controller.getAllTasks(
        undefined,
        undefined,
        "2",
        "1",
      );

      // Assert
      expect(result.tasks).toHaveLength(2);
      expect(result.total).toBe(3);
    });
  });

  describe("getTaskById", () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await repository.create({
        title: "Test Task",
        description: "Test Description",
      });
      taskId = task.id;
    });

    it("should get task by id successfully", async () => {
      // Act
      const result = await controller.getTaskById(taskId);

      // Assert
      expect(result).toMatchObject({
        id: taskId,
        title: "Test Task",
        description: "Test Description",
        completed: false,
      });
    });

    it("should throw 404 for non-existent task", async () => {
      // Arrange
      const nonExistentId = "507f1f77bcf86cd799439011";

      // Act & Assert
      try {
        await controller.getTaskById(nonExistentId);
        expect.fail("Should have thrown an error");
      } catch (caughtError: unknown) {
        expect(hasStatusAndMessage(caughtError)).toBe(true);
        if (hasStatusAndMessage(caughtError)) {
          expect(caughtError.status).toBe(HttpStatus.NOT_FOUND);
          expect(caughtError.message).toBe("Task not found");
        }
      }
    });

    it("should throw 500 for invalid ObjectId", async () => {
      // Arrange
      const invalidId = "invalid-id";

      // Act & Assert
      try {
        await controller.getTaskById(invalidId);
        expect.fail("Should have thrown an error");
      } catch (caughtError: unknown) {
        expect(hasStatusAndMessage(caughtError)).toBe(true);
        if (hasStatusAndMessage(caughtError)) {
          expect(caughtError.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
          expect(caughtError.message).toBe("Failed to fetch task");
        }
      }
    });
  });

  describe("updateTask", () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await repository.create({
        title: "Original Task",
        description: "Original Description",
      });
      taskId = task.id;
    });

    it("should update task successfully", async () => {
      // Arrange
      const updateTaskDto: UpdateTaskInput = {
        title: "Updated Task",
        completed: true,
      };

      // Act
      const result = await controller.updateTask(taskId, updateTaskDto);

      // Assert
      expect(result).toMatchObject({
        id: taskId,
        title: "Updated Task",
        description: "Original Description",
        completed: true,
      });

      // Verify task was updated in database
      const updatedTask = await repository.findById(taskId);
      expect(updatedTask).toMatchObject(result);
    });

    it("should partially update task", async () => {
      // Arrange
      const updateTaskDto: UpdateTaskInput = {
        completed: true,
      };

      // Act
      const result = await controller.updateTask(taskId, updateTaskDto);

      // Assert
      expect(result).toMatchObject({
        id: taskId,
        title: "Original Task",
        description: "Original Description",
        completed: true,
      });
    });

    it("should throw 404 for non-existent task", async () => {
      // Arrange
      const nonExistentId = "507f1f77bcf86cd799439011";
      const updateTaskDto: UpdateTaskInput = { title: "Updated" };

      // Act & Assert
      try {
        await controller.updateTask(nonExistentId, updateTaskDto);
        expect.fail("Should have thrown an error");
      } catch (caughtError: unknown) {
        expect(hasStatusAndMessage(caughtError)).toBe(true);
        if (hasStatusAndMessage(caughtError)) {
          expect(caughtError.status).toBe(HttpStatus.NOT_FOUND);
          expect(caughtError.message).toBe("Task not found");
        }
      }
    });
  });

  describe("deleteTask", () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await repository.create({
        title: "Task to Delete",
        description: "This task will be deleted",
      });
      taskId = task.id;
    });

    it("should delete task successfully", async () => {
      // Act
      const result = await controller.deleteTask(taskId);

      // Assert
      expect(result).toEqual({ message: "Task deleted successfully" });

      // Verify task was deleted from database
      const deletedTask = await repository.findById(taskId);
      expect(deletedTask).toBeNull();
    });

    it("should throw 404 for non-existent task", async () => {
      // Arrange
      const nonExistentId = "507f1f77bcf86cd799439011";

      // Act & Assert
      try {
        await controller.deleteTask(nonExistentId);
        expect.fail("Should have thrown an error");
      } catch (caughtError: unknown) {
        expect(hasStatusAndMessage(caughtError)).toBe(true);
        if (hasStatusAndMessage(caughtError)) {
          expect(caughtError.status).toBe(HttpStatus.NOT_FOUND);
          expect(caughtError.message).toBe("Task not found");
        }
      }
    });

    it("should handle double deletion gracefully", async () => {
      // Arrange - Delete the task first
      await controller.deleteTask(taskId);

      // Act & Assert - Try to delete again
      try {
        await controller.deleteTask(taskId);
        expect.fail("Should have thrown an error");
      } catch (caughtError: unknown) {
        expect(hasStatusAndMessage(caughtError)).toBe(true);
        if (hasStatusAndMessage(caughtError)) {
          expect(caughtError.status).toBe(HttpStatus.NOT_FOUND);
          expect(caughtError.message).toBe("Task not found");
        }
      }
    });
  });

  describe("complex scenarios", () => {
    it("should handle full CRUD lifecycle", async () => {
      // Create
      const createDto: CreateTaskInput = {
        title: "Lifecycle Task",
        description: "Testing full lifecycle",
      };
      const created = await controller.createTask(createDto);
      expect(created.title).toBe(createDto.title);

      // Read
      const retrieved = await controller.getTaskById(created.id);
      expect(retrieved).toMatchObject(created);

      // Update
      const updateDto: UpdateTaskInput = {
        title: "Updated Lifecycle Task",
        completed: true,
      };
      const updated = await controller.updateTask(created.id, updateDto);
      expect(updated.title).toBe(updateDto.title);
      expect(updated.completed).toBe(true);

      // Delete
      const deleteResult = await controller.deleteTask(created.id);
      expect(deleteResult.message).toBe("Task deleted successfully");

      // Verify deletion
      try {
        await controller.getTaskById(created.id);
        expect.fail("Should have thrown an error");
      } catch (caughtError: unknown) {
        expect(hasStatusAndMessage(caughtError)).toBe(true);
        if (hasStatusAndMessage(caughtError)) {
          expect(caughtError.status).toBe(HttpStatus.NOT_FOUND);
        }
      }
    });

    it("should handle concurrent operations", async () => {
      // Create multiple tasks concurrently
      const createPromises = Array.from({ length: 5 }, (_, i) =>
        controller.createTask({
          title: `Concurrent Task ${i + 1}`,
          description: `Description ${i + 1}`,
        }),
      );

      const createdTasks = await Promise.all(createPromises);
      expect(createdTasks).toHaveLength(5);

      // Verify all tasks were created
      const allTasks = await controller.getAllTasks();
      expect(allTasks.total).toBe(5);
      expect(allTasks.tasks).toHaveLength(5);
    });
  });
});
