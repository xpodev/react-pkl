# React PKL Documentation

This directory contains the comprehensive documentation for React PKL.

## 📖 View Documentation

**Online:** Visit [https://xpodev.github.io/react-pkl/](https://xpodev.github.io/react-pkl/)

**Locally:** Browse the markdown files in this directory.

## 📚 Available Documentation

- **[index.md](./index.md)** - Documentation index and navigation
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Step-by-step guide for beginners
- **[API.md](./API.md)** - Complete API reference
- **[EXAMPLES.md](./EXAMPLES.md)** - Example walkthrough
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference guide
- **[ADVANCED.md](./ADVANCED.md)** - Advanced usage patterns
- **[THEME_SYSTEM.md](./THEME_SYSTEM.md)** - Theme system guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture overview
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines

## 🚀 Quick Start

If you're new to React PKL:

1. Read the [main README](../README.md) for project overview
2. Follow the [Getting Started Guide](./GETTING_STARTED.md)
3. Explore the [Examples](./EXAMPLES.md)

## 🔧 GitHub Pages Setup

This documentation is configured for GitHub Pages using Jekyll:

- **Theme:** just-the-docs (Material Design style)
- **Configuration:** See `_config.yml` for settings
- **Base URL:** `/react-pkl`
- **Deployment:** Automatic via GitHub Actions (`.github/workflows/pages.yml`)

### Local Development

To preview the documentation locally with Jekyll:

#### Prerequisites

**Option 1: Using Ruby and Jekyll (Recommended)**

```bash
# Install Ruby (if not already installed)
# Windows: Download from https://rubyinstaller.org/
# macOS: brew install ruby
# Linux: sudo apt-get install ruby-full

# Install Bundler and Jekyll
gem install bundler jekyll
```

**Option 2: Using Docker (Easier)**

```bash
# No Ruby installation needed, just Docker
```

#### Build and Serve

**With Ruby/Jekyll:**

```bash
# Navigate to docs directory
cd docs

# Install dependencies (first time only)
bundle install

# Serve the documentation
bundle exec jekyll serve

# Or with live reload
bundle exec jekyll serve --livereload
```

Then visit `http://localhost:4000/react-pkl/`

**With Docker:**

```bash
# From the docs directory
docker run --rm -v "$PWD:/srv/jekyll" -p 4000:4000 jekyll/jekyll jekyll serve --watch
```

Then visit `http://localhost:4000/react-pkl/`

#### Build Only (No Server)

To build the static site without serving:

```bash
cd docs

# With Jekyll
bundle exec jekyll build

# Output will be in _site/ directory
```

#### Troubleshooting

**Port already in use:**
```bash
bundle exec jekyll serve --port 4001
```

**Theme not found:**
```bash
bundle install  # Reinstall dependencies
```

**Changes not appearing:**
- Jekyll caches files - try `bundle exec jekyll clean` then rebuild
- For `_config.yml` changes, restart the server

#### Configuration Files

- `_config.yml` - Jekyll configuration
- `Gemfile` - Ruby dependencies (if you create one)
- `.github/workflows/pages.yml` - GitHub Pages deployment workflow

### Deployment

Documentation is automatically deployed to GitHub Pages when you push to `main`:

1. GitHub Actions workflow runs (`.github/workflows/pages.yml`)
2. Jekyll builds the site
3. Deploys to `https://xpodev.github.io/react-pkl/`

No manual deployment needed!

## 📝 Contributing to Documentation

When updating documentation:

1. Follow markdown best practices
2. Keep examples up-to-date with code
3. Cross-reference related topics
4. Test links work correctly
5. Use clear, concise language

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.

## 📄 License

Same as the main project - see [../LICENSE](../LICENSE) if available.
