
/* date */

const fill = str => {
  return str.length < 2 ? "0" + str : str
};

const NewTimeStamp = () => {
  let d = new Date();
  return d.getFullYear().toString().substr(2) +
    fill((d.getMonth() + 1).toString()) +
    fill(d.getDate().toString()) +
    "_" + 
    fill(d.getHours().toString()) +
    fill(d.getMinutes().toString()) +
    fill(d.getSeconds().toString());
}

/* type */

const FileType = path => {
  switch (path.split('.').pop()) {
    case "txt":
      return "text"
    default:
      return "dir"
  }
}

/* names */

const Base = path => {
  if (path === "/") {
    return "org"
  }
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
  if (i === 0) {
    return "/"
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

/* section */

const Section = path => {
  if (path.substr(0, 7) === "/public") {
    return "public"
  }
  return "private"
}

const IsPublic = path => {
  if (Section(path) === "public") {
    return true
  }
  return false
}


export { ExtendedBase, Base, Dir, Section, IsPublic, FileType, NewTimeStamp };
