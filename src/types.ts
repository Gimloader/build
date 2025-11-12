import type { BuildOptions, Plugin } from "esbuild";

export interface PluginTypes {
    /** Whether the plugin / library is a library. */
    isLibrary?: false;
    /** Whether the plugin has a settings menu. */
    hasSettings?: boolean;
}

export interface LibraryTypes {
    /** Whether the script is a library. */
    isLibrary: true;
}

interface BaseConfig {
    /** Where to output the final script */
    outdir?: string;
    /** Esbuild plugins to use when building the plugin/library */
    plugins?: Plugin[];
    /** Options to be passed to esbuild's build and context functions */
    esbuildOptions?: BuildOptions;
}

export type SingleConfig = (PluginTypes | LibraryTypes) & BaseConfig & {
    /** Whether the project is one script or a workspace with multiple */
    type?: "single";
    /** The input file that will be compiled. */
    input: string;
    /** The name of the script. This will be used as the name of the output file. */
    name: string;
    /** A brief description of the script. */
    description: string;
    /** The author of the script. */
    author: string;
    /** The version of the script. */
    version?: string;
    /** A URL to get the raw code of the script, used for updates. */
    downloadUrl?: string;
    /** A webpage where users can get more information about the script. */
    webpage?: string;
    /**
     * Whether the browser needs to be reloaded after the plugin is added.
     * If set to "ingame" it will only reload if the user is currently in a game.
     */
    reloadRequired?: boolean | "ingame";
    /**
     * A list of libraries that the plugin requires to start.
     * Libraries are formatted like "[name]" or "[name] | [downloadUrl]".
     */
    libs?: string[];
    /**
     * A list of libraries that the plugin will optionally use.
     * Libraries are formatted like "[name]" or "[name] | [downloadUrl]".
     */
    optionalLibs?: string[];
    /** A list of gamemode ids that `api.net.onLoad` will only trigger in by default. */
    gamemodes?: string[];
    /** A message if the script should no longer be used. */
    deprecated?: string;
    /** A list of changes to display when the user updates to the current version. */
    changelog?: string[];
}

export interface WorkspaceConfig extends BaseConfig {
    /** Whether the project is one plugin or a workspace with multiple */
    type: "workspace";
    /**
     * Whether the script should be output in its own directory.
     * It is put in the base of the directory unless outdir is specified.
     */
    relativeOutput?: boolean;
    /** Whether plugins and libraries should be put in a /plugins/ and /libraries/ dir, respectively */
    splitPluginsAndLibraries?: boolean;
    /** Maps a short name to a path to a script */
    alias?: Record<string, string>;
}

export type Config = SingleConfig | WorkspaceConfig;

export interface GLConfig {
    default: Config;
}