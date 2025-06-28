import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { AppModule } from '../src/app.module';

async function generateOpenApiSchema() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Progress Tracking API')
    .setDescription('API for managing tasks and progress tracking')
    .setVersion('1.0')
    .addTag('tasks')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Write the OpenAPI schema to a file
  writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
  console.log('OpenAPI schema generated at ./openapi.json');

  await app.close();
}

generateOpenApiSchema().catch((error) => {
  console.error('Error generating OpenAPI schema:', error);
  process.exit(1);
});