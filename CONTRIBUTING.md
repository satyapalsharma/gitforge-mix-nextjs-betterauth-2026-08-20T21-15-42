# Contributing to TaskFlow

Thank you for your interest in contributing to TaskFlow! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/taskflow.git
   cd taskflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your local configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Code Style

- **TypeScript**: Strict mode enabled. All new code must be type-safe.
- **Formatting**: 2-space indentation, single quotes, semicolons required.
- **Linting**: Run `npm run lint` before committing. All lint errors must be resolved.
- **Commits**: Use conventional commits format (e.g., `feat:`, `fix:`, `docs:`, `refactor:`).
- **File naming**: Use kebab-case for files (e.g., `user-service.ts`).

## Pull Request Guidelines

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** and ensure:
   - All tests pass (`npm test`)
   - Lint passes (`npm run lint`)
   - Code is properly formatted
   - New features include tests
   - Documentation is updated if needed

3. **Commit your changes** with a descriptive message following conventional commits.

4. **Push to your fork** and open a Pull Request against `main`.

5. **PR Description** should include:
   - Summary of changes
   - Motivation and context
   - Screenshots for UI changes
   - Linked issues (e.g., `Closes #123`)

6. **Code Review**: Maintainers will review your PR. Please address any requested changes promptly.
