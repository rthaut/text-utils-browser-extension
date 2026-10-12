// Serves the manual test pages over http://localhost so the extension can run
// on them without "Allow access to file URLs", and so a frame can load from a
// second origin (127.0.0.1). Usage: npm run test-pages
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT) || 8058;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

createServer(async (request, response) => {
  const { pathname } = new URL(request.url, "http://localhost");
  const path = normalize(
    join(root, pathname.endsWith("/") ? `${pathname}index.html` : pathname),
  );

  if (!path.startsWith(root) || !types[extname(path)]) {
    response.writeHead(404).end("Not found");
    return;
  }

  try {
    const body = await readFile(path);
    response.writeHead(200, { "Content-Type": types[extname(path)] }).end(body);
  } catch {
    response.writeHead(404).end("Not found");
  }
}).listen(port, () => {
  console.log(`Test pages: http://localhost:${port}/`);
});
