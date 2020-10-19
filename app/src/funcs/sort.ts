import File from './file';

type Divided = {
    dirs: File[];
    info: File[];
    files: File[];
    sort: File[];
}

function divide(unsort: File[]): Divided {

    let dirs = [];
    let info = [];
    let files = [];
    let sort = [];

    for (const f of unsort) {
        switch (f.name) {
            case 'info':
                info.push(f);
                continue;
            case '.sort':
                sort.push(f);
                continue;
            default:
        }
        if (f.type === 'dir') {
            dirs.push(f);
            continue
        }
        files.push(f);
    }

    return {
        dirs: dirs,
        info: info,
        files: files,
        sort: sort,
    }
}

function joinDivided(d: Divided): File[] {
    return d.dirs.concat(d.info).concat(d.files).concat(d.sort);
}

export function separate(unsort: File[]): File[] {
    return joinDivided(divide(unsort));
}

export function orgSort(unsort: File[]): File[] {
    let d = divide(unsort)

    d.dirs.sort(sortFn);
    d.files.sort(sortFn).reverse();

    return joinDivided(d);
}

function sortFn(a: File, b: File): number {
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}
