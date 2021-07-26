import { Plugin, UserConfig, ViteDevServer } from "vite";
import { MpaOptions } from "./lib/options";
import history from "connect-history-api-fallback";
import { Request, Response } from "express-serve-static-core";
import { GetBuildInputFiles, GetProjectFiles, GetRewriteRules, ProjectFile } from "./lib/util";
import shell from "shelljs";
import path from "path";

const defaultOptions: MpaOptions = {
  file: "index.html",
  path: "pages",
  defaultEntry: "index"
};

export default function mpa(userOptions: MpaOptions = defaultOptions): Plugin {
  let resolvedConfig: UserConfig;
  return {
    name: "vite-mpa-plugin",
    enforce: "pre",
    config(config) {
      resolvedConfig = config;
      // confirm the object exists
      config.build = config.build ?? {};
      config.build.rollupOptions = config.build.rollupOptions ?? {};

      config.build.rollupOptions.input = GetBuildInputFiles(userOptions.path, userOptions.file);
      // config.build.rollupOptions.output = 
    },
    configureServer(server: ViteDevServer) {
      return () => {
        const handler = history({
          // verbose: true,
          rewrites: GetRewriteRules(userOptions.path, userOptions.file, userOptions.defaultEntry)
        });
        server.middlewares.use((req, res, next) => {
          // vite sever will rewrite the url to '/index.html', reverse it to original url
          if (req.url === "/index.html" && req.originalUrl !== req.url) {
            req.url = req.originalUrl;
          }
          handler(req as Request, res as Response, next);
        });
      };
    },
    closeBundle() {
      const root = resolvedConfig.root || process.cwd();
      const dest = (resolvedConfig.build && resolvedConfig.build.outDir) || "dist";
      const resolve = (p: string) => path.resolve(root, p);

      const buildFiles = GetProjectFiles(userOptions.path, userOptions.file);

      // 2. remove all *.html at dest root
      shell.rm("-rf", resolve(`${dest}/*.html`));
      // 3. move src/pages/* to dest root
      buildFiles.forEach(element => {
        shell.mkdir("-p", resolve(`${dest}/${element.devPath}`));
        shell.mv(resolve(`${dest}${element.filePath}`), resolve(`${dest}/${element.devPath}/index.html`));
      });
      // 4. remove empty src dir
      shell.rm("-rf", resolve(`${dest}/src`));
    },

  };
}