import { section } from 'funcs/paths';

function getFavicon(): HTMLLinkElement | null {
    return document.querySelector<HTMLLinkElement>('link[rel="icon"]');
}

export function setFavicon(path: string) {
    let favicon = getFavicon();
    if (!favicon) {
        throw new Error("Cannot set favicon.");
    }
    favicon.href = faviconPath(path);
}

export function blinkFavicon(path: string) {
    let favicon = getFavicon();
    if (!favicon) return;
    favicon.href = "/blue.svg";
    setTimeout(() => {
        if (!favicon) return;
        favicon.href = faviconPath(path);
    }, 100);
}

function faviconPath(path: string): string {
    return "/" + section(path) + ".svg"
}

