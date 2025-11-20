import esbuild, { BuildOptions, type BuildContext } from 'esbuild';
import { configFiles, createEsbuildConfig, getConfig } from '../build/getConfig.js';
import chokidar from 'chokidar';
import { join } from 'path';
import fs from 'fs/promises';
import Poller from './poller.js';
import waitForEnter from './manual.js';
import { formatTime, handleError } from '../util.js';
import { ConfigSchema, SingleConfigSchema, SingleConfigSchemaType } from '../build/schema.js';
import { logRebuildPlugin } from "./plugins.js";
import { workspaceAutoalias } from '../build/build.js';

export default async function serve(args: any) {
    const rootConfigImport = await getConfig();
    let rootConfig = ConfigSchema.parse(rootConfigImport);
    if(rootConfig.type === "workspace" && !args.path) {
        console.error("No path specified to serve!");
        return;
    }

    if(rootConfig.type === "workspace") {
        await workspaceAutoalias(rootConfig);
    }

    let childConfig: SingleConfigSchemaType | null = null;
    let singleConfig: SingleConfigSchemaType;

    const poller = new Poller();
    const onCodeUpdate = async (path?: string) => {
        if(!path) return;

        let newCode = await fs.readFile(path, 'utf-8');
        poller.updateCode(newCode);
    }

    let ctx: BuildContext | null = null;
    const makeWatcher = async () => {
        if(ctx) ctx.dispose();

        try {
            let buildConfig: BuildOptions;
            if(rootConfig.type === "workspace") {
                const path = rootConfig.alias[args.path.toLowerCase()] ?? args.path;
                buildConfig = createEsbuildConfig(childConfig!, rootConfig, path);
            } else {
                buildConfig = createEsbuildConfig(rootConfig);
            }

            buildConfig.plugins?.push(logRebuildPlugin(() => {
                onCodeUpdate(buildConfig.outfile);
            }));

            ctx = await esbuild.context(buildConfig);
            await ctx.watch();
        } catch(e) {
            handleError(e);
        }
    }

    const buildPlugin = async () => {
        process.stdout.write("\x1b[2K\rBuilding...");
    
        try {
            let start = performance.now();

            let buildConfig: BuildOptions;
            if(rootConfig.type === "workspace") {
                const path = rootConfig.alias[args.path.toLowerCase()] ?? args.path;
                buildConfig = createEsbuildConfig(singleConfig, rootConfig, path);
            } else {
                buildConfig = createEsbuildConfig(singleConfig);
            }

            await esbuild.build(buildConfig);
    
            console.log(`\rBuild completed in ${formatTime(performance.now() - start)}`);
            onCodeUpdate(buildConfig.outfile);
        } catch {}
    }

    if(rootConfig.type === "workspace") {
        const path = rootConfig.alias[args.path.toLowerCase()] ?? args.path;
        const files = configFiles.map(f => join(path, f));
        
        // Import the single config for what we're serving
        const singleImport = await getConfig(path);
        childConfig = SingleConfigSchema.parse(singleImport);
        singleConfig = childConfig;
        
        // Watch the single config files for changes
        chokidar.watch(files, { ignoreInitial: true }).on("change", async () => {
            const newSingleImport = await getConfig(path);
            childConfig = SingleConfigSchema.parse(newSingleImport);
            singleConfig = childConfig;
            
            if(!args.manual) {
                console.log("Gimloader config changed, rebuilding...");
                makeWatcher();
            }
        });
    } else {
        singleConfig = rootConfig;
    }

    // Watch the root file for changes
    chokidar.watch(configFiles, { ignoreInitial: true }).on("change", async () => {
        const newRootImport = await getConfig();
        rootConfig = ConfigSchema.parse(newRootImport);
        if(rootConfig.type === "workspace") {
            await workspaceAutoalias(rootConfig);
        } else {
            singleConfig = rootConfig;
        }

        if(!args.manual) {
            console.log("Gimloader config changed, rebuilding...");
            makeWatcher();
        }
    });

    if(args.manual) {
        let isBuilding = true;

        waitForEnter(() => {
            if(isBuilding) return;

            isBuilding = true;
            buildPlugin().finally(() => isBuilding = false);
        }, "Press Enter to rebuild, and press Ctrl+C to exit\nPress enter to build...")

        buildPlugin().finally(() => isBuilding = false);
    } else {
        makeWatcher();
    }
}
