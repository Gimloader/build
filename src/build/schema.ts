import * as z from 'zod';

export const SingleConfigSchema = z.object({
    type: z.literal("single").optional(),
    input: z.string(),
    name: z.string(),
    description: z.string(),
    author: z.string(),
    version: z.string().optional(),
    downloadUrl: z.string().optional(),
    webpage: z.string().optional(),
    reloadRequired: z.union([z.boolean(), z.literal("ingame")]).optional(),
    libs: z.array(z.string()).optional(),
    optionalLibs: z.array(z.string()).optional(),
    gamemodes: z.array(z.string()).optional(),
    outdir: z.nullable(z.string()).optional(),
    plugins: z.array(z.any()).optional(),
    esbuildOptions: z.record(z.string(), z.any()).optional(),
    isLibrary: z.boolean().optional(),
    // Not sure if there's a way to make this conditional based on isLibrary
    hasSettings: z.boolean().optional()
});

export const WorkspaceConfigSchema = z.object({
    type: z.literal("workspace"),
    relativeOutput: z.boolean().optional(),
    splitPluginsAndLibraries: z.boolean().optional(),
    outdir: z.string().optional(),
    plugins: z.array(z.any()).optional(),
    esbuildOptions: z.record(z.string(), z.any()).optional(),
    alias: z.record(z.string(), z.string()).optional().default({}).transform((obj) => {
        // make the keys lowercase
        let newObj: Record<string, string> = {};
        for(const key in obj) {
            newObj[key.toLowerCase()] = obj[key];
        }
        
        return newObj;
    })
});

export const ConfigSchema = z.discriminatedUnion("type", [
    SingleConfigSchema,
    WorkspaceConfigSchema
]);

export type ConfigSchemaType = z.infer<typeof ConfigSchema>;
export type WorkspaceConfigSchemaType = z.infer<typeof WorkspaceConfigSchema>;
export type SingleConfigSchemaType = z.infer<typeof SingleConfigSchema>;