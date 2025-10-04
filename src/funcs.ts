import { dirname, join } from 'path-browserify';
import { isText, newTimestamp } from './funcs/paths';

export function newFilePath(path: string): string {
    const dirPath = isText(path) ? dirname(path) : path;
    return join(dirPath, newTimestamp() + ".txt");
}