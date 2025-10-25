import { createEsbuildConfig, getConfig } from './getConfig.js';
import esbuild from 'esbuild';
import { ConfigSchema, SingleConfigSchema, SingleConfigSchemaType, WorkspaceConfigSchemaType } from './schema.js';
import { formatTime, handleError } from '../util.js';

export default async function build(options: any) {
    try {
        const configImport = await getConfig();
        const config = ConfigSchema.parse(configImport);

        if(config.type !== "workspace") {
            await buildSingle(config);
            return;
        }
    
        let paths: string[] = options.path;
        if(options.all) paths = Object.values(config.alias);
        else paths = paths.map((p) => config.alias[p.toLowerCase()] ?? p);
    
        if(paths.length === 0) throw new Error("No path(s) specified to build!")
        if(paths.length === 1) {
            const singleConfigImport = await getConfig(paths[0]);
            const singleConfig = SingleConfigSchema.parse(singleConfigImport);
            await buildSingle(singleConfig, config, paths[0]);
            return;
        }

        // Build all the plugins
        console.log(`Building ${paths.length} scripts`);
        await Promise.allSettled(paths.map(path => importSingle(path, config)));
        process.exit(0);
    } catch (e) {
        handleError(e);
    }
}

async function importSingle(path: string, baseConfig: WorkspaceConfigSchemaType) {
    try {
        const configImport = await getConfig(path);
        const config = SingleConfigSchema.parse(configImport);
    
        let start = performance.now();
        await esbuild.build(createEsbuildConfig(config, baseConfig, path));
        let end = performance.now();

        console.log(`Built ${config.name} in ${formatTime(end - start)}`);
    } catch(e) {
        console.error("Failed to build script at path", path);
        handleError(e);
    }
}

async function buildSingle(config: SingleConfigSchemaType, baseConfig?: WorkspaceConfigSchemaType, path?: string) {
    process.stdout.write(`Building ${config.name}...`);

    let start = performance.now();
    await esbuild.build(createEsbuildConfig(config, baseConfig, path));
    let end = performance.now();

    process.stdout.write(`\x1b[2K\rBuild finished in ${formatTime(end - start)}\n`);

    // Process.exit needed to sometimes clean up esbuild plugins
    process.exit(0);
}