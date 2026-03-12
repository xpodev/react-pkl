# Building React PKL

This guide explains how to build the React PKL monorepo and documentation locally.

## Prerequisites

- Node.js 18+ 
- npm 7+ (for workspaces support)
- Ruby 2.7+ and Bundler (for documentation only)

## Quick Start

### Build Code

```bash
# Install all dependencies
npm install

# Build everything
npm run build

# Start the example app in development mode
npm run dev:app
```

### Build Documentation

```bash
# Install Jekyll dependencies (first time only)
npm run docs:install

# Serve documentation locally with live reload
npm run docs

# Or use the explicit command
npm run docs:serve
```

Visit `http://localhost:4000/react-pkl/` to view the docs.

**Alternative (without npm):**

```bash
cd docs
bundle install
bundle exec jekyll serve --livereload
```

## Project Structure

```
react-pkl/
├── packages/
│   ├── core/          # @pkl.js/react - Core plugin system
│   └── sdk/           # @pkl.js/react-sdk - Build tools for plugins
└── examples/
    ├── sdk/           # example-sdk - Custom SDK built on core
    ├── plugins/       # example-plugins - Sample plugins
    └── app/           # example-app - Host application
```

## Build Scripts

### Building Packages

```bash
# Build core package only
npm run build:core

# Build SDK package only
npm run build:sdk

# Build both core and SDK packages
npm run build:packages
```

### Building Examples

```bash
# Build example SDK
npm run build:example-sdk

# Build example plugins
npm run build:plugins

# Build both example SDK and plugins
npm run build:examples

# Build example app (production build)
npm run build:app
```

### Build Everything

```bash
# Build all packages and examples in order
npm run build:all

# Or use the default build script (same as build:all)
npm run build
```

## Development Mode

Watch mode rebuilds automatically when files change:

```bash
# Watch core package
npm run dev:core

# Watch SDK package
npm run dev:sdk

# Watch example SDK
npm run dev:example-sdk

# Watch example plugins
npm run dev:plugins

# Start example app dev server (Vite)
npm run dev:app
```

### Typical Development Workflow

When developing, you'll want to run multiple watch processes:

**Terminal 1 - Watch example SDK:**
```bash
npm run dev:example-sdk
```

**Terminal 2 - Watch example plugins:**
```bash
npm run dev:plugins
```

**Terminal 3 - Run app dev server:**
```bash
npm run dev:app
```

This way, changes to the SDK and plugins automatically rebuild and hot-reload in the app.

## Clean Build Artifacts

```bash
# Clean all dist folders
npm run clean

# Clean everything including app dist
npm run clean:all
```

## Build Order

The monorepo has dependencies between packages. The correct build order is:

1. **packages/core** - No dependencies
2. **packages/sdk** - Depends on core
3. **examples/sdk** - Depends on core
4. **examples/plugins** - Depends on example-sdk
5. **examples/app** - Depends on example-sdk and example-plugins

The build scripts handle this automatically when you use `npm run build` or `npm run build:all`.

## Individual Package Builds

You can also build individual packages directly:

```bash
# Build core package
cd packages/core
npm run build

# Build example SDK
cd examples/sdk
npm run build

# Build example app
cd examples/app
npm run build
```

## Troubleshooting

### Build Fails with "Module not found"

Make sure dependencies are installed:
```bash
npm install
```

### Changes Not Reflected

1. Clean build artifacts:
   ```bash
   npm run clean:all
   ```

2. Rebuild:
   ```bash
   npm run build
   ```

3. If still having issues, reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

### TypeScript Errors

Make sure you've built the packages in the correct order. Core must be built before SDK, and SDK must be built before examples.

```bash
npm run build:packages    # Build core and SDK first
npm run build:examples    # Then build examples
```

## Production Builds

For production:

```bash
# Build all packages and examples
npm run build:all

# Build and serve the example app
cd examples/app
npm run build
npx serve -s dist
```

## Testing Builds

After building, you can test the example app:

```bash
# Development server (with HMR)
npm run dev:app

# Production build preview
cd examples/app
npm run build
npx serve -s dist
```

Open http://localhost:3000 (or the port shown) to view the app.

## IDE Setup

For the best development experience:

