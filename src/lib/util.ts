import fg from "fast-glob";
import _ from "lodash";

export interface ProjectFile {
  devPath: string;
  filePath: string;
}

interface RewriteRule {
  to: string;
  from: RegExp;
}

function findAll<T>(source: T[], target: T): number[] {
  const resultIndex: number[] = [];
  source.forEach((element, index) => {
    if (element === target) {
      resultIndex.push(index);
    }
  });
  return resultIndex;
}

export function GetProjectFiles(path: string, file: string): ProjectFile[] {
  const allFiles = fg.sync(`src/**/${file}`.replace("//", "/"));
  const files: ProjectFile[] = [];
  allFiles.forEach(element => {
    const devPathArray: string[] = [];
    const pathDir = element.split("/");
    const pagesIndex = findAll<string>(pathDir, "pages");
    pagesIndex.forEach(index => {
      if (index + 1 < pathDir.length) devPathArray.push(pathDir[index + 1]);
    });
    const devPath = _.join(devPathArray, "/");
    files.push({
      devPath: devPath,
      filePath: "/" + element
    });
  });
  return files;
}

/**
 * Get all rewrite rules
 *
 * @export
 * @param {string} path - @default 'pages'
 * @param {string} file - @default 'index.html'
 */
export function GetRewriteRules(path: string, file: string, defaultEntry: string): RewriteRule[] {
  const projectFiles: ProjectFile[] = GetProjectFiles(path, file);

  let indexFile = projectFiles.find((file) => file.devPath === defaultEntry);
  if (!indexFile) indexFile = {
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


  projectFiles.map(element => {
    rewrites.push({
      to: element.filePath,
      from: new RegExp(`^/${element.devPath}$`)
    });
    rewrites.push({
      to: element.filePath,
      from: new RegExp(`^/${element.devPath}/$`)
    });
    rewrites.push({
      to: element.filePath,
      from: new RegExp(`^/${element.devPath}/${file}$`)
    });
  });

  return rewrites;
}

export function GetBuildInputFiles(path: string, file: string): Record<string, string> {
  const projectFiles = GetProjectFiles(path, file);

  const builds: Record<string, string> = {};

  projectFiles.map(element => {
    builds[element.devPath] = element.filePath;
  });

  return builds;
}

// export function GetBuildInputFiles(path: string, file: string): Record<string, string> {
//   const projectFiles = getProjectFiles(path, file);

//   const builds: Record<string, string> = {};

//   projectFiles.map(element => {
//     builds[element.devPath] = element.filePath
//   })

//   return builds;
// }