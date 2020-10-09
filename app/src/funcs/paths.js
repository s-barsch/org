const Base = path => {
  const i = path.lastIndexOf("/");
  if (i < 0 || path.length < i + 1) {
    return path
  }
  return path.substr(i + 1)
}

const Dir = path => {
  const i = path.lastIndexOf("/");
  if (i < 0) {
    return path
  }
  return path.substr(0, i)
}

const ExtendedBase = path => {
  const base = Base(path);
  if (base.length > 2 && base !== "bot" && base !== "/") {
    return base
  }
  return Base(Dir(path)) + "/" + base
}

export { ExtendedBase, Base, Dir };
