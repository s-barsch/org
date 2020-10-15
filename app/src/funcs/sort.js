
function divide(unsort) {
  if (!unsort) {
    return [];
  }

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
    sort: sort
  }
}

function join(a) {
  return a.dirs.concat(a.info).concat(a.files).concat(a.sort);
}

function separate(unsort) {
  if (!unsort) {
    return [];
  }

  return join(divide(unsort));
}

function orgSort(unsort) {
  if (!unsort) {
    return [];
  }

  let a = divide(unsort)

  a.dirs.sort(sortFn);
  a.files.sort(sortFn).reverse();

  return join(a)
}

function sortFn(a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

export { separate, orgSort };
