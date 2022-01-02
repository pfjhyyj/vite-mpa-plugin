import _ from "lodash";
import fg from "fast-glob";

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

/**
 * Get All Entry Files and parse them into ProjectFile Object
 *
 */
export function GetProjectFiles(src: string, prefix: string, file: string): ProjectFile[] {
  // Get all path to target html files
  const allFiles = fg.sync(`${src}/**/${file}`.replace("//", "/"));
  const files: ProjectFile[] = [];
  allFiles.forEach((element: string) => {
    const devPathArray: string[] = [];
    const pathDir = element.split("/");
    // get the dev path to the file
    const pagesIndex = findAll<string>(pathDir, prefix);
    pagesIndex.forEach(index => {
      if (index + 1 < pathDir.length) devPathArray.push(pathDir[index + 1]);
    });
    const devPath = _.join(devPathArray, "/");
    files.push({
      devPath: devPath,
      filePath: element
    });
  });
  return files;
}

/**
 * Get all rewrite rules
 *
 */
export function GetRewriteRules(src: string, prefix: string, file: string, defaultEntry: string): RewriteRule[] {
  const projectFiles: ProjectFile[] = GetProjectFiles(src, prefix, file);

  let indexFile = projectFiles.find((file) => file.devPath === defaultEntry);
  if (!indexFile) indexFile = {
    devPath: "",
    filePath: "index.html"
  };

  const rewrites = [];
  rewrites.push({
    to: "/" + indexFile.filePath,
    from: /^\/$/
  });
  rewrites.push({
    to: "/" + indexFile.filePath,
    from: /^$/
  });
  rewrites.push({
    to: "/" + indexFile.filePath,
    from: /^\/index.html$/
  });


  projectFiles.map(element => {
    rewrites.push({
      to: "/" + element.filePath,
      from: new RegExp(`^/${element.devPath}`)
    });
    rewrites.push({
      to: "/" + element.filePath,
      from: new RegExp(`^/${element.devPath}/`)
    });
    rewrites.push({
      to: "/" + element.filePath,
      from: new RegExp(`^/${element.devPath}/${file}$`)
    });
  });

  return rewrites;
}

export function GetBuildInputFiles(src: string, prefix: string, file: string): Record<string, string> {
  const projectFiles = GetProjectFiles(src, prefix, file);

  const builds: Record<string, string> = {};

  projectFiles.map(element => {
    builds[element.devPath] = element.filePath;
  });

  return builds;
}