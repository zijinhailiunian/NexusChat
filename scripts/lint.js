#!/usr/bin/env node
const { execSync } = require('node:child_process');
const fs = require('node:fs');

function getFiles() {
  const output = execSync('git ls-files', { encoding: 'utf8' });
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((file) => file.endsWith('.js'));
}

const files = getFiles();

for (const file of files) {
  if (!fs.existsSync(file)) {
    continue;
  }

  execSync(`node --check ${file}`, { stdio: 'pipe' });

  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('\r\n')) {
    throw new Error(`${file}: CRLF line endings detected. Use LF only.`);
  }
}

console.log(`Lint passed for ${files.length} JavaScript files.`);
