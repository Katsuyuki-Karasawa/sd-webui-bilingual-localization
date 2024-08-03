// Load file
export function readFile(filePath) {
  const request = new XMLHttpRequest();
  request.open("GET", `file=${filePath}`, false);
  request.send(null);
  return request.responseText;
}
