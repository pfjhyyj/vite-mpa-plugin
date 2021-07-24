import fg from 'fast-glob';
import _ from 'lodash';

interface ProjectFile {
  devPath: string;
  filePath: string;
}

interface RewriteFile {
  to: string;
  from: string;
}

function getFilePath(filePath: string) {

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

function parseFiles(file: string, filePaths: string[]): ProjectFile[] {
  const files: ProjectFile[] = [];
  filePaths.forEach(element => {
    const devPathArray: string[] = [];
    const pathDir = element.split('/');
    const pagesIndex = findAll<string>(pathDir, 'pages');
    pagesIndex.forEach(index => {
      if (index + 1 < pathDir.length) devPathArray.push(pathDir[index + 1]);
    });
    const devPath = _.join(devPathArray, '/');
    files.push({
      devPath: devPath,
      filePath: file
    })
  })
  return files;
}

/**
 * Get all files that needed to be complied
 *
 * @export
 * @param {string} path - @default 'pages'
 * @param {string} file - @default 'index.html'
 */
export function GetSrcFiles(path: string, file: string) {
  const allFiles = fg.sync(`src/${path}/*/${file}`.replace("//", "/"));
  const projectFiles: ProjectFile[] = parseFiles(file, allFiles);
  const rewrites = projectFiles.map(element => {

  })
}