// Simple test to check if the API file has correct syntax
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'api', 'scrape', 'route.ts');
const content = fs.readFileSync(filePath, 'utf8');

console.log('Checking syntax of scrape route...');
console.log('File length:', content.length);
console.log('Contains return statement:', content.includes('return'));
console.log('Contains forEach:', content.includes('forEach'));

// Check for problematic patterns
const lines = content.split('\n');
let inForEach = false;
let forEachLevel = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.includes('forEach')) {
    inForEach = true;
    forEachLevel++;
  }
  
  if (line.includes('}') && inForEach) {
    forEachLevel--;
    if (forEachLevel === 0) {
      inForEach = false;
    }
  }
  
  if (inForEach && line.startsWith('return ') && !line.includes('return {')) {
    console.log(`WARNING: Found return statement inside forEach at line ${i + 1}: ${line}`);
  }
}

console.log('Syntax check completed!');
