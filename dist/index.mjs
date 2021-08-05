// src/index.ts
import history from "connect-history-api-fallback";

// src/lib/util.ts
import fg from "fast-glob";
import _ from "lodash";
function findAll(source, target) {
  const resultIndex = [];
  source.forEach((element, index) => {
    if (element === target) {
      resultIndex.push(index);
    }
  });
  return resultIndex;
}
function GetProjectFiles(path2, file) {
  const allFiles = fg.sync(`src/**/${file}`.replace("//", "/"));
  const files = [];
  allFiles.forEach((element) => {
    const devPathArray = [];
    const pathDir = element.split("/");
    const pagesIndex = findAll(pathDir, "pages");
    pagesIndex.forEach((index) => {
      if (index + 1 < pathDir.length)
        devPathArray.push(pathDir[index + 1]);
    });
    const devPath = _.join(devPathArray, "/");
    files.push({
      devPath,
      filePath: "/" + element
    });
  });
  return files;
}
function GetRewriteRules(path2, file, defaultEntry) {
  const projectFiles = GetProjectFiles(path2, file);
  let indexFile = projectFiles.find((file2) => file2.devPath === defaultEntry);
  if (!indexFile)
    indexFile = {
      devPath: "",
      filePath: "index.html"
    };
  const rewrites = [];
  rewrites.push({
    to: indexFile.filePath,
    from: /^\/$/
  });
  rewrites.push({
    to: indexFile.filePath,
    from: /^\/index.html$/
  });
  projectFiles.map((element) => {
    rewrites.push({
      to: element.filePath,
      from: new RegExp(`^/${element.devPath}`)
    });
    rewrites.push({
      to: element.filePath,
      from: new RegExp(`^/${element.devPath}/`)
    });
    rewrites.push({
      to: element.filePath,
      from: new RegExp(`^/${element.devPath}/${file}$`)
    });
  });
  return rewrites;
}
function GetBuildInputFiles(path2, file) {
  const projectFiles = GetProjectFiles(path2, file);
  const builds = {};
  projectFiles.map((element) => {
    builds[element.devPath] = element.filePath;
  });
  return builds;
}

// src/index.ts
import shell from "shelljs";
import path from "path";
var defaultOptions = {
  file: "index.html",
  path: "pages",
  defaultEntry: "index"
};
function mpa(userOptions = defaultOptions) {
  let resolvedConfig;
  return {
    name: "vite-mpa-plugin",
    enforce: "pre",
    config(config) {
      var _a, _b;
      resolvedConfig = config;
      config.build = (_a = config.build) != null ? _a : {};
      config.build.rollupOptions = (_b = config.build.rollupOptions) != null ? _b : {};
      config.build.rollupOptions.input = GetBuildInputFiles(userOptions.path, userOptions.file);
    },
    configureServer(server) {
      return () => {
        const handler = history({
          rewrites: GetRewriteRules(userOptions.path, userOptions.file, userOptions.defaultEntry)
        });
        server.middlewares.use((req, res, next) => {
          if (req.url === "/index.html" && req.originalUrl !== req.url) {
            req.url = req.originalUrl;
          }
          handler(req, res, next);
        });
      };
    },
    closeBundle() {
      const root = resolvedConfig.root || process.cwd();
      const dest = resolvedConfig.build && resolvedConfig.build.outDir || "dist";
      const resolve = (p) => path.resolve(root, p);
      const buildFiles = GetProjectFiles(userOptions.path, userOptions.file);
      shell.rm("-rf", resolve(`${dest}/*.html`));
      buildFiles.forEach((element) => {
        shell.mkdir("-p", resolve(`${dest}/${element.devPath}`));
        shell.mv(resolve(`${dest}${element.filePath}`), resolve(`${dest}/${element.devPath}/index.html`));
      });
      shell.rm("-rf", resolve(`${dest}/src`));
    }
  };
}
export {
  mpa as default
};
