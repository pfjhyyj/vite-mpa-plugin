import { Plugin } from 'vite';

interface MpaOptions {
    path: string;
    file: string;
    defaultEntry: string;
}

declare function mpa(userOptions?: MpaOptions): Plugin;

export default mpa;
