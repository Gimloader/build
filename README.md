# @gimloader/build

This is a package that provides a preconfigured bundler to help build more complex [Gimloader](https://github.com/Gimloader/Gimloader) plugins and libraries.

## Setup

To get started, run `npm create @gimloader` in the directory you wish to create the script in. You can also install it globally by running `npm i -g @gimloader/build`, which you may want for commands such as servefile.

## Config

There are two ways to set up using the bundler. You can either have one project per script, or a project with multiple workspaces for different scripts.

### Workspace Config

The configuration for the workspace is housed in the file gimloader.config.js in the root of your project.

##### Fields
- `type`: Must be set to "workspace" to enable workspace mode.
- `outdir`: The directory to output scripts in. "./build" by default.
- `relativeOutput`: Whether to output the bundled scripts relative to their folder.
- `splitPluginsAndLibraries`: Whether to output plugins in a /plugins/ and libraries in a /libraries/ directory.
- `alias`: An object mapping short names for scripts to the path to them.
- `plugins`: An array of Esbuild plugins to use.
- `esbuildOptions`: Options to pass to esbuild.

### Script Config

Config is housed in the file gimloader.config.js in the folder where the script is. This will be the root folder unless you're using workspace mode.

##### Mandatory Fields
- `input`: The input file that will be compiled.
- `name`: The name of the script.
- `description`: A brief description of the script.
- `author`: The author of the script.

##### Optional Fields
- `version`: The version of the script.
- `downloadUrl`: The download URL for the script, used by Gimloader for updates.
- `reloadRequired`: Set to true if the script needs a reload to take effect, or set to "ingame" if it only needs a reload when in-game.
- `libs`: A list of libraries to load. These strings should look like either "[library name]" or "[library name] | [download url]".
- `optionalLibs`: The same as libs, but the plugin will still be run without these libraries.
- `gamemodes`: A list of gamemode ids that `api.net.onLoad` will only trigger in by default.
- `outdir`: Where to output the bundled script ("./build" by default). Set to null for the directory root.
- `plugins`: An array of Esbuild plugins to use.
- `esbuildOptions`: Options to pass to esbuild.
- `deprecated`: A message if the script should no longer be used.

##### Plugin Fields (Optional)
- `hasSettings`: Set to true if the plugin has a settings menu, so the button can be shown when it is disabled.

##### Library Fields
- `isLibrary`: Set to true if you are building a library.

### Building

Running `npx gimloader build [...paths or aliases]` will compile the script and output it to `build/[plugin name].js`. Paths are only necessary in workspace mode. Passing the --all parameter in workspace mode will build all aliased plugins.

### Hot Reload

Running `npx gimloader serve [path or alias]` will start a local server to host the script. Paths are only necessary in workspace mode. If the "Poll for plugins/libraries being served locally" setting is enabled on Gimloader, it will automatically detect changes to the script and reload it. By default, the plugin will be built whenever you save its files, but passing --manual will change it to only build when pressing enter in the terminal.

### Serving a single file

You can run `npx gimloader servefile <file>` to serve a single javscript file, which will automatically reload when the file is changed. Similarly to `gimloder serve`, passing --manual will change it to only update when pressing enter in the terminal.