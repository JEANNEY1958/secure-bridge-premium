const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log('Source does not exist:', src);
    return;
  }
  
  fs.mkdirSync(dest, { recursive: true });
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log('Copied:', srcPath, '->', destPath);
    }
  }
}

const srcRenderer = path.join(__dirname, '..', 'src', 'renderer');
const destRenderer = path.join(__dirname, '..', 'dist', 'renderer');

console.log('Copying renderer files...');
copyDir(srcRenderer, destRenderer);
console.log('Done!');
