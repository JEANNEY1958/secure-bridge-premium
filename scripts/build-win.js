const packager = require('electron-packager');
const electronInstaller = require('electron-winstaller');
const path = require('path');
const fs = require('fs');

async function buildWindows() {
  console.log('Step 1: Packaging with electron-packager...');
  
  const appPaths = await packager({
    dir: '.',
    name: 'Secure Bridge Premium',
    platform: 'win32',
    arch: 'x64',
    out: 'release',
    overwrite: true,
    icon: null,
    ignore: [/node_modules\/electron-packager/, /node_modules\/electron-winstaller/, /\.git/, /release/]
  });
  
  console.log('Packaged to:', appPaths);
  
  const appPath = appPaths[0];
  
  console.log('Step 2: Creating Windows installer...');
  
  const releaseDir = path.join(__dirname, '..', 'release', 'installer');
  if (!fs.existsSync(releaseDir)) {
    fs.mkdirSync(releaseDir, { recursive: true });
  }
  
  try {
    await electronInstaller.createWindowsInstaller({
      appDirectory: appPath,
      outputDirectory: releaseDir,
      authors: 'Xchange Suite',
      exe: 'Secure Bridge Premium.exe',
      setupExe: 'SecureBridgePremium-Setup.exe',
      noMsi: true,
      skipUpdateIcon: true
    });
    
    console.log('Windows installer created successfully!');
    console.log('Output:', path.join(releaseDir, 'SecureBridgePremium-Setup.exe'));
  } catch (e) {
    console.error('Installer creation failed:', e);
    console.log('Falling back to zip...');
    
    const archiver = require('archiver');
    const output = fs.createWriteStream(path.join(__dirname, '..', 'release', 'SecureBridgePremium-1.0.0-win.zip'));
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      console.log('ZIP created:', archive.pointer() + ' bytes');
    });
    
    archive.pipe(output);
    archive.directory(appPath, false);
    await archive.finalize();
  }
}

buildWindows().catch(console.error);
