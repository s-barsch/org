
function orgSort(unsort) {
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
    }
    if (f.type === 'dir') {
      dirs.push(f);
      continue
    }
    files.push(f);
  }

  dirs.sort();
  files.sort().reverse();

  return dirs.concat(info).concat(files).concat(sort);
}

export { orgSort };
