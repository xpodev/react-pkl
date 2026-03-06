Now that everything works it's time to continue.

First off, let's commit all changes and move to a branch for `v0.2.0`.


After you've done that, it's time for a bit of reachitecture.

I want the application developer to be able to define the application as a layout rather than
actual components.

That is, the application developer can create special slots for single components.
For example, a `HeaderSlot`. These kind of layout slots can be replaced by plugins.
This is mainly useful for theme plugins.
When a plugin provides a component for that slot, the provided component should have
the same signature as the slot requires. So, for example, a `Header` component will get a list
of header items.

Now, instead of using the `components` attribute in the plugin module, we want it to look better.

For example, our `Header` component can be replaced by a plugin. The plugin-provided component will
get the header items as a list.


So, app dev defines the layout of the application (and provides a default implementation for it).

Only 1 plugin can be set as the plugin that can replace the layout slots components. This plugin should
provide a `layout` function that accepts the different slots as an object.


Also, we might need to change the plugin entry point to be reactive. This entrypoint should not
return anything, but should execute in the react context.



## Design Details

**Example for layout slot:**

```ts
const HeaderContext = createContext();

const Header = () => {
    // This is both the layout slot AND the default implementation.

    const { items } = useHeaderContext();

    return (
        items
    );
};

const HeaderProvider = ({children}) => {
    const [items, setItems] = React.useState([]);
    const [component, setComponent] = React.useState<Component>(null);
    const addItem = React.useCallback((item) => {
        setItems(prev => [...prev, item]);
    }, []);

    return <HeaderContext.Provider value={{items, component, setComponent, addItem}}>{children}</>
};

```


**Example for slot item:**

```ts
const HeaderItem = ({ children }: React.PropsWithChildren) => {
  const { addItem } = useHeaderContext();

  // children can be either a component or a list
  addItem(children);

  return null;
};
```


**Example how to apply theme:**

```ts
const layoutSlots = createContext(new Map<typeof Component, typeof Component>());

function applyThemePlugin(plugin) {
    const layoutSlots = useContext(layoutSlots);

    plugin.layout(layoutSlots);

    // somehow force rerender.
}

function App() {
    const layoutSlots = useContext(layoutSlots);

    return (<div>layoutSlots[Header] ? layoutSlots[Header]() :  Header()</div> </Plugins>);
}

const myPlugin = {
    layout: (slots) => {
        slots[Header] = MyHeader;
        slots[Sidebar] = MySidebar;
    },
    entrypoint: () => {
        // this is reactive and called by the <Plugins> component.
    }
}; // supposed to be a plugin module

applyThemePlugin(plugin);
```


**Plugin Module:**
```ts
interface PluginModule {
    activate()?;
    layout()?;
    deactivate()?;
    entrypoint()?;
}
```

When a plugin is disabled all of its resources should be removed. 
Layout only reverts to default if the theme plugin is disabled.
Deactivate run on disabling.
