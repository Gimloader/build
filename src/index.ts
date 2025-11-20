export type * from "./types.js";
import type { SingleConfig, WorkspaceConfig } from "./types.js";

export function singleConfig(config: SingleConfig) { return config; }

type WorkspaceConfigTypeOptional = Omit<WorkspaceConfig, "type"> & { type?: "workspace" };
export function workspaceConfig(config: WorkspaceConfigTypeOptional): WorkspaceConfig {
    config.type = "workspace";
    return config as WorkspaceConfig;
}