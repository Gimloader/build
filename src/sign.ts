import fsp from "node:fs/promises";
import { getConfig, getOutfile } from "./build/getConfig.js";
import { ConfigSchema, SingleConfigSchema } from "./build/schema.js";
import { handleError } from "./util.js";
import { workspaceAutoalias } from "./build/build.js";

export default async function sign(args: any) {
    try {
        const configImport = await getConfig();
        const config = ConfigSchema.parse(configImport);
        
        let filePaths: string[] = [];
        if(config.type !== "workspace") {
            filePaths.push(getOutfile(config));
        } else {
            await workspaceAutoalias(config);
            
            let scriptPaths: string[];
            if(args.all) scriptPaths = Object.values(config.alias);
            else scriptPaths = args.path.map((p: string) => config.alias[p.toLowerCase()] ?? p);

            if(scriptPaths.length === 0) throw new Error("No path(s) specified to build!");

            // Load the config files for all the scripts and get their output paths
            await Promise.all(scriptPaths.map(async (path) => {
                const singleConfigImport = await getConfig(path);
                const singleConfig = SingleConfigSchema.parse(singleConfigImport);
                filePaths.push(getOutfile(singleConfig, config, path));
            }));
        }
    
        const text = await fsp.readFile(args.jwk, "utf-8");
        const jwk = JSON.parse(text);
        const key = await crypto.subtle.importKey("jwk", jwk, { name: "Ed25519" }, false, ["sign"]);

        const results = await Promise.allSettled(filePaths.map(path => signFile(path, key)));
        
        let succeeded = 0;
        for(let i = 0; i < results.length; i++) {
            const result = results[i];
            if(result.status === "rejected") {
                console.error(`Failed to sign ${filePaths[i]}. Does it exist?`);
            } else {
                succeeded++;
            }
        }

        if(succeeded === 1) console.log("Signed 1 file.");
        else console.log(`Signed ${succeeded} files.`);
    } catch(e) {
        handleError(e);
    }
}

const signatureRegex = /\n\s*\*\s*@signature \S+\n/g;
async function signFile(path: string, key: CryptoKey) {
    let text = await fsp.readFile(path, "utf-8");

    // Remove an @signature header if it exists
    text = text.replaceAll("\r\n", "\n").replace(signatureRegex, "\n");
    
    const data = new TextEncoder().encode(text);
    const signatureData = await crypto.subtle.sign({ name: "Ed25519" }, key, data);
    const signature = Buffer.from(signatureData).toString("base64");
    
    const headerEnd = text.indexOf("*/");
    const insertAt = text.lastIndexOf("\n", headerEnd) + 1;
    const header = ` * @signature ${signature}\n`;
    text = text.slice(0, insertAt) + header + text.slice(insertAt);

    await fsp.writeFile(path, text, "utf-8");
}