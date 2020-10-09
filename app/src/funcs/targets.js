
const removeTarget = path => {
  let l = getTargetList().filter( target => {
    if (target !== path) {
      return true
    }
    return false
  });
  setTargetList(l);
}

const isTarget = path => {
  let l = getTargetList();
  for (const target of l) {
    if (target === path) {
      return true
    }
  }
  return false
}

const addTarget = path => {
  let l = getTargetList();
  for (const target of l) {
    if (target === path) {
      return
    }
  }
  l.push(path)
  setTargetList(l);
}

const setTargetList = list => {
  localStorage.setItem("targets", JSON.stringify(list))
}

const getTargetList = () => {
  const str = localStorage.getItem("targets");
  if (str === null) {
    return []
  }
  return JSON.parse(str)
}

export { addTarget, getTargetList, isTarget, removeTarget};
