import { extendedBase } from './paths';

type Targets = {
    active: string;
    list: string[];
}

export default Targets; 

export function readTargets(): Targets {
    const storage = localStorage.getItem('targets');
    let t: Targets;

    if (storage === null) {
        t = {} as Targets;
    } else {
        t = JSON.parse(storage);
    }

    console.log(storage);

    t.active = t.active ? t.active : ''
    t.list = t.list ? t.list : [];

    return t;
}

export function storeTargets(t: Targets) {
    localStorage.setItem('targets', JSON.stringify(t));
}

export function addTarget(t: Targets, path: string): Targets {
    t.list = addToList(t.list, path);
    return t;
}

export function removeTarget(t: Targets, path: string): Targets {
    if (t.active === path) {
        t.active = '';
    }
    t.list = t.list.filter(target => ( target !== path ));
    return t;
}

export function setActiveTarget(t: Targets, path: string): Targets {
    t.list = addToList(t.list, path);
    t.active = path;
    return t;
}

export function unsetActiveTarget(t: Targets): Targets {
    t.active = '';
    return t;
}

export function nextActiveTarget(t: Targets): string {
    let i = 0;
    for (; i < t.list.length; i++) {
        if (t.list[i] === t.active) {
            if (t.list.length > i + 1) {
                return t.list[i+1];
            }

            if (t.list.length > 0) {
                return t.list[0];
            }
            break;
        }
    }
    return ""
}

function addToList(list: string[], str: string): string[] {
    for (const entry of list) {
        if (entry === str) {
            return list;
        }
    }
    list.push(str);
    list.sort(sortFn);
    return list;
}

function sortFn(a: string, b: string): number {
    const abase = extendedBase(a);
    const bbase = extendedBase(b);
    if (abase < bbase) {
        return -1;
    }
    if (abase > bbase) {
        return 1;
    }
    return 0;
}


