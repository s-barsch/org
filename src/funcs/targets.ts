import { extendedBase } from './paths';

export function removeTarget(path: string) {
  if (getActive() === path) {
    unsetActive();
  }
  let l = getList().filter( target => {
    if (target !== path) {
      return true
    }
    return false
  });
  setList(l);
}

export function getActive(): string {
  const str = localStorage.getItem("target");
  if (str === null) {
    return ""
  }
  return str
}

export function nextActive(): string {
  const list = getList();
  const active = getActive();
  let i = 0;
  for (; i < list.length; i++) {
    if (list[i] === active) {
      break;
    }
  }
  if (list.length > i) {
    return list[i+1]
  }
  if (list.length > 0) {
    return list[0]
  }
  return ""
}

export function unsetActive() {
  localStorage.setItem("target", nextActive());
}

export function setActive(path: string) {
  addTarget(path);
  localStorage.setItem("target", path);
}

function addTarget(path: string) {
  let l = getList();
  for (const target of l) {
    if (target === path) {
      return
    }
  }
  l.push(path);
  setList(l);
}

function setList(list: string[]) {
  localStorage.setItem("targetList", JSON.stringify(list))
}

export function getList(): string[] {
  const str = localStorage.getItem("targetList");
  if (str === null) {
    return []
  }
  const list = JSON.parse(str);

  return list.sort(sortFn)
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
