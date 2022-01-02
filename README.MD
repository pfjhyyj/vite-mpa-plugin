# vite-mpa-plugin

## Plugin Options
All parameters are required!
- Source Folder
default: src/
- Page Prefix
default: pages
- File name
default: index.html
- Default Entry
default: index
Use the dev path to set default entry.
## Path Pattern
```
{source folder}/{page prefix}/{your page name}/{page html file}
```

### example
```
/src/pages/index.html -> /
/src/pages/a/index.html -> /a/ 
/src/pages/a/pages/b/index.html -> /a/b
```

### Equivalent Path
The three paths below are equivalent.
```
/a
/a/
/a/index.html
```