import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { TasksController } from "./adapters/rest/tasks.controller";
import { MongoTaskRepository } from "./infra/repositories/mongo-task.repository";
import { TaskSchema } from "./infra/repositories/task.schema";
import { validateConfig, getMongoUri } from "./config/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateConfig,
    }),
    MongooseModule.forRoot(getMongoUri(validateConfig())),
    MongooseModule.forFeature([{ name: "Task", schema: TaskSchema }]),
  ],
  controllers: [TasksController],
  providers: [MongoTaskRepository],
})
export class AppModule {}
