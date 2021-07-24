import { Plugin, ViteDevServer } from "vite";
import { MpaOptions } from "./lib/options";
import history from "connect-history-api-fallback";
import { Request, Response } from "express-serve-static-core";


export default function mpa(userOptions: MpaOptions = {}): Plugin {
  return {
    name: "vite-mpa-plugin",
    configureServer(server: ViteDevServer) {
      return () => {
        const handler = history({
          disableDotRule: true,
          rewrites: [{from: /\/$/, to: () => "/index.html"}]
        });  
        server.middlewares.use((req, res, next) => {
          handler(req as Request, res as Response, next);
        });
      };
    }
  };
}