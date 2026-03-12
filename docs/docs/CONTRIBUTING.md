---
sidebar_position: 9
title: Contributing
---

# Contributing to React PKL

Thank you for your interest in contributing to React PKL! This guide will help you get started.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Project Structure](#project-structure)
5. [Development Workflow](#development-workflow)
6. [Coding Standards](#coding-standards)
7. [Testing](#testing)
8. [Documentation](#documentation)
9. [Submitting Changes](#submitting-changes)
10. [Release Process](#release-process)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- Git
- A code editor (VS Code recommended)

### First Time Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/react-pkl.git
   cd react-pkl
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/xpodev/react-pkl.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Build all packages**:
   ```bash
   npm run build
   ```

6. **Run the example app**:
   ```bash
   cd examples/app
   npm run dev
   ```

## Development Setup

### Workspace Structure

React PKL is a monorepo using npm workspaces:

```
react-pkl/
├── packages/
│   ├── core/           # Main plugin system (@pkl.js/react)
│   └── sdk/            # Build tools (@pkl.js/react-sdk)
├── examples/
│   ├── app/            # Example host application
│   ├── sdk/            # Example custom SDK
│   └── plugins/        # Example plugins
├── docs/               # Documentation
└── package.json        # Root workspace config
```

### Available Scripts

From the root directory:

```bash
# Build all packages
npm run build

# Watch mode for development
npm run dev

# Lint all packages
npm run lint

# Run tests
npm run test

# Clean all build outputs
npm run clean
```

From individual packages:

```bash
cd packages/core
npm run build       # Build this package
npm run dev         # Watch mode
npm run test        # Run tests
```

### IDE Setup

#### VS Code

Recommended extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features

Settings (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## Project Structure

### Core Package (`packages/core`)

```
src/
├── index.ts                 # Main exports
├── types.ts                 # Core type definitions
├── plugin-manager.ts        # Standalone mode
├── plugin-client.ts         # Client mode
├── plugin-registry.ts       # Plugin storage
├── plugin-storage.ts        # Persistence
├── resource-tracker.ts      # Auto-cleanup system
└── react/
    ├── index.ts             # React exports
    ├── provider.tsx         # PluginProvider component
    ├── context.ts           # React context
    ├── hooks.ts             # React hooks
    └── slot.tsx             # PluginSlot component
```

### SDK Package (`packages/sdk`)

```
src/
├── index.ts                 # Main exports
├── types.ts                 # Build type definitions
├── build.ts                 # Plugin builder
└── cli.ts                   # Command-line interface
```

## Development Workflow

### 1. Create a Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

### 2. Make Changes

1. Write your code
2. Add/update tests
3. Update documentation
4. Test your changes locally

### 3. Commit Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat(core): add hot reload support"
```

Commit message format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

Examples:
```bash
git commit -m "feat(core): implement plugin sandboxing"
git commit -m "fix(sdk): resolve bundling issue with CSS imports"
git commit -m "docs: update getting started guide"
git commit -m "test(core): add tests for resource cleanup"
```

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Coding Standards

### TypeScript

- Use TypeScript for all code
- Enable strict mode
- Avoid `any` - use `unknown` or proper types
- Document public APIs with JSDoc comments

```typescript
/**
 * Register a plugin module.
 *
 * @param loader - Plugin module or async factory function
 * @param options - Registration options
 * @returns Promise that resolves when plugin is registered
 * @throws Error if plugin with same ID already exists
 */
async add(
  loader: PluginLoader<TContext>,
  options?: { enabled?: boolean }
): Promise<void> {
  // Implementation
}
```

### Code Style

We use ESLint and Prettier. Format before committing:

```bash
npm run lint
```

Key guidelines:
- Indentation: 2 spaces
- Semicolons: Required
- Quotes: Single quotes for strings
- Line length: 80-100 characters (soft limit)
- Trailing commas: Yes
- Arrow function parentheses: Always

### File Organization

```typescript
// 1. Imports (external first, then internal)
import { ComponentType } from 'react';
import type { PluginModule } from './types.js';

// 2. Types and interfaces
export interface MyInterface {
  // ...
}

// 3. Constants
const DEFAULT_VALUE = 10;

// 4. Main code
export class MyClass {
  // ...
}

// 5. Helper functions (private)
function helperFunction() {
  // ...
}
```

### Naming Conventions

- **Types/Interfaces**: PascalCase (`PluginModule`, `AppContext`)
- **Functions/Methods**: camelCase (`registerPlugin`, `getAll`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT`, `MAX_PLUGINS`)
- **Files**: kebab-case (`plugin-manager.ts`, `resource-tracker.ts`)
- **React Components**: PascalCase (`PluginProvider`, `PluginSlot`)

### Comments

Use comments for:
- Complex logic explanation
- Public API documentation (JSDoc)
- TODO/FIXME notes with owner and date

```typescript
// TODO(alice, 2026-03-05): Implement caching mechanism
// FIXME(bob, 2026-03-04): Race condition when enabling plugins rapidly

/**
 * This algorithm uses a depth-first traversal to resolve
 * plugin dependencies in the correct order.
 */
function resolveDependencies() {
  // ...
}
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific package
cd packages/core
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Writing Tests

We use Vitest for testing.

#### Unit Tests

```typescript
// plugin-manager.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PluginManager } from './plugin-manager.js';

describe('PluginManager', () => {
  let manager: PluginManager;

  beforeEach(() => {
    manager = new PluginManager();
  });

  it('should add a plugin', async () => {
    const plugin = {
      meta: { id: 'test', name: 'Test', version: '1.0.0' },
    };

    await manager.add(plugin, { enabled: false });

    expect(manager.getAll()).toHaveLength(1);
    expect(manager.getAll()[0].module.meta.id).toBe('test');
  });

  it('should call activate when enabling', async () => {
    const activate = vi.fn();
    const plugin = {
      meta: { id: 'test', name: 'Test', version: '1.0.0' },
      activate,
    };

    await manager.add(plugin, { enabled: false });
    await manager.enable('test');

    expect(activate).toHaveBeenCalledOnce();
  });
});
```

#### Integration Tests

```typescript
// integration.test.tsx
import { render, screen } from '@testing-library/react';
import { PluginProvider, PluginSlot } from '../react/index.js';
import { PluginManager } from '../plugin-manager.js';

describe('React Integration', () => {
  it('should render plugin components in slots', async () => {
    const manager = new PluginManager();
    const TestComponent = () => <div>Test Content</div>;

    await manager.add({
      meta: { id: 'test', name: 'Test', version: '1.0.0' },
      components: { toolbar: TestComponent },
    }, { enabled: true });

    render(
      <PluginProvider registry={manager.registry}>
        <PluginSlot name="toolbar" />
      </PluginProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
```

### Test Coverage

Aim for:
- 80%+ overall coverage
- 100% coverage for critical paths (plugin lifecycle, resource cleanup)
- All public APIs covered

## Documentation

### Types of Documentation

1. **Code Comments** - Inline documentation using JSDoc
2. **README Files** - Package-level overviews
3. **Guides** - Step-by-step tutorials (docs/GETTING_STARTED.md, etc.)
4. **API Reference** - Complete API documentation (docs/API.md)
5. **Examples** - Working code examples (examples/)

### Updating Documentation

When adding features:
1. Update JSDoc comments in code
2. Update API reference if adding public APIs
3. Add examples if introducing new patterns
4. Update getting started guide if changing setup
5. Add entry to CHANGELOG.md

### Documentation Standards

- Write in clear, simple English
- Use code examples liberally
- Include both basic and advanced usage
- Explain the "why" not just the "how"
- Keep examples up-to-date with code

## Submitting Changes

### Pull Request Process

1. **Update your branch**:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Ensure quality**:
   - All tests pass: `npm test`
   - No lint errors: `npm run lint`
   - Build succeeds: `npm run build`
   - Documentation updated

3. **Push and create PR**:
   ```bash
   git push origin your-branch
   ```

4. **Fill out PR template**:
   - Clear description of changes
   - Link to related issues
   - Screenshots if UI changes
   - Breaking changes noted

### PR Review Process

1. Automated checks run (CI/CD)
2. Maintainer reviews code
3. Address feedback by pushing more commits
4. Once approved, PR will be merged

### PR Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] TypeScript types added/updated
- [ ] No breaking changes (or clearly marked)
- [ ] Commit messages follow convention
- [ ] Code follows style guidelines
- [ ] All checks passing

## Release Process

*For maintainers only*

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

### Release Steps

1. **Update version**:
   ```bash
   # In relevant package directory
   npm version major|minor|patch
   ```

2. **Update CHANGELOG.md**:
   ```markdown
   ## [1.2.0] - 2026-03-05
   
   ### Added
   - New feature X
   
   ### Fixed
   - Bug Y
   
   ### Changed
   - Behavior Z
   ```

3. **Commit and tag**:
   ```bash
   git add .
   git commit -m "chore: release v1.2.0"
   git tag v1.2.0
   git push origin main --tags
   ```

4. **Build and publish**:
   ```bash
   npm run build
   npm publish
   ```

5. **Create GitHub release**:
   - Go to GitHub Releases
   - Create new release from tag
   - Copy CHANGELOG entry
   - Publish release

## Getting Help

- **Questions**: Open a discussion on GitHub
- **Bugs**: Open an issue with reproduction steps
- **Features**: Open an issue to discuss before implementing
- **Security**: Email security@example.com (do not open public issue)

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in relevant documentation

Thank you for contributing to React PKL! 🎉
