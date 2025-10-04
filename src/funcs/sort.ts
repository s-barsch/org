import File from './files';

type Divided = {
    dirs: File[];
    files: File[];
    info: File;
    sort: File;
}

function isSysFile(name: string): boolean {
    return name === 'info' || name === '.sort';
}

export function skim(files: File[]): File[] {
    return files.filter(x => !isSysFile(x.name))
}

function divide(unsort: File[]): Divided {
    let dirs: File[] = [];
    let files: File[] = [];
    let info = {} as File;
    let sort = {} as File;

    for (const f of unsort) {
        if (isSysFile(f.name)) {
            continue
        }

        if (f.type === 'dir') {
            dirs.push(f);
            continue
        }
        
        files.push(f);
    }

    return {
        dirs: dirs,
        files: files,
        info: info,
        sort: sort,
    }
}

export function joinDivided(d: Divided): File[] {
    let files = d.files

    if (Object.keys(d.info).length !== 0) {
        files = [d.info].concat(files)
    }

    if (Object.keys(d.sort).length !== 0) {
        files = files.concat([d.sort])
    }

    return d.dirs.concat(files);
}

export function separate(unsort: File[]): File[] {
    return joinDivided(divide(unsort));
}

export function isOrdered(files: File[]): boolean {
    let sorted = orgSort(files);

    return files.length !== sorted.length || !files.every((v, i) => v.name === sorted[i].name);
}

export function isSortFile(f: File): boolean {
    return f.name === ".sort"
}

export function orgSort(unsort: File[]): File[] {
    let d = divide(unsort)

    d.dirs.sort(sortFn);
    d.files.sort(sortFn);

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
