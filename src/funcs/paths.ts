import { basename, extname, dirname } from 'path';

/* date */

function fill(str: string): string {
    return str.length < 2 ? "0" + str : str
};

export function newTimestamp(): string {
    let d = new Date();
    return d.getFullYear().toString().substr(2) +
        fill((d.getMonth() + 1).toString()) +
        fill(d.getDate().toString()) +
        "_" + 
        fill(d.getHours().toString()) +
        fill(d.getMinutes().toString()) +
        fill(d.getSeconds().toString());
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
    if (section(path) === "public") {
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
