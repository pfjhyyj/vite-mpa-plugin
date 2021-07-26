import { Plugin, ViteDevServer } from "vite";
import { MpaOptions } from "./lib/options";
import history from "connect-history-api-fallback";
import { Request, Response } from "express-serve-static-core";
import { GetBuildInputFiles, GetRewriteRules } from "./lib/util";

const defaultOptions: MpaOptions = {
  file: "index.html",
  path: "pages",
  defaultEntry: "index"
};

export default function mpa(userOptions: MpaOptions = defaultOptions): Plugin {
  return {
    name: "vite-mpa-plugin",
    enforce: "pre",
    config(config) {
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
    }
  };
}