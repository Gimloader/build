import type { BuildOptions, Plugin } from 'esbuild';
import type { GLConfig } from '../types.js';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHeader } from './addHeaders.js';
import { SingleConfigSchemaType, WorkspaceConfigSchemaType } from './schema.js';

// In order of precedence
export const configFiles = [
    "gimloader.config.ts",
    "gimloader.config.js",
    "GL.config.js"
];

export function createEsbuildConfig(config: SingleConfigSchemaType, baseConfig?: WorkspaceConfigSchemaType, path?: string): BuildOptions {
    let input = path ? join(path, config.input) : config.input;

    let plugins: Plugin[] = [];
    if(config.plugins) plugins.push(...config.plugins);
    if(baseConfig?.plugins) plugins.push(...baseConfig.plugins);

    // Determine where to place the file
    let outfile = "";
    if(baseConfig && path) {
        if(baseConfig.relativeOutput) {
            // config > baseconfig > root of path
            if(config.outdir) outfile = join(path, config.outdir);
            else if(baseConfig.outdir) outfile = join(path, baseConfig.outdir);
            else outfile = path;
        } else {
            outfile = baseConfig.outdir ?? "build";
            if(baseConfig.splitPluginsAndLibraries) {
                const subdir = config.isLibrary ? "libraries" : "plugins";
                outfile = join(outfile, subdir);
            }
        }
    } else {
        if(config.outdir) outfile = config.outdir;
        else if(config.outdir === undefined) outfile = "build";
    }
    outfile = join(outfile, `${config.name}.js`);

    return {
        entryPoints: [input],
        mainFields: ["svelte", "browser", "module", "main"],
        conditions: ["svelte", "browser"],
        bundle: true,
        outfile,
        format: "esm",
        plugins,
        banner: {
            "js": createHeader(config)
        },
        jsx: "transform",
        jsxFactory: "GL.React.createElement",
        loader: {
            ".css": "text"
        },
        ...baseConfig?.esbuildOptions,
        ...config.esbuildOptions
    }
}

export async function getConfig(path?: string) {
    let dir = process.cwd();
    if(path) dir = join(dir, path);

    // Check if a config file exists
    let configPath: string | null = null;
    for(let file of configFiles) {
        const path = join(dir, file);
        if(existsSync(path)) {
            if(file === "GL.config.js") {
                console.warn("'GL.config.js' is deprecated. Please use 'gimloader.config.js' or 'gimloader.config.ts'.");
            }
            configPath = path;
            break;
        }
    }

    if(!configPath) throw new Error("No Gimloader config file found");

    const imported: GLConfig = await import(`${pathToFileURL(configPath).href}?t=${Date.now()}`);
    if(!imported.default) throw new Error("Gimloader config doesn't export a default value!");

    return imported.default;
}
