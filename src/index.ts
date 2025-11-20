export type * from "./types.js";
import type { SingleConfig, WorkspaceConfig } from "./types.js";

export function singleConfig(config: SingleConfig) { return config; }
export function workspaceConfig(config: WorkspaceConfig) { return config; }