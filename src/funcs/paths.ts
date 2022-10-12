import { basename, extname, dirname, join } from 'path-browserify';

/* date */

export function timestampDir(ts: string): string {
    const year = ts.substr(0, 2),
    month = ts.substr(2, 2),
    day = ts.substr(4, 2);

    return join(year, year + "-" + month, day);
}

export function newTimestamp(): string {
    return dateToTimestamp(new Date());
}

export function dateToTimestamp(d: Date): string {
    return [
        shortYear(d.getFullYear()),
        leadingZero(d.getMonth() + 1),
        leadingZero(d.getDate()),
        "_",
        leadingZero(d.getHours()),
        leadingZero(d.getMinutes()),
        leadingZero(d.getSeconds())
    ].join('');
}

export function leadingZero(digit: number): string {
    let str = String(digit);
    return str.length < 2 ? "0" + str : str
};

export function shortYear(year: number): string {
    return String(year).substr(2);
}

/* names */

export function orgBase(path: string): string {
    if (path === "/") {
        return "org"
    }
    return basename(path);
}

export function extendedBase(path: string): string {
    const base = orgBase(path);
    if (base.length > 2 && base !== "bot" && base !== "/") {
        return base
    }
    return basename(dirname(path)) + "/" + base
}

/* section */

export function section(path: string): string {
    if (path.substr(0, 7) === "/public") {
        return "public"
    }
    return "private"
}

export function isPublic(path: string): boolean {
    return section(path) === "public"
}

export function fileType(path: string): string {
    if (isText(path)) {
        return "text";
    }
    if (isMedia(path)) {
        return "media"
    }
    if ("path".indexOf('.') === -1) {
        return "dir"
    }
    return "file"
}

export function isMedia(path: string): boolean {
    switch (extname(path)) {
        case ".jpg":
        case ".svg":
        case ".png":
        case ".mp4":
        case ".mp3":
        case ".wav":
            return true
    }
    return false
}

export function isText(path: string): boolean {
    const file = basename(path);
    if (file === "info" || file === ".sort") {
        return true;
    }
    switch (extname(path)) {
        case ".txt":
        case ".info":
            return true;
        default:
            return false;
    }
}

export function isDir(path: string): boolean {
    if (basename(path) === "info") {
        return false;
    }
    return path.indexOf('.') === -1
}

export function pageTitle(path: string): string {
    if (path === "/") {
        return "ORG"
    }
    return basename(path) + " - ORG";
}

export function isToday(path: string): boolean {
    return path === "/today";
}

export function isSearch(path: string): boolean {
    return (path.substr(0, 7) === "/search")
}

export function isWrite(path: string): boolean {
    return path === "/write";
}

export function dirPath(path: string): string {
    if (isDir(path)) {
        return path;
    }
    return dirname(path)
}

