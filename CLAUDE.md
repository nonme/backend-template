# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a backend-only NestJS application for progress tracking, built with:
- **Backend**: NestJS with Fastify, MongoDB/Mongoose, following Clean Architecture principles
- **API Documentation**: OpenAPI/Swagger with automated generation
- **Testing**: Vitest with UI mode and coverage reporting
- **Database**: MongoDB with Docker Compose setup

## Development Commands

- `npm run start:dev` - Start backend in watch mode (development)
- `npm run start:debug` - Start backend with debugging enabled
- `npm run start:prod` - Start production build
- `npm run build` - Build the backend
- `npm run test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:ui` - Run tests with interactive UI
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Lint backend code
- `npm run format` - Format code with Prettier

## Code Quality Commands

When appropriate (typically after completing implementation work):
- `npm run build` - Compile TypeScript and check for build errors
- `npm run test` - Run tests to ensure functionality works correctly
- `npm run lint` - Check code style and fix linting issues

## Architecture

### Hexagonal Architecture (Domain-Driven Design)

This project follows Hexagonal Architecture principles with clear separation of concerns:

**Domain Layer** (`src/domain/`): Core business logic (hexagon center)
- `tasks/task.service.ts` - Domain service containing business rules
- `tasks/task.repository.ts` - Repository interface (port)
- `tasks/task.types.ts` - Domain entities and value objects

**Adapters Layer** (`src/adapters/`): External interfaces (hexagon edges)
- `rest/tasks.controller.ts` - REST API adapter (driving adapter)
- `rest/tasks.types.ts` - OpenAPI/validation types (duck-typing compatible with domain types)

**Infrastructure Layer** (`src/infra/`): Technical implementations (driven adapters)
- `repositories/mongo-task.repository.ts` - MongoDB implementation of TaskRepository interface
- `repositories/task.schema.ts` - Mongoose schema definitions
- `database/mongo.client.ts` - Database connection management

**Service Provider** (`src/service-provider/`): Dependency injection container
- Factory pattern with caching (NodeCache with 5-minute TTL)
- Type-safe service resolution and dependency wiring

### Key DDD Patterns

**Repository Pattern**: Domain defines interfaces (`TaskRepository`), infrastructure provides implementations (`MongoTaskRepository`)

**Dependency Inversion**: Domain layer depends on abstractions, not concretions. Infrastructure implements domain interfaces.

**Type Compatibility**: Adapter types (`adapters/rest/tasks.types.ts`) are structurally compatible with domain types (`domain/tasks/task.types.ts`) through duck typing, allowing seamless data flow without coupling layers.

**Clean Boundaries**: Each layer has clear responsibilities and dependencies flow inward toward the domain core.

### API Documentation
- OpenAPI/Swagger integration with NestJS
- Automatic schema generation from adapter types with validation decorators
- Interactive API explorer available at `/api` endpoint

## Database Setup

MongoDB runs via Docker Compose:
- `docker-compose up -d` - Start MongoDB and Mongo Express
- MongoDB: `localhost:27017` (admin/password)
- Mongo Express UI: `localhost:8081`

## Key Patterns

### Repository Pattern
- Interfaces defined in domain layer
- Implementations in infrastructure layer
- Dependency inversion through service provider

### Service Layer Pattern
- Business logic encapsulated in domain services
- Services retrieved via custom factory pattern
- Context-based dependency injection

### Type Safety
- Strong TypeScript typing throughout the application
- Domain-driven type definitions in respective layers

## Testing Strategy

Backend uses Vitest with:
- Unit tests for business logic (`*.spec.ts`)
- E2E tests with supertest
- Coverage reporting with v8 provider
- UI mode for interactive testing
- Watch mode for development

## Clean Code Principles (Robert Martin)

### Function Design

- Single Responsibility: Each function should do one thing and do it well
- Small Functions: Keep functions short, ideally under 20 lines (not a strict rule)
- Self-Documenting: Function names should clearly express their purpose
- Minimal Parameters: Limit function parameters (ideally 0-3, not strict rule)
- No Side Effects: Functions should not have hidden side effects
- Pure Functions: Prefer pure functions for predictable behavior and easier testing

### Naming Conventions

- Use intention-revealing names for variables, functions, classes, and components
- Avoid mental mapping - use searchable, pronounceable names
- Use verbs for functions and nouns for variables/classes/components
- Be consistent in naming patterns throughout the codebase
- Use PascalCase for React components, interfaces, types, classes
- Use camelCase for variables, functions, properties
- Use SCREAMING_SNAKE_CASE for constants
- Prefix interfaces with 'I' or use descriptive names (User vs IUser)

### Code Structure

