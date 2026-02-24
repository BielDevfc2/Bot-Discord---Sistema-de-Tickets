const fs = require('fs');
const path = require('path');

function ensureFile(filePath, initial = {}) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify(initial, null, 2));
}

function readJson(filePath) {
  try {
    ensureFile(filePath, {});
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (err) {
    console.error(`jsonDb.readJson error for ${filePath}:`, err);
    return {};
  }
}

function writeJson(filePath, data) {
  try {
    ensureFile(filePath, {});
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`jsonDb.writeJson error for ${filePath}:`, err);
    return false;
  }
}

module.exports = { ensureFile, readJson, writeJson };
