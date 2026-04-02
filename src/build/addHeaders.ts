import { Dependency } from '../types.js';
import { SingleConfigSchemaType } from './schema.js';

function formatDep(dep: Dependency) {
    if (typeof dep === "string") return dep;
    return `${dep.name}${dep.url ? ` | ${dep.url}` : ""}`
}

export function createHeader(config: SingleConfigSchemaType) {
    let meta = `/**
 * @name ${config.name}
 * @description ${config.description}
 * @author ${config.author}`;
   
    if(config.version) meta += `\n * @version ${config.version}`;
    if(config.downloadUrl) meta += `\n * @downloadUrl ${config.downloadUrl}`;
    if(config.webpage) meta += `\n * @webpage ${config.webpage}`;

    if(config.reloadRequired === true) meta += '\n * @reloadRequired true';
    else if(config.reloadRequired === "ingame") meta += '\n * @reloadRequired ingame';
    else if(config.reloadRequired === "notingame") meta += '\n * @reloadRequired notingame';

    const libs = config.needsLibs ?? config.libs;
    if(libs) {
        for(let lib of libs) {
            meta += `\n * @needsLib ${formatDep(lib)}`;
        }
    }

    if(config.optionalLibs) {
        for(let lib of config.optionalLibs) {
            meta += `\n * @optionalLib ${formatDep(lib)}`;
        }
    }

    if(config.needsPlugins) {
        for(let plugin of config.needsPlugins) {
            meta += `\n * @needsPlugin ${formatDep(plugin)}`;
        }
    }

    if(!config.isLibrary && config.hasSettings) {
        meta += '\n * @hasSettings true'
    }
    
    if(config.gamemodes) {
        for(let gamemode of config.gamemodes) {
            meta += `\n * @gamemode ${gamemode}`;
        }
    }
    
    if(config.changelog) {
        for(let change of config.changelog) {
            meta += `\n * @changelog ${change}`;
        }
    }

    if(config.isLibrary) meta += '\n * @isLibrary true';
    if(config.deprecated !== undefined) meta += `\n * @deprecated ${config.deprecated}`;
    meta += '\n */';
   
    return meta;
}