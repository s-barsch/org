const fill = str => {
  return str.length < 2 ? "0" + str : str
};

export default function NewTimestamp() {
  let d = new Date();
  return d.getFullYear().toString().substr(2) +
    fill((d.getMonth() + 1).toString()) +
    fill(d.getDate().toString()) +
    "_" + 
    fill(d.getHours().toString()) +
    fill(d.getMinutes().toString()) +
    fill(d.getSeconds().toString());
}
