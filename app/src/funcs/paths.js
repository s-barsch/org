import { basename, extname, dirname } from 'path';

/* date */

const fill = str => {
  return str.length < 2 ? "0" + str : str
};

const newTimestamp = () => {
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

const filetype = path => {
  switch (path.split('.').pop()) {
    case "txt":
      return "text"
    default:
      return "dir"
  }
}

/* names */

const orgBase = path => {
  if (path === "/") {
    return "org"
  }
  return basename(path);
}

const extendedBase = path => {
  const base = orgBase(path);
  if (base.length > 2 && base !== "bot" && base !== "/") {
    return base
  }
  return basename(dirname(path)) + "/" + base
}

/* section */

const section = path => {
  if (path.substr(0, 7) === "/public") {
    return "public"
  }
  return "private"
}

const isPublic = path => {
  if (section(path) === "public") {
    return true
  }
  return false
}

function isText(path) {
  const file = basename(path);
  if (file === "info" || file === ".sort") {
    return true;
  }
  switch (extname(path)) {
    case ".txt":
    case ".info":
      return true;
    default:
      return false;
  }
}


export { extendedBase, orgBase, section, isPublic, isText, filetype, newTimestamp };
