# OpenAPI Integration

This backend now uses OpenAPI/Swagger instead of the shared package for type definitions.

## Features

- **OpenAPI Schema Generation**: Automatically generates API documentation
- **Input Validation**: Uses class-validator decorators for request validation
- **Type Safety**: OpenAPI decorators provide runtime validation and documentation

## Usage

### Generate OpenAPI Schema
```bash
npm run generate:openapi
```
This will create an `openapi.json` file with the complete API schema.

### View API Documentation
Start the backend and visit: `http://localhost:3000/api`

### Available Endpoints
- `GET /api` - Swagger UI documentation
- `GET /api-json` - Raw OpenAPI JSON schema

## Types

All types are now defined in `src/domain/tasks/task.types.ts` with:
- **OpenAPI decorators** for documentation
- **Class-validator decorators** for validation
- **Input/Output naming** instead of DTO terminology

## Migration from Shared Package

The backend no longer depends on `@progress/shared`. All types are:
- Self-contained within the domain layer
- Documented with OpenAPI decorators
- Validated at runtime
- Available for frontend code generation