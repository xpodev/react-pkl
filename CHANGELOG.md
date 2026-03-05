# Changelog

All notable changes to React PKL will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Comprehensive test suite
- Plugin sandboxing and isolation
- Hot module replacement support
- Performance monitoring
- CLI tool for scaffolding plugins
- Plugin marketplace template

## [0.1.0] - 2026-03-05

### Added
- Initial release
- `PluginManager` for standalone mode plugin management
- `PluginClient` for remote plugin loading
- `PluginRegistry` for plugin storage and events
- `ResourceTracker` for automatic resource cleanup
- React integration with `PluginProvider` and `PluginSlot`
- React hooks: `usePlugins`, `useEnabledPlugins`, `usePlugin`, `usePluginMeta`, `useSlotComponents`
- SDK build tool with esbuild integration
- TypeScript support with full type safety
- Comprehensive documentation
- Example application, SDK, and plugins

### Core Package (@react-pkl/core@0.1.0)
- Plugin lifecycle management (add, enable, disable, remove)
- Automatic resource cleanup when plugins are disabled
- Event system for plugin state changes
- Type-safe context passing to plugins
- Support for both synchronous and asynchronous plugin loading

### SDK Package (@react-pkl/sdk@0.1.0)
- `buildPlugin()` function for bundling plugins
- Support for ESM and CJS output formats
- Automatic React/JSX transformation
- CSS bundling support
- Custom metadata generation
- Sourcemap generation
- Minification support

---

## Version History Format

Each version should document changes in these categories:

### Added
New features and capabilities

### Changed
Changes in existing functionality

### Deprecated
Features that will be removed in future versions

### Removed
Features that have been removed

### Fixed
Bug fixes

### Security
Security vulnerability fixes

---

## Migration Guides

### Migrating to 1.0.0 (Future)

When we reach 1.0.0, breaking changes will be documented here with migration steps.

Example:
```typescript
// Before (0.x)
manager.addPlugin(plugin);

// After (1.x)
await manager.add(plugin);
```

---

## Release Notes

Detailed release notes are available on [GitHub Releases](https://github.com/xpodev/react-pkl/releases).
