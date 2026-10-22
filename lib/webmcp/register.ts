import type { DirectoryTool } from "./tools";

// Local types keep the draft API optional without patching global DOM types.
export type ModelContext = {
  registerTool: (tool: DirectoryTool, options?: { signal: AbortSignal }) => void | Promise<void>;
  unregisterTool?: (name: string) => void;
};

export function getModelContext(document: { modelContext?: ModelContext }, navigator: { modelContext?: ModelContext }) {
  if (typeof document.modelContext?.registerTool === "function") return document.modelContext;
  if (typeof navigator.modelContext?.registerTool === "function") return navigator.modelContext;
  return null;
}

// Serialize mounts so a late legacy registration cannot remove a new mount's
// tool during React Strict Mode, route transitions, or hot reload.
const queues = new WeakMap<ModelContext, Promise<void>>();

export function registerDirectoryTools(context: ModelContext, tools: DirectoryTool[], reportError: (error: unknown) => void = console.warn) {
  const controller = new AbortController();
  const registered = new Set<string>();
  const removeLegacyTools = () => {
    for (const name of registered) {
      try { context.unregisterTool?.(name); } catch (error) { reportError(error); }
    }
    registered.clear();
  };
  const ready = (queues.get(context) ?? Promise.resolve()).then(async () => {
    for (const tool of tools) {
      if (controller.signal.aborted) break;
      try {
        await context.registerTool(tool, { signal: controller.signal });
        registered.add(tool.name);
        if (controller.signal.aborted) removeLegacyTools();
      } catch (error) {
        if (!controller.signal.aborted) reportError(error);
      }
    }
  });
  queues.set(context, ready);
  return {
    ready,
    dispose() {
      controller.abort(); // Current WebMCP uses the registration signal.
      removeLegacyTools(); // Earlier navigator/document implementations.
    },
  };
}
