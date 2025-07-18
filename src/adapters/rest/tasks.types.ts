import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsBoolean, IsOptional, IsNotEmpty } from "class-validator";

export class CreateTaskInput {
  @ApiProperty({
    description: "The title of the task",
    example: "Complete project documentation",
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: "Optional description of the task",
    example: "Write comprehensive documentation for the API endpoints",
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateTaskInput {
  @ApiPropertyOptional({
    description: "The title of the task",
    example: "Updated task title",
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: "Optional description of the task",
    example: "Updated task description",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "Whether the task is completed",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

export class GetTaskInput {
  @ApiProperty({
    description: "The unique identifier of the task",
    example: "507f1f77bcf86cd799439011",
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class DeleteTaskInput {
  @ApiProperty({
    description: "The unique identifier of the task to delete",
    example: "507f1f77bcf86cd799439011",
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class GetTasksInput {
  @ApiPropertyOptional({
    description: "Filter tasks by completion status",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @ApiPropertyOptional({
    description: "Search tasks by title or description",
    example: "documentation",
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: "Maximum number of tasks to return",
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: "Number of tasks to skip for pagination",
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  offset?: number;
}

export class TaskResponse {
  @ApiProperty({
    description: "The unique identifier of the task",
    example: "507f1f77bcf86cd799439011",
  })
  id: string;

  @ApiProperty({
    description: "The title of the task",
    example: "Complete project documentation",
  })
  title: string;

  @ApiPropertyOptional({
    description: "Optional description of the task",
    example: "Write comprehensive documentation for the API endpoints",
  })
  description?: string;

  @ApiProperty({
    description: "Whether the task is completed",
    example: false,
  })
  completed: boolean;

  @ApiProperty({
    description: "When the task was created",
    example: "2024-01-15T10:30:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "When the task was last updated",
    example: "2024-01-15T15:45:00.000Z",
  })
  updatedAt: Date;
}

export class GetTasksResponse {
  @ApiProperty({
    description: "Array of tasks",
    type: [TaskResponse],
  })
  tasks: TaskResponse[];

  @ApiProperty({
    description: "Total number of tasks matching the filter criteria",
    example: 25,
  })
  total: number;
}

export class DeleteTaskResponse {
  @ApiProperty({
    description: "Success message",
    example: "Task deleted successfully",
  })
  message: string;
}
