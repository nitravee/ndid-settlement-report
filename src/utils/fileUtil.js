const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

function zipDir(originalDirPath, destZipPath) {
  return new Promise((resolve, reject) => {
    const fileOutput = fs.createWriteStream(destZipPath);    
    const archive = archiver('zip');

    fileOutput.on('close', () => {
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(fileOutput);
    const destPathInZip = path.basename(originalDirPath);
    archive.directory(originalDirPath, destPathInZip);
    archive.finalize();
  });
}

module.exports = {
  zipDir,
};
