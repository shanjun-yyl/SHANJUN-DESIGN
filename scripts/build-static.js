const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "dist");

const entriesToCopy = [
  "index.html",
  "_headers",
  "gallery.html",
  "portfolio.html",
  "styles.css",
  "script.js",
  "gallery.js",
  "about_logo.png",
  "vector_logo_source.png",
  "组 29.png",
  "组 30.png",
  "组 51.png",
  "顶部左侧logo.png",
  "严依伦个人作品集-2026-light.pdf",
  "assets",
  "vendor",
  "卡片板块",
];

function copyRecursive(source, target) {
  if (!fs.existsSync(source)) {
    return;
  }

  const stats = fs.statSync(source);
  if (stats.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(target, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const entry of entriesToCopy) {
  copyRecursive(path.join(root, entry), path.join(outDir, entry));
}

console.log("Static site built to dist/");
