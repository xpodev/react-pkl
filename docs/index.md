---
layout: default
title: Documentation
nav_order: 1
---

# React PKL Documentation

Welcome to the React PKL v0.2.0 documentation! This guide will help you navigate all available documentation.

> 🚀 **Quick Start**: Jump to [Getting Started Guide](./GETTING_STARTED) to build your first plugin system.
> 
> 🆕 **v0.2.0 Highlights**: Context-driven architecture, theme system with layout overrides, style context, and static plugin support!

## 📚 Documentation Overview

### For Getting Started

1. **[Project Overview](../)** - Project overview, quick start, and feature summary (v0.2.0 updated)
2. **[Getting Started Guide](./GETTING_STARTED)** - Step-by-step tutorial for creating your first plugin system
3. **[Examples Guide](./EXAMPLES)** - Detailed walkthrough of example applications and plugins

### For Development

4. **[API Reference](./API)** - Complete API documentation for all classes, methods, and types (v0.2.0 updated)
5. **[Quick Reference](./QUICK_REFERENCE)** - Fast lookup for common tasks and code snippets
6. **[Advanced Usage](./ADVANCED)** - Advanced patterns, techniques, and best practices
7. **[Theme System](./THEME_SYSTEM)** - Comprehensive guide to the v0.2.0 theme system ⭐ NEW

### For Understanding

8. **[Architecture Overview](./ARCHITECTURE)** - System design, data flow, and architectural decisions (v0.2.0 updated)
9. **[Contributing Guide](./CONTRIBUTING)** - How to contribute to the project

## 📖 Reading Path by Role

### I'm building a plugin system

1. Start with the [Project Overview](../) to understand what React PKL is
2. Read [Getting Started Guide](./GETTING_STARTED) to create your SDK
3. Review [Theme System](./THEME_SYSTEM) to understand theming capabilities (v0.2.0)
4. Check [Examples Guide](./EXAMPLES) to see how it works in practice
5. Refer to [API Reference](./API) as you build
6. Use [Advanced Usage](./ADVANCED) for sophisticated features

### I'm developing plugins

1. Your SDK should provide its own documentation
2. Use [Quick Reference](./QUICK_REFERENCE) for common patterns
3. Check [Theme System](./THEME_SYSTEM) if building a theme plugin
4. Check [Examples Guide](./EXAMPLES) for plugin examples
5. Refer to your SDK's documentation for context-specific APIs

### I'm contributing to React PKL

1. Read the [Project Overview](../) for project overview
2. Study [Architecture Overview](./ARCHITECTURE) to understand the v0.2.0 system
3. Follow [Contributing Guide](./CONTRIBUTING) for development workflow
4. Use [API Reference](./API) to understand the codebase

### I'm evaluating React PKL

1. Read the [Project Overview](../) for features and benefits
2. Browse [Examples Guide](./EXAMPLES) to see it in action
3. Check [Architecture Overview](./ARCHITECTURE) for design decisions (v0.2.0 updated)
4. Review [API Reference](./API) to assess API quality
5. Explore [Theme System](./THEME_SYSTEM) to understand theming capabilities

## 🆕 What's New in v0.2.0

### Context-Driven Architecture
Components use hooks instead of props, eliminating prop drilling:
```tsx
// Old
<AppHeader toolbar={items} user={user} />

// New
function AppHeader() {
  const { toolbar } = useAppLayout();
  const { user } = useAppContext();
}
```

### Theme System
Plugins can override entire layout components:
```typescript
onThemeEnable(slots) {
  slots.set(AppHeader, DarkHeader);
  slots.set(AppSidebar, DarkSidebar);
}
```

### Style Context
Type-safe theme variables:
```tsx
const styles = useStyles();
<div style={{ background: styles.bgPrimary }}>...</div>
```

### Static Plugins
Plugins without lifecycle methods for simple extensions:
```typescript
export default {
  meta: { id: 'toolbar', name: 'Toolbar', version: '1.0.0' },
  entrypoint: () => <Button />
};
```

See [Architecture](./ARCHITECTURE) and [Theme System](./THEME_SYSTEM) for full details.

## 📝 Document Summaries

### README.md
**Length:** ~400 lines  
**Audience:** Everyone  
**Status:** Updated for v0.2.0 ✅  
**Content:**
- Project overview and features
- Quick start with v0.2.0 patterns
- Installation instructions
- Context-driven components
- Theme system examples
- Style context usage
- Core concepts (slots, themes, cleanup)

### API Reference
**Length:** ~700 lines  
**Audience:** Developers using the API  
**Status:** Updated for v0.2.0 ✅  
**Content:**
- PluginHost API (new in v0.2.0)
- Theme management methods
- PluginModule interface with theme hooks
- React hooks (useAppContext, useAppLayout, useStyles, etc.)
- Style context API
- Complete type definitions
- Migration guide from v0.1.0

### Architecture Overview
**Length:** ~500 lines  
**Audience:** System designers, contributors  
**Status:** Updated for v0.2.0 ✅  
**Content:**
- v0.2.0 system architecture
- PluginHost and theme management
- Context-driven component pattern
- Layout slots and overrides
- Style context system
- Data flow diagrams
- Advanced patterns

### Theme System Guide
**Length:** ~500 lines  
**Audience:** Theme plugin developers  
**Status:** New in v0.2.0 ⭐  
**Content:**
- Complete theme system documentation
- onThemeEnable/onThemeDisable hooks
- Layout slot overrides
- Style context integration
- Dark theme implementation example
- Best practices