1. **VS Code**: Install the recommended extensions
   - ESLint
   - TypeScript and JavaScript Language Features
   - Prettier

2. **TypeScript**: The project includes workspace TypeScript configs
   - Root `tsconfig.json` - Base config
   - Each package has its own `tsconfig.json`

3. **Hot Module Replacement**: Works automatically with Vite in dev mode

## Building Documentation

The documentation is built with Jekyll and deployed to GitHub Pages.

### Prerequisites

**Option 1: Ruby and Jekyll**

```bash
# Install Ruby (if not already installed)
# Windows: https://rubyinstaller.org/
# macOS: brew install ruby
# Linux: sudo apt-get install ruby-full

# Install Bundler
gem install bundler
```

**Option 2: Docker** (no Ruby needed)

Just have Docker installed.

### Local Development

**Using npm scripts (Recommended):**

```bash
# Install Jekyll dependencies (first time only)
npm run docs:install

# Serve with live reload
npm run docs
# or
npm run docs:serve

# Build static site
npm run docs:build

# Clean build artifacts
npm run docs:clean
```

**Direct Jekyll commands:**

```bash
# Navigate to docs directory
cd docs

# Install dependencies (first time only)
bundle install

# Serve with live reload
bundle exec jekyll serve --livereload

# Or without live reload
bundle exec jekyll serve
```

**With Docker:**

```bash
# From the docs directory
docker run --rm -v "$PWD:/srv/jekyll" -p 4000:4000 jekyll/jekyll jekyll serve --watch
```

Visit `http://localhost:4000/react-pkl/` to view the documentation.

### Build Static Site

**Using npm:**

```bash
npm run docs:build
```

**Direct Jekyll:**

```bash
cd docs
bundle exec jekyll build

# Output in docs/_site/
```

### Documentation Structure

```
docs/
├── _config.yml           # Jekyll configuration
├── Gemfile              # Ruby dependencies
├── index.md             # Documentation hub
├── GETTING_STARTED.md   # Tutorial
├── API.md               # API reference
├── ARCHITECTURE.md      # Architecture guide
├── THEME_SYSTEM.md      # Theme system guide
└── ...                  # Other docs
```

### Making Changes

1. Edit markdown files in `docs/`
2. Jekyll automatically rebuilds (if using `--livereload`)
3. Refresh browser to see changes

**Note:** Changes to `_config.yml` require restarting Jekyll.

### Deployment

Documentation is automatically deployed via GitHub Actions:

1. Push to `main` branch
2. Workflow runs (`.github/workflows/pages.yml`)
3. Jekyll builds the site
4. Deploys to `https://xpodev.github.io/react-pkl/`

No manual deployment needed!

### Troubleshooting

**Port 4000 already in use:**
```bash
bundle exec jekyll serve --port 4001
```

**Theme not found:**
```bash
cd docs
rm -rf _site Gemfile.lock
bundle install
bundle exec jekyll serve
```

**Changes not appearing:**
- Jekyll caches files - try stopping server and running:
  ```bash
  bundle exec jekyll clean
  bundle exec jekyll serve
  ```

## Common Commands Summary

### Code Build Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run build` | Build everything |
| `npm run build:packages` | Build core and SDK packages |
| `npm run build:examples` | Build example SDK and plugins |
| `npm run build:app` | Build example app (production) |
| `npm run build:all` | Full build of everything |
| `npm run dev:app` | Start dev server for example app |
| `npm run dev:core` | Watch mode for core package |
| `npm run dev:sdk` | Watch mode for SDK package |
| `npm run dev:example-sdk` | Watch mode for example SDK |
| `npm run dev:plugins` | Watch mode for example plugins |
| `npm run clean` | Clean workspace build artifacts |
| `npm run clean:all` | Remove all build artifacts |

### Documentation Commands

| Command | Description |
|---------|-------------|
| `npm run docs:install` | Install Jekyll dependencies |
| `npm run docs` | Serve docs with live reload |
| `npm run docs:serve` | Serve docs with live reload |
| `npm run docs:build` | Build static documentation site |
| `npm run docs:clean` | Clean documentation build artifacts |

## CI/CD

For continuous integration:

```bash
# Fresh install and build
npm ci
npm run build:all
npm run test
```

This ensures a clean build from scratch.
