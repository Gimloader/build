import { Plugin } from "esbuild";

export function logRebuildPlugin(onBuild: () => void): Plugin {
    return {
        name: "log-rebuild",
        setup(build) {
            let startTime = 0;

            build.onStart(() => {
                process.stdout.write("Building...");
                startTime = Date.now();
            });
            build.onEnd((result) => {
                let time = Math.ceil(Date.now() - startTime);
                console.log(`\rBuild completed in ${time}ms`);

                if(result.warnings.length > 0) {
                    console.warn(`\rBuild completed in ${time}ms with warnings: ${result.errors.map(e => e.text).join("\n")}`)
                }

                if(result.errors.length > 0) {
                    console.error(`\rBuild failed: ${result.errors.map(e => e.text).join("\n")}`)
                }

                onBuild();
            });
        }
    }
}