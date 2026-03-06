---
sidebar_position: 1
title: Documentation
slug: /
---

# React PKL Documentation

Welcome to the React PKL v0.2.0 documentation! This guide will help you navigate all available documentation.

> 🚀 **Quick Start**: Jump to [Getting Started Guide](./GETTING_STARTED) to build your first plugin system.
> 
> 🆕 **v0.2.0 Highlights**: Context-driven architecture, theme system with layout overrides, style context, and static plugin support!

## 📚 Documentation Overview

### For Getting Started

1. **[Getting Started Guide](./GETTING_STARTED)** - Step-by-step tutorial for creating your first plugin system
2. **[Examples Guide](./EXAMPLES)** - Detailed walkthrough of example applications and plugins

### For Development

3. **[API Reference](./API)** - Complete API documentation for all classes, methods, and types (v0.2.0 updated)
4. **[Quick Reference](./QUICK_REFERENCE)** - Fast lookup for common tasks and code snippets
5. **[Advanced Usage](./ADVANCED)** - Advanced patterns, techniques, and best practices
6. **[Theme System](./THEME_SYSTEM)** - Comprehensive guide to the v0.2.0 theme system ⭐ NEW

### For Understanding

7. **[Architecture Overview](./ARCHITECTURE)** - System design, data flow, and architectural decisions (v0.2.0 updated)
8. **[Contributing Guide](./CONTRIBUTING)** - How to contribute to the project

## 📖 Reading Path by Role

### I'm building a plugin system

1. Read [Getting Started Guide](./GETTING_STARTED) to create your SDK
2. Review [Theme System](./THEME_SYSTEM) to understand theming capabilities (v0.2.0)
3. Check [Examples Guide](./EXAMPLES) to see how it works in practice
4. Refer to [API Reference](./API) as you build
5. Use [Advanced Usage](./ADVANCED) for sophisticated features

### I'm developing plugins

1. Your SDK should provide its own documentation
2. Use [Quick Reference](./QUICK_REFERENCE) for common patterns
3. Check [Theme System](./THEME_SYSTEM) if building a theme plugin
4. Check [Examples Guide](./EXAMPLES) for plugin examples
5. Refer to your SDK's documentation for context-specific APIs

### I'm contributing to React PKL

1. Study [Architecture Overview](./ARCHITECTURE) to understand the v0.2.0 system
2. Follow [Contributing Guide](./CONTRIBUTING) for development workflow
3. Use [API Reference](./API) to understand the codebase

### I'm evaluating React PKL

1. Browse [Examples Guide](./EXAMPLES) to see it in action
2. Check [Architecture Overview](./ARCHITECTURE) for design decisions (v0.2.0 updated)
3. Review [API Reference](./API) to assess API quality
4. Explore [Theme System](./THEME_SYSTEM) to understand theming capabilities

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

## 🔍 Finding Information

### I want to...

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

## 💡 Tips for Using Documentation

### For Learning

1. Follow Getting Started Guide step-by-step
2. Study Examples Guide to see real code
3. Keep Quick Reference handy while coding
4. Dive into Advanced Usage when needed

### For Reference

1. Use Quick Reference for fast lookups
2. Consult API Reference for detailed specs
3. Check Examples Guide for patterns
4. Review Advanced Usage for complex scenarios

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
