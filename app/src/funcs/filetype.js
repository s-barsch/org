
function Filetype(path) {
  switch (path.split('.').pop()) {
    case "txt":
      return "text"
    default:
      return "dir"
  }
}

export default Filetype;
