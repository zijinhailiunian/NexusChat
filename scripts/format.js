#!/usr/bin/env node
const { execSync } = require('node:child_process');
const fs = require('node:fs');

const checkOnly = process.argv.includes('--check');

const textExtensions = ['.js', '.json', '.md', '.sh', '.yml', '.yaml', '.txt', '.mjs'];

function isTextFile(file) {
  return textExtensions.some((ext) => file.endsWith(ext)) || file === '.gitignore' || file === '.editorconfig' || file === '.nvmrc';
}

function getFiles() {
  const output = execSync('git ls-files', { encoding: 'utf8' });
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter(isTextFile);
}

function normalize(content) {
  const lf = content.replace(/\r\n/g, '\n');
  const trimmedLineEndings = lf
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n');
  return trimmedLineEndings.endsWith('\n') ? trimmedLineEndings : `${trimmedLineEndings}\n`;
}

const changed = [];
for (const file of getFiles()) {
  if (!fs.existsSync(file)) {
    continue;
  }

  const content = fs.readFileSync(file, 'utf8');
  const normalized = normalize(content);

  if (content !== normalized) {
    changed.push(file);
    if (!checkOnly) {
      fs.writeFileSync(file, normalized, 'utf8');
    }
  }
}

if (changed.length > 0 && checkOnly) {
  console.error('Formatting issues found in:');
  for (const file of changed) console.error(`- ${file}`);
  process.exit(1);
}

if (checkOnly) {
  console.log('Format check passed.');
} else {
  console.log(`Formatted ${changed.length} file(s).`);
}
