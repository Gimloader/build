#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import build from './build/build.js';
import serve from './serve/serve.js';
import serveFile from './serve/servefile.js';
import sign from './sign.js';

const manualDescription = "Only re-build the script when sending an input in the terminal";
const pathDescription = "In workspace mode, the path to the script to build";
const allDescription = "Builds all aliased scripts in workspace mode";

const signPathDescription = "In workspace mode, the path to the script to sign";
const signAllDescription = "Signs all aliased scripts in workspace mode";
const signJwkDescription = "A json file containing a JSON web key to use for signing";

yargs(hideBin(process.argv))
    .scriptName("gimloader")
    .command("build [path..]", "Builds a script", (yargs) => {
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
    .command("sign [path..]", "Signs a script", (yargs) => {
        yargs.positional("path", { describe: signPathDescription, type: "string" })
            .option("all", { alias: "a", describe: signAllDescription, type: "boolean" })
            .option("jwk", { describe: signJwkDescription, demandOption: true, type: "string" });
    }, sign)
    .demandCommand(1)
    .help()
    .argv;