### Getting Started Guide
**Length:** ~800 lines  
**Audience:** SDK developers, first-time users  
**Content:**
- Step-by-step SDK creation
- Context definition
- Slot system setup
- React integration
- First plugin creation
- Building and testing
- Return value details
- Usage examples

### Quick Reference
**Length:** ~400 lines  
**Audience:** Experienced users  
**Content:**
- Fast lookup cheat sheet
- Common code snippets
- Debugging tips
- Pattern cookbook
- Quick examples

### Advanced Usage
**Length:** ~600 lines  
**Audience:** Advanced users  
**Content:**
- Resource cleanup patterns
- Event systems
- Plugin communication
- Client mode setup
- Performance optimization
- Security considerations
- Testing strategies

### Examples Guide
**Length:** ~600 lines  
**Audience:** Learning by example  
**Content:**
- Example project walkthrough
- Plugin comparisons
- Common patterns
- Troubleshooting
- Building examples

### Architecture Overview
**Length:** ~400 lines  
**Audience:** Contributors, architects  
**Content:**
- System architecture
- Component responsibilities
- Data flow diagrams
- Type system design
- Design principles

### Contributing Guide
**Length:** ~700 lines  
**Audience:** Contributors  
**Content:**
- Development setup
- Coding standards
- Testing guidelines
- PR process
- Release workflow

## 🔍 Finding Information

### I want to...

**...understand what React PKL is**
→ [Project Overview](../)

**...create my first plugin system**
→ [Getting Started Guide](./GETTING_STARTED)

**...look up a specific API**
→ [API Reference](./API)

**...find a code snippet quickly**
→ [Quick Reference](./QUICK_REFERENCE)

**...implement an advanced feature**
→ [Advanced Usage](./ADVANCED)

**...see working examples**
→ [Examples Guide](./EXAMPLES)

**...understand the theme system**
→ [Theme System Guide](./THEME_SYSTEM)

**...understand the architecture**
→ [Architecture Overview](./ARCHITECTURE)

**...contribute to the project**
→ [Contributing Guide](./CONTRIBUTING)

**...check version history**
→ [CHANGELOG](../CHANGELOG)

## 💡 Tips for Using Documentation

### For Learning

1. Start with the Project Overview for overview
2. Follow Getting Started Guide step-by-step
3. Study Examples Guide to see real code
4. Keep Quick Reference handy while coding
5. Dive into Advanced Usage when needed

### For Reference

1. Use Quick Reference for fast lookups
2. Consult API Reference for detailed specs
3. Check Examples Guide for patterns
4. Review Advanced Usage for complex scenarios

### For Contributing

1. Review Architecture Overview first
2. Follow Contributing Guide strictly
3. Reference API Reference for consistency
4. Study examples before making changes

## 📦 Package-Specific Docs

### @react-pkl/core
**Location:** [packages/core](../packages/core/)  
**Content:** Core package overview, installation, basic usage

### @react-pkl/sdk
**Location:** [packages/sdk](../packages/sdk/)  
**Content:** Build tools overview, configuration options, examples

## 🆘 Getting Help

### Where to ask questions

- **General questions:** GitHub Discussions
- **Bug reports:** GitHub Issues (with reproduction)
- **Feature requests:** GitHub Issues (with use case)
- **Security issues:** Email (see Contributing Guide)

### Before asking

1. Check this documentation index
2. Search existing GitHub issues
3. Review examples in [Examples Guide](./EXAMPLES)
4. Try debugging with [Quick Reference](./QUICK_REFERENCE)

## 🔄 Keeping Up to Date

- **Changes:** Check [CHANGELOG](../CHANGELOG)
- **New features:** Watch GitHub releases
- **Examples:** Browse [examples/](../examples/) directory
- **Best practices:** Read [Advanced Usage](./ADVANCED)

## ✅ Documentation Checklist

When learning React PKL:

- [ ] Read the Project Overview
- [ ] Complete Getting Started Guide
- [ ] Run and explore examples
- [ ] Bookmark Quick Reference
- [ ] Understand your use case (standalone vs client mode)
- [ ] Create a simple test plugin
- [ ] Read relevant advanced topics

When building with React PKL:

- [ ] Define your application context
- [ ] Create your SDK layer
- [ ] Define extension points (slots)
- [ ] Set up React integration
- [ ] Test with sample plugins
- [ ] Write SDK documentation for your plugin developers

When contributing to React PKL:

- [ ] Read Architecture Overview
- [ ] Follow Contributing Guide
- [ ] Set up development environment
- [ ] Write tests for changes
- [ ] Update relevant documentation
- [ ] Submit PR following guidelines

## 📄 Documentation Standards

All React PKL documentation follows these principles:

1. **Clear Examples** - Every concept has code examples
2. **Progressive Disclosure** - Simple first, complex later
3. **Cross-References** - Links between related topics
4. **Up-to-Date** - Maintained with code changes
5. **Practical Focus** - Real-world usage over theory

## 🎯 Next Steps

**Choose your path:**

- 🚀 [Get Started](./GETTING_STARTED) - Build your first plugin system
- 📖 [Read Examples](./EXAMPLES) - Learn from working code
- 🔧 [API Reference](./API) - Look up specific APIs
- 🎨 [Theme System](./THEME_SYSTEM) - Master theming
- 🎓 [Advanced Usage](./ADVANCED) - Master advanced techniques
- 🤝 [Contribute](./CONTRIBUTING) - Help improve React PKL

---

**Happy coding with React PKL!** 🎉

For questions, issues, or contributions, visit the [GitHub Repository](https://github.com/xpodev/react-pkl).
