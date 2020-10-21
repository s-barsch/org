import { basename, extname, dirname } from 'path';

/* date */

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
