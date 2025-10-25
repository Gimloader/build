#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import build from './build/build.js';
import serve from './serve/serve.js';
import serveFile from './serve/servefile.js';

const manualDescription = "Only re-build the script when sending an input in the terminal";
const pathDescription = "In workspace mode, the path to the script to build";
const allDescription = "Builds all aliased plugins in workspace mode";

yargs(hideBin(process.argv))
    .scriptName("gimloader")
    .command("build [path..]", "Builds the plugin", (yargs) => {
        yargs.positional("path", { describe: pathDescription, type: "string" })
            .option("all", { alias: "a", describe: allDescription, type: "boolean" });
    }, build)
    .command("serve [path]", "Serves a script to be tested in the browser", (yargs) => {
        yargs.positional("path", { describe: pathDescription, type: "string" })
            .option("manual", { alias: "m", description: manualDescription, type: "boolean" });
    }, serve)
    .command("servefile <file>", "Serves a script from a file to be tested in the browser", (yargs) => {
        yargs.positional("file", { describe: "The file to serve", type: "string" })
            .option("manual", { alias: "m", description: manualDescription, type: "boolean" });
    }, serveFile)
    .demandCommand(1)
    .help()
    .argv;