- Extract methods from complex logic into smaller, named functions
- Avoid deep nesting - use early returns and guard clauses
- Group related functionality logically
- Separate concerns - keep business logic separate from UI and infrastructure code
- Use custom hooks to encapsulate complex state logic in React
- Implement proper separation of layers (presentation, business, data)

### Error Handling

- Use proper Error classes instead of throwing strings
- Don't return null/undefined - use Optional patterns, Result types, or throw meaningful errors
- Fail fast - validate inputs early using type guards and assertion functions
- Handle errors at the right level of abstraction
- Use error boundaries in React for component error handling
- Implement proper async error handling with try-catch and Promise rejection handling

## Code Preservation Rules

### When Modifying Existing Code

- NEVER remove existing code unless explicitly requested
- Preserve all existing comments in their original form
- Maintain existing structure and organization
- Only modify what is specifically requested
- Keep all imports, dependencies, and configurations intact

### Adding New Code

- Integrate seamlessly with existing patterns and conventions
- Follow the established code style of the existing codebase
- Maintain consistency with existing naming and structure

## Comment Guidelines (Robert Martin's Philosophy)

### When to Add Comments

- Explain WHY, not WHAT - code should be self-explanatory for what it does
- Legal comments (copyright, licenses) when required
- Warning comments about consequences or important constraints
- TODO comments for future improvements (with context)
- Amplification comments to emphasize the importance of something
- Complex business logic explanations
- API documentation using JSDoc format

### When NOT to Comment

- Avoid redundant comments that just repeat what the code does
- Don't use comments as crutches for bad code - refactor instead
- Avoid commented-out code - use version control instead
- Don't add noise comments or mandatory comments for every function

### Comment Language

- All new comments must be in English
- Use clear, concise language
- Keep comments up-to-date with code changes (but never remove existing comments, especially TODOs, unless refactored)

## TypeScript-Specific Requirements

### Type Safety & Documentation

- Always use strict TypeScript configuration (strict: true, noImplicitAny: true)
- Use JSDoc comments for functions, classes, and complex types
- Prefer explicit return types for public APIs and complex functions
- Use type assertions sparingly and prefer type guards
- Implement proper generic constraints and conditional types where needed

### Modern TypeScript Features (5.0+)

- Use const assertions and satisfies operator for better type inference
- Leverage template literal types for string manipulation
- Use mapped types and utility types (Pick, Omit, Partial, Required, etc.)
- Implement proper discriminated unions for state management
- Use never type for exhaustive checking

### Best Practices

- Use Zod or similar libraries for runtime type validation
- Implement proper error types with discriminated unions
- Use branded types for domain-specific values (UserId, Email, etc.)
- Prefer type composition over inheritance
- Use enums sparingly - prefer union types or const assertions
- Implement proper module boundaries with index files

## Node.js-Specific Requirements

### Modern Node.js (18+)

- Use ES modules (import/export) instead of CommonJS when possible
- Leverage built-in fetch API for HTTP requests
- Use node: prefix for built-in modules (node:fs, node:path)
- Implement proper async/await patterns with error handling
- Use AbortController for cancellable operations

### Architecture Patterns

- Implement dependency injection for better testability
- Use environment-specific configuration management
- Separate business logic from framework-specific code
- Implement proper logging with structured logging (Winston, Pino)
- Use middleware patterns for cross-cutting concerns

### Performance & Security

- Implement proper input validation and sanitization
- Use helmet.js for security headers
- Implement rate limiting and proper authentication
- Use connection pooling for database connections
- Implement proper graceful shutdown handling

## Testing Requirements

### Testing Frameworks

- Use Vitest for unit/integration tests (faster than Jest)
- Implement E2E tests with supertest for API testing
- Use proper mocking for external dependencies

### Testing Patterns

- Follow AAA pattern (Arrange, Act, Assert)
- Test behavior, not implementation details
- Use descriptive test names that explain the scenario
- Implement proper test data factories
- Use proper async testing patterns

### Type Safety in Tests

- Use typed test utilities and matchers
- Implement proper mock typing
- Use type assertions carefully in tests
- Create reusable test utilities with proper types

## Code Quality Tools

### Essential Tooling

- ESLint with TypeScript rules
- Prettier for consistent code formatting
- Husky for git hooks
- lint-staged for pre-commit linting
- TypeScript compiler with strict configuration

### Recommended Extensions

- Use path mapping for cleaner imports
- Implement proper bundle analysis
- Use source maps for debugging
- Implement proper CI/CD with type checking

## Security Considerations

- Validate all external inputs with proper type guards
- Use environment variables for sensitive configuration
- Implement proper CORS policies
- Use HTTPS in production
- Sanitize user inputs to prevent XSS
- Implement proper authentication and authorization
- Use security headers and CSP policies
