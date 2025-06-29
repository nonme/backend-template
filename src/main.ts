import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import {
  NestFastifyApplication,
  FastifyAdapter,
} from "@nestjs/platform-fastify";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { validateConfig } from "./config/config";
import { logger, enhancedLogger } from "./utils/logger.utils";

async function bootstrap() {
  const config = validateConfig();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: false, // Use custom Pino logger instead
    },
  );

  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger/OpenAPI setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Progress Tracking API")
    .setDescription("API for managing tasks and progress tracking")
    .setVersion("1.0")
    .addTag("tasks")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api", app, document);

  await app.listen(config.PORT);
  logger.info(
    `🚀 Server running at http://localhost:${config.PORT} (${process.env.NODE_ENV ?? "development"})`,
  );
}

bootstrap().catch((error: unknown) => {
  enhancedLogger.logError(error, "bootstrap");
  process.exit(1);
});
