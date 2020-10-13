
function orgSort(unsort) {
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

  dirs.sort(sortFn);
  files.sort(sortFn).reverse();

  return dirs.concat(info).concat(files).concat(sort);
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

export { orgSort };
