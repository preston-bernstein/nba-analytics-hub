import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function findCoverageFiles() {
  try {
    const output = execSync("find . -name 'lcov.info' -print", {
      encoding: 'utf8',
    });
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch (error) {
    console.error('Failed to locate coverage files:', error);
    return [];
  }
}

function formatPercent(hit, total) {
  if (total === 0) return '100.00';
  return ((hit / total) * 100).toFixed(2);
}

const coverageFiles = findCoverageFiles();

if (coverageFiles.length === 0) {
  console.warn('No lcov.info files found. Run tests with coverage first.');
  process.exit(1);
}

let totalLines = 0;
let coveredLines = 0;
let totalBranches = 0;
let coveredBranches = 0;

const mergedContent = [];

for (const file of coverageFiles) {
  const content = readFileSync(file, 'utf8');
  mergedContent.push(content);

  for (const line of content.split('\n')) {
    if (line.startsWith('LF:')) {
      totalLines += Number(line.slice(3));
    } else if (line.startsWith('LH:')) {
      coveredLines += Number(line.slice(3));
    } else if (line.startsWith('BRF:')) {
      totalBranches += Number(line.slice(4));
    } else if (line.startsWith('BRH:')) {
      coveredBranches += Number(line.slice(4));
    }
  }
}

const mergedPath = resolve('merged.info');
writeFileSync(mergedPath, mergedContent.join('\n'), 'utf8');

console.log('Merged coverage written to', mergedPath);
console.log('--- Aggregate Coverage ---');
console.log('Lines   :', formatPercent(coveredLines, totalLines) + '%', `(${coveredLines}/${totalLines})`);
console.log('Branches:', formatPercent(coveredBranches, totalBranches) + '%', `(${coveredBranches}/${totalBranches})`);
