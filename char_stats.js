const fs = require('fs');
const path = require('path');
const util = require('util');

const ignoreChars = /[a-z\s\n\d]/;
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];

// Parse command-line arguments
const args = util.parseArgs({
  allowPositionals: true,
  options: {}
});

if (args.positionals.length !== 1) {
  console.error('Provide (comma separated) paths as an argument');
  process.exit(1);
}

const directoryPaths = args.positionals[0].split(',');

function readFilesRecursively(dir) {
  const files = fs.readdirSync(dir);
  let allData = '';

  files.forEach(fileName => {
    const filePath = path.join(dir, fileName);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (fileName === 'node_modules' || fileName.startsWith('.')) {
        return;
      }
      allData += readFilesRecursively(filePath);
    } else if (stat.isFile() && (fileExtensions.some(ext => fileName.endsWith(ext)))) {
      allData += fs.readFileSync(filePath, 'utf8');
    }
  });

  return allData.toLowerCase();
}

const charCount = {};

for (const directoryPath of directoryPaths) {
  const data = readFilesRecursively(directoryPath);
  for (const char of data) {
    if (!ignoreChars.test(char)) {
      charCount[char] = (charCount[char] || 0) + 1;
    }
  }
}

const sortedCharCount = Object.entries(charCount).sort((a, b) => b[1] - a[1]);

console.log('Character counts (sorted by frequency):');
const chars = [];
for (const [char, count] of sortedCharCount) {
  if (count > 10) {
    console.log(`${char}: ${count}`);
    chars.push(char);
  }
}

console.log(chars.join(' '));