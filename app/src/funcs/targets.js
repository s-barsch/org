import { extendedBase } from './paths';

const removeTarget = path => {
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

const getActive = () => {
  const str = localStorage.getItem("target");
  if (str === null) {
    return ""
  }
  return str
}

const nextActive = path => {
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

const unsetActive = () => {
  localStorage.setItem("target", nextActive());
}

const setActive = path => {
  addTarget(path);
  localStorage.setItem("target", path);
}

const addTarget = path => {
  let l = getList();
  for (const target of l) {
    if (target === path) {
      return
    }
  }
  l.push(path);
  setList(l);
}

const setList = list => {
  localStorage.setItem("targetList", JSON.stringify(list))
}

const getList = () => {
  const str = localStorage.getItem("targetList");
  if (str === null) {
    return []
  }
  const list = JSON.parse(str);

  return list.sort(function(a, b) {
    const abase = extendedBase(a);
    const bbase = extendedBase(b);
    if (abase < bbase) {
      return -1;
    }
    if (abase > bbase) {
      return 1;
    }
    return 0;
  })
}

export { setActive, getActive, getList, unsetActive, removeTarget };
