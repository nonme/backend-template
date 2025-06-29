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

  app.enableCors({
    origin:
      config.NODE_ENV === "development" ? true : ["http://localhost:3000"], // Allow all origins in dev, specific in prod
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  });

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
