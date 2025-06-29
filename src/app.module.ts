import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TasksController } from "./adapters/rest/tasks.controller";
import { RequestLoggerInterceptor } from "./adapters/middleware/request-logger.middleware";
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
  providers: [
    MongoTaskRepository,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggerInterceptor,
    },
  ],
})
export class AppModule {}
