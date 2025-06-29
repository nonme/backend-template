# 🚀 NestJS Clean Architecture Template

<div align="center">

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

A production-ready NestJS backend template built with Clean Architecture principles, modern TypeScript, and best practices. Use this as a starting point for any backend project.

## ✨ Features

- **Clean Architecture**: Domain-driven design with clear separation of concerns
- **NestJS + Fastify**: High-performance web framework with Fastify adapter
- **MongoDB**: Document database with Mongoose ODM
- **TypeScript**: Fully typed codebase with strict configuration
- **OpenAPI/Swagger**: API documentation with type safety
- **Testing**: Comprehensive testing setup with Vitest
- **Configuration**: Environment-based config with Zod validation
- **Dependency Injection**: Custom service provider with caching
- **Example Entity**: Tasks CRUD as a reference implementation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB instance (local, Atlas, or any provider) OR Docker for local MongoDB
- npm or yarn

### Getting Started

1. **Use this template:**
   ```bash
   # Clone or fork this repository
   git clone https://github.com/nonme/backend-template.git <your-project-name>
   cd <your-project-name>
   npm install
   ```

2. **Set up MongoDB (choose one):**
   
   **Option A: Docker Compose (Recommended)**
   ```bash
   docker-compose up -d
   # MongoDB will be available at localhost:27017
   # Mongo Express UI at localhost:8081
   ```
   
   **Option B: External MongoDB**
   ```bash
   # Use MongoDB Atlas, local installation, or any hosted provider
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection details
   ```

4. **Start the development server:**
   ```bash
   npm run start:dev
   ```

The server will start at `http://localhost:3001`

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

For MongoDB Atlas or other external providers, adjust the connection parameters in your `.env` file accordingly.

## 📖 Usage

### API Documentation

OpenAPI/Swagger documentation is available at:
- **Interactive UI**: `http://localhost:3001/api`
- **JSON Schema**: `http://localhost:3001/api-json`

### Example API Endpoints (Tasks)

#### Tasks CRUD
- `POST /tasks` - Create a new task
- `GET /tasks` - Get all tasks
- `GET /tasks/:id` - Get task by ID
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Development

```bash
# Start in watch mode
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Lint code
npm run lint

```

### Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# Interactive UI
npm run test:ui

# E2E tests
npm run test:e2e
```

## 🏗️ Architecture & Customization

### Architecture Overview

```
src/
├── adapters/          # External interfaces (REST controllers)
├── domain/           # Business logic and repository interfaces
├── infra/            # Technical implementations (database, etc.)
├── service-provider/ # Dependency injection system
├── config/           # Configuration and validation
└── utils/            # Shared utilities
```

### Key Principles

- **Domain Layer**: Contains business logic and repository contracts
- **Infrastructure Layer**: Database implementations and external services
- **Adapters Layer**: REST controllers and external interfaces
- **Dependency Inversion**: Interfaces defined in domain, implemented in infrastructure

### Key DDD Patterns

- **Repository Pattern**: Domain defines interfaces (`TaskRepository`), infrastructure provides implementations (`MongoTaskRepository`)
- **Dependency Inversion**: Domain layer depends on abstractions, not concretions. Infrastructure implements domain interfaces.
- **Type Compatibility**: Adapter types are structurally compatible with domain types through duck typing, allowing seamless data flow without coupling layers.
- **Clean Boundaries**: Each layer has clear responsibilities and dependencies flow inward toward the domain core.

### Adapting the Template

This template uses **Tasks** as an example entity. To adapt it for your project:

1. **Replace the domain entity**: Rename/modify files in `src/domain/tasks/` 
2. **Update database schemas**: Modify `src/infra/repositories/task.schema.ts`
3. **Adapt controllers**: Update `src/adapters/rest/tasks.controller.ts`
4. **Update service providers**: Modify `src/service-provider/`

The architecture patterns remain the same regardless of your domain.

### Template Usage

This template is designed to be:
1. **Cloned** for new projects
2. **Domain entities replaced** (tasks → your entities)
3. **Database/API adapted** to your needs
4. **Infrastructure patterns maintained**

The Clean Architecture patterns ensure your business logic stays separate from technical details, making the codebase maintainable and testable.

## 📋 Reference

### Scripts

- `npm run start:dev` - Development server with hot reload
- `npm run build` - Build for production
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run lint` - Lint and fix code

### Future Enhancements (TODO)

### High Priority
- [ ] Generalize controller code (reduce boilerplate)
- [x] Add OpenAPI/Swagger documentation
- [ ] Add authorization support (JWT/OAuth)
- [ ] Add rate limiting middleware

### Medium Priority  
- [ ] Add GraphQL support alongside REST
- [ ] Option to use PostgreSQL instead of MongoDB
- [ ] Add Redis caching layer
- [ ] Add request/response logging middleware
- [ ] Add health check endpoints

### Low Priority
- [ ] Add database migrations
- [ ] Add API versioning
- [ ] Add metrics and monitoring
- [ ] Add background job processing
- [ ] Add file upload support

### Contributing

When improving this template:
1. Keep the Clean Architecture patterns intact
2. Ensure changes benefit multiple use cases
3. Write tests for new template features
4. Update documentation
5. Maintain TypeScript strict mode

## 📄 License

MIT