# React PKL

React PKL is a typesafe plugin system for react written in TypeScript.

This system allows extending a React application from external sources.
Plugins are modules that can extend the UI. They can access a hosting context
that can be configured (in a typesafe way) to any structure.

The system can work in 2 modes:
* Standalone - The system is reponsible for managin plugins. It can add, enable, disable and remove plugins on demand.
* Client Mode - The system is fetching plugins from a known source. Suitable for use alongside a server that provides the plugins.

In Client Mode, plugins are views into the server so it is not possible to manage plugins. Doing so should be done on the server
side (which is out of the scope of this library).

That is, the library provides an optional plugin manager.

## Application API

Plugins can use the API provided by the host via the host context.
This context is user-defined.

## Plugin SDK

The library also provides a tool for bundling plugins.
The build process should:
1. Compile all sources to JS, HTML and CSS (if relevant).
2. Bundle all compiled sources and resources into a single directory.
3. Optionally add metadata (This can be configured by the build process).

This chain allows integrating into existing plugin systems which can define their own metadata.

For example, a system that uses server-side plugins with optional client-side views might not want
to have metadata for the frontend since the frontend extensions are part of a bigger plugin. So they can
make their own tool for building and provide a metadata generation function that does not generate any
metadata.


## Usage

This library is not intended to be used by plugin developers. Instead, it is meant to be
used by SDK developers. Developers should use the library to make their SDK and the plugin
developers should then use the SDK. So this is an indirect dependency for plugin developers.


The intended usage is that SDK developers define places in the UI which plugins can add components. For example, a dashboard UI can have a sidebar and they can allow plugins to 
add entries to the sidebar.

This means that a single plugin can provide multiple components. These components can be
registered at any time in any place allowed. (Maybe we can make a nice hook for a plugin
extension points).

So when a plugin is initialized/enabled, it should register its components where it needs to.

In Standalone Mode, each registration should be managed so that when a plugin is disabled, 
all of its registered components in all the extension points should be removed.
This is similar to how an OS frees all resources when a process exits.
