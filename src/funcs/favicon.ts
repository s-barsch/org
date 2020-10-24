import { section } from 'funcs/paths';

function getFavicon(): HTMLLinkElement {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!favicon) {
        throw new Error("Cannot get favicon.");
    }
    return favicon;
}

export function setFavicon(path: string) {
    let favicon = getFavicon();
    favicon.href = faviconPath(path);
}

export function blinkFavicon(path: string) {
    let favicon = getFavicon();
    favicon.href = "/blue.svg";
    setTimeout(() => {
        if (!favicon) return;
        favicon.href = faviconPath(path);
    }, 100);
}

function faviconPath(path: string): string {
    return "/" + section(path) + ".svg"
